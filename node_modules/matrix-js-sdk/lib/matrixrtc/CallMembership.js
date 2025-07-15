import _defineProperty from "@babel/runtime/helpers/defineProperty";
/*
Copyright 2023 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { deepCompare } from "../utils.js";
import { isLivekitFocusActive } from "./LivekitFocus.js";

/**
 * The default duration in milliseconds that a membership is considered valid for.
 * Ordinarily the client responsible for the session will update the membership before it expires.
 * We use this duration as the fallback case where stale sessions are present for some reason.
 */
export var DEFAULT_EXPIRE_DURATION = 1000 * 60 * 60 * 4;

/**
 * MSC4143 (MatrixRTC) session membership data.
 * Represents an entry in the memberships section of an m.call.member event as it is on the wire.
 **/

var checkSessionsMembershipData = (data, errors) => {
  var _data$focus_active;
  var prefix = "Malformed session membership event: ";
  if (typeof data.device_id !== "string") errors.push(prefix + "device_id must be string");
  if (typeof data.call_id !== "string") errors.push(prefix + "call_id must be string");
  if (typeof data.application !== "string") errors.push(prefix + "application must be a string");
  if (typeof ((_data$focus_active = data.focus_active) === null || _data$focus_active === void 0 ? void 0 : _data$focus_active.type) !== "string") errors.push(prefix + "focus_active.type must be a string");
  if (!Array.isArray(data.foci_preferred)) errors.push(prefix + "foci_preferred must be an array");
  // optional parameters
  if (data.created_ts && typeof data.created_ts !== "number") errors.push(prefix + "created_ts must be number");

  // application specific data (we first need to check if they exist)
  if (data.scope && typeof data.scope !== "string") errors.push(prefix + "scope must be string");
  return errors.length === 0;
};
export class CallMembership {
  static equal(a, b) {
    return deepCompare(a.membershipData, b.membershipData);
  }
  constructor(parentEvent, data) {
    this.parentEvent = parentEvent;
    _defineProperty(this, "membershipData", void 0);
    var sessionErrors = [];
    if (!checkSessionsMembershipData(data, sessionErrors)) {
      throw Error("unknown CallMembership data. Does not match MSC4143 call.member (".concat(sessionErrors.join(" & "), ") events this could be a legacy membership event: (").concat(data, ")"));
    } else {
      this.membershipData = data;
    }
  }
  get sender() {
    return this.parentEvent.getSender();
  }
  get eventId() {
    return this.parentEvent.getId();
  }
  get callId() {
    return this.membershipData.call_id;
  }
  get deviceId() {
    return this.membershipData.device_id;
  }
  get application() {
    return this.membershipData.application;
  }
  get scope() {
    return this.membershipData.scope;
  }
  get membershipID() {
    // the createdTs behaves equivalent to the membershipID.
    // we only need the field for the legacy member envents where we needed to update them
    // synapse ignores sending state events if they have the same content.
    return this.createdTs().toString();
  }
  createdTs() {
    var _this$membershipData$;
    return (_this$membershipData$ = this.membershipData.created_ts) !== null && _this$membershipData$ !== void 0 ? _this$membershipData$ : this.parentEvent.getTs();
  }

  /**
   * Gets the absolute expiry timestamp of the membership.
   * @returns The absolute expiry time of the membership as a unix timestamp in milliseconds or undefined if not applicable
   */
  getAbsoluteExpiry() {
    var _this$membershipData$2;
    // TODO: calculate this from the MatrixRTCSession join configuration directly
    return this.createdTs() + ((_this$membershipData$2 = this.membershipData.expires) !== null && _this$membershipData$2 !== void 0 ? _this$membershipData$2 : DEFAULT_EXPIRE_DURATION);
  }

  /**
   * @returns The number of milliseconds until the membership expires or undefined if applicable
   */
  getMsUntilExpiry() {
    // Assume that local clock is sufficiently in sync with other clocks in the distributed system.
    // We used to try and adjust for the local clock being skewed, but there are cases where this is not accurate.
    // The current implementation allows for the local clock to be -infinity to +MatrixRTCSession.MEMBERSHIP_EXPIRY_TIME/2
    return this.getAbsoluteExpiry() - Date.now();
  }

  /**
   * @returns true if the membership has expired, otherwise false
   */
  isExpired() {
    return this.getMsUntilExpiry() <= 0;
  }
  getPreferredFoci() {
    return this.membershipData.foci_preferred;
  }
  getFocusSelection() {
    var focusActive = this.membershipData.focus_active;
    if (isLivekitFocusActive(focusActive)) {
      return focusActive.focus_selection;
    }
  }
}
//# sourceMappingURL=CallMembership.js.map