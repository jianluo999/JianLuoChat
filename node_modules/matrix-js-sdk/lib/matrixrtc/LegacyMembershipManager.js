import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
/*
Copyright 2025 The Matrix.org Foundation C.I.C.

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

import { EventType } from "../@types/event.js";
import { UpdateDelayedEventAction } from "../@types/requests.js";
import { HTTPError, MatrixError } from "../http-api/errors.js";
import { logger } from "../logger.js";
import { EventTimeline } from "../models/event-timeline.js";
import { sleep } from "../utils.js";
import { DEFAULT_EXPIRE_DURATION } from "./CallMembership.js";
import { isLivekitFocusActive } from "./LivekitFocus.js";
import { Status } from "./types.js";
/**
 * This internal class is used by the MatrixRTCSession to manage the local user's own membership of the session.
 *
 * Its responsibitiy is to manage the locals user membership:
 *  - send that sate event
 *  - send the delayed leave event
 *  - update the delayed leave event while connected
 *  - update the state event when it times out (for calls longer than membershipExpiryTimeout ~ 4h)
 *
 * It is possible to test this class on its own. The api surface (to use for tests) is
 * defined in `MembershipManagerInterface`.
 *
 * It is recommended to only use this interface for testing to allow replacing this class.
 *
 * @internal
 * @deprecated Use {@link MembershipManager} instead
 */
export class LegacyMembershipManager {
  get networkErrorRetryMs() {
    var _ref, _this$joinConfig$netw, _this$joinConfig, _this$joinConfig2;
    return (_ref = (_this$joinConfig$netw = (_this$joinConfig = this.joinConfig) === null || _this$joinConfig === void 0 ? void 0 : _this$joinConfig.networkErrorRetryMs) !== null && _this$joinConfig$netw !== void 0 ? _this$joinConfig$netw : (_this$joinConfig2 = this.joinConfig) === null || _this$joinConfig2 === void 0 ? void 0 : _this$joinConfig2.callMemberEventRetryDelayMinimum) !== null && _ref !== void 0 ? _ref : 3000;
  }
  get membershipEventExpiryMs() {
    var _ref2, _this$joinConfig$memb, _this$joinConfig3, _this$joinConfig4;
    return (_ref2 = (_this$joinConfig$memb = (_this$joinConfig3 = this.joinConfig) === null || _this$joinConfig3 === void 0 ? void 0 : _this$joinConfig3.membershipEventExpiryMs) !== null && _this$joinConfig$memb !== void 0 ? _this$joinConfig$memb : (_this$joinConfig4 = this.joinConfig) === null || _this$joinConfig4 === void 0 ? void 0 : _this$joinConfig4.membershipExpiryTimeout) !== null && _ref2 !== void 0 ? _ref2 : DEFAULT_EXPIRE_DURATION;
  }
  get delayedLeaveEventDelayMs() {
    var _ref3, _ref4, _this$delayedLeaveEve, _this$joinConfig5, _this$joinConfig6;
    return (_ref3 = (_ref4 = (_this$delayedLeaveEve = this.delayedLeaveEventDelayMsOverride) !== null && _this$delayedLeaveEve !== void 0 ? _this$delayedLeaveEve : (_this$joinConfig5 = this.joinConfig) === null || _this$joinConfig5 === void 0 ? void 0 : _this$joinConfig5.delayedLeaveEventDelayMs) !== null && _ref4 !== void 0 ? _ref4 : (_this$joinConfig6 = this.joinConfig) === null || _this$joinConfig6 === void 0 ? void 0 : _this$joinConfig6.membershipServerSideExpiryTimeout) !== null && _ref3 !== void 0 ? _ref3 : 8000;
  }
  get delayedLeaveEventRestartMs() {
    var _ref5, _this$joinConfig$dela, _this$joinConfig7, _this$joinConfig8;
    return (_ref5 = (_this$joinConfig$dela = (_this$joinConfig7 = this.joinConfig) === null || _this$joinConfig7 === void 0 ? void 0 : _this$joinConfig7.delayedLeaveEventRestartMs) !== null && _this$joinConfig$dela !== void 0 ? _this$joinConfig$dela : (_this$joinConfig8 = this.joinConfig) === null || _this$joinConfig8 === void 0 ? void 0 : _this$joinConfig8.membershipKeepAlivePeriod) !== null && _ref5 !== void 0 ? _ref5 : 5000;
  }
  constructor(joinConfig, room, client, getOldestMembership) {
    var _this = this;
    this.joinConfig = joinConfig;
    this.room = room;
    this.client = client;
    this.getOldestMembership = getOldestMembership;
    _defineProperty(this, "relativeExpiry", void 0);
    _defineProperty(this, "memberEventTimeout", void 0);
    /**
     *   This is a Foci array that contains the Focus objects this user is aware of and proposes to use.
     */
    _defineProperty(this, "ownFociPreferred", void 0);
    /**
     *   This is a Focus with the specified fields for an ActiveFocus (e.g. LivekitFocusActive for type="livekit")
     */
    _defineProperty(this, "ownFocusActive", void 0);
    _defineProperty(this, "updateCallMembershipRunning", false);
    _defineProperty(this, "needCallMembershipUpdate", false);
    /**
     * If the server disallows the configured {@link delayedLeaveEventDelayMs},
     * this stores a delay that the server does allow.
     */
    _defineProperty(this, "delayedLeaveEventDelayMsOverride", void 0);
    _defineProperty(this, "disconnectDelayId", void 0);
    _defineProperty(this, "triggerCallMembershipEventUpdate", /*#__PURE__*/_asyncToGenerator(function* () {
      // TODO: Should this await on a shared promise?
      if (_this.updateCallMembershipRunning) {
        _this.needCallMembershipUpdate = true;
        return;
      }
      _this.updateCallMembershipRunning = true;
      try {
        // if anything triggers an update while the update is running, do another update afterwards
        do {
          _this.needCallMembershipUpdate = false;
          yield _this.updateCallMembershipEvent();
        } while (_this.needCallMembershipUpdate);
      } finally {
        _this.updateCallMembershipRunning = false;
      }
    }));
    _defineProperty(this, "delayDisconnection", /*#__PURE__*/_asyncToGenerator(function* () {
      try {
        var knownDisconnectDelayId = _this.disconnectDelayId;
        yield resendIfRateLimited(() => _this.client._unstable_updateDelayedEvent(knownDisconnectDelayId, UpdateDelayedEventAction.Restart));
        _this.scheduleDelayDisconnection();
      } catch (e) {
        logger.error("Failed to delay our disconnection event:", e);
      }
    }));
  }
  off(event, listener) {
    logger.error("off is not implemented on LegacyMembershipManager");
    return this;
  }
  on(event, listener) {
    logger.error("on is not implemented on LegacyMembershipManager");
    return this;
  }
  isJoined() {
    return this.relativeExpiry !== undefined;
  }
  isActivated() {
    return this.isJoined();
  }
  /**
   * Unimplemented
   * @returns Status.Unknown
   */
  get status() {
    return Status.Unknown;
  }
  join(fociPreferred, fociActive) {
    this.ownFocusActive = fociActive;
    this.ownFociPreferred = fociPreferred;
    this.relativeExpiry = this.membershipEventExpiryMs;
    // We don't wait for this, mostly because it may fail and schedule a retry, so this
    // function returning doesn't really mean anything at all.
    void this.triggerCallMembershipEventUpdate();
  }
  leave() {
    var _arguments = arguments,
      _this2 = this;
    return _asyncToGenerator(function* () {
      var timeout = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : undefined;
      _this2.relativeExpiry = undefined;
      _this2.ownFocusActive = undefined;
      if (_this2.memberEventTimeout) {
        clearTimeout(_this2.memberEventTimeout);
        _this2.memberEventTimeout = undefined;
      }
      if (timeout) {
        // The sleep promise returns the string 'timeout' and the membership update void
        // A success implies that the membership update was quicker then the timeout.
        var raceResult = yield Promise.race([_this2.triggerCallMembershipEventUpdate(), sleep(timeout, "timeout")]);
        return raceResult !== "timeout";
      } else {
        yield _this2.triggerCallMembershipEventUpdate();
        return true;
      }
    })();
  }
  onRTCSessionMemberUpdate(memberships) {
    var _this3 = this;
    return _asyncToGenerator(function* () {
      var isMyMembership = m => m.sender === _this3.client.getUserId() && m.deviceId === _this3.client.getDeviceId();
      if (_this3.isJoined() && !memberships.some(isMyMembership)) {
        logger.warn("Missing own membership: force re-join");
        // TODO: Should this be awaited? And is there anything to tell the focus?
        return _this3.triggerCallMembershipEventUpdate();
      }
    })();
  }
  getActiveFocus() {
    if (this.ownFocusActive) {
      // A livekit active focus
      if (isLivekitFocusActive(this.ownFocusActive)) {
        if (this.ownFocusActive.focus_selection === "oldest_membership") {
          var oldestMembership = this.getOldestMembership();
          return oldestMembership === null || oldestMembership === void 0 ? void 0 : oldestMembership.getPreferredFoci()[0];
        }
      } else {
        logger.warn("Unknown own ActiveFocus type. This makes it impossible to connect to an SFU.");
      }
    } else {
      // We do not understand the membership format (could be legacy). We default to oldestMembership
      // Once there are other methods this is a hard error!
      var _oldestMembership = this.getOldestMembership();
      return _oldestMembership === null || _oldestMembership === void 0 ? void 0 : _oldestMembership.getPreferredFoci()[0];
    }
  }
  makeNewMembership(deviceId) {
    // If we're joined, add our own
    if (this.isJoined()) {
      return this.makeMyMembership(deviceId);
    }
    return {};
  }

  /**
   * Constructs our own membership
   */
  makeMyMembership(deviceId) {
    var _this$ownFociPreferre;
    return {
      call_id: "",
      scope: "m.room",
      application: "m.call",
      device_id: deviceId,
      expires: this.relativeExpiry,
      focus_active: {
        type: "livekit",
        focus_selection: "oldest_membership"
      },
      foci_preferred: (_this$ownFociPreferre = this.ownFociPreferred) !== null && _this$ownFociPreferre !== void 0 ? _this$ownFociPreferre : []
    };
  }
  updateCallMembershipEvent() {
    var _this4 = this;
    return _asyncToGenerator(function* () {
      if (_this4.memberEventTimeout) {
        clearTimeout(_this4.memberEventTimeout);
        _this4.memberEventTimeout = undefined;
      }
      var roomState = _this4.room.getLiveTimeline().getState(EventTimeline.FORWARDS);
      if (!roomState) throw new Error("Couldn't get room state for room " + _this4.room.roomId);
      var localUserId = _this4.client.getUserId();
      var localDeviceId = _this4.client.getDeviceId();
      if (!localUserId || !localDeviceId) throw new Error("User ID or device ID was null!");
      var newContent = {};
      // TODO: add back expiary logic to non-legacy events
      // previously we checked here if the event is timed out and scheduled a check if not.
      // maybe there is a better way.
      newContent = _this4.makeNewMembership(localDeviceId);
      try {
        if (_this4.isJoined()) {
          var stateKey = _this4.makeMembershipStateKey(localUserId, localDeviceId);
          var _prepareDelayedDisconnection = /*#__PURE__*/function () {
            var _ref8 = _asyncToGenerator(function* () {
              try {
                var res = yield resendIfRateLimited(() => _this4.client._unstable_sendDelayedStateEvent(_this4.room.roomId, {
                  delay: _this4.delayedLeaveEventDelayMs
                }, EventType.GroupCallMemberPrefix, {},
                // leave event
                stateKey));
                _this4.disconnectDelayId = res.delay_id;
              } catch (e) {
                if (e instanceof MatrixError && e.errcode === "M_UNKNOWN" && e.data["org.matrix.msc4140.errcode"] === "M_MAX_DELAY_EXCEEDED") {
                  var maxDelayAllowed = e.data["org.matrix.msc4140.max_delay"];
                  if (typeof maxDelayAllowed === "number" && _this4.delayedLeaveEventDelayMs > maxDelayAllowed) {
                    _this4.delayedLeaveEventDelayMsOverride = maxDelayAllowed;
                    return _prepareDelayedDisconnection();
                  }
                }
                logger.error("Failed to prepare delayed disconnection event:", e);
              }
            });
            return function prepareDelayedDisconnection() {
              return _ref8.apply(this, arguments);
            };
          }();
          yield _prepareDelayedDisconnection();
          // Send join event _after_ preparing the delayed disconnection event
          yield resendIfRateLimited(() => _this4.client.sendStateEvent(_this4.room.roomId, EventType.GroupCallMemberPrefix, newContent, stateKey));
          // If sending state cancels your own delayed state, prepare another delayed state
          // TODO: Remove this once MSC4140 is stable & doesn't cancel own delayed state
          if (_this4.disconnectDelayId !== undefined) {
            try {
              var knownDisconnectDelayId = _this4.disconnectDelayId;
              yield resendIfRateLimited(() => _this4.client._unstable_updateDelayedEvent(knownDisconnectDelayId, UpdateDelayedEventAction.Restart));
            } catch (e) {
              if (e instanceof MatrixError && e.errcode === "M_NOT_FOUND") {
                // If we get a M_NOT_FOUND we prepare a new delayed event.
                // In other error cases we do not want to prepare anything since we do not have the guarantee, that the
                // future is not still running.
                logger.warn("Failed to update delayed disconnection event, prepare it again:", e);
                _this4.disconnectDelayId = undefined;
                yield _prepareDelayedDisconnection();
              }
            }
          }
          if (_this4.disconnectDelayId !== undefined) {
            _this4.scheduleDelayDisconnection();
          }
          // TODO throw or log an error if this.disconnectDelayId === undefined
        } else {
          // Not joined
          var sentDelayedDisconnect = false;
          if (_this4.disconnectDelayId !== undefined) {
            try {
              var _knownDisconnectDelayId = _this4.disconnectDelayId;
              yield resendIfRateLimited(() => _this4.client._unstable_updateDelayedEvent(_knownDisconnectDelayId, UpdateDelayedEventAction.Send));
              sentDelayedDisconnect = true;
            } catch (e) {
              logger.error("Failed to send our delayed disconnection event:", e);
            }
            _this4.disconnectDelayId = undefined;
          }
          if (!sentDelayedDisconnect) {
            yield resendIfRateLimited(() => _this4.client.sendStateEvent(_this4.room.roomId, EventType.GroupCallMemberPrefix, {}, _this4.makeMembershipStateKey(localUserId, localDeviceId)));
          }
        }
        logger.info("Sent updated call member event.");
      } catch (e) {
        var resendDelay = _this4.networkErrorRetryMs;
        logger.warn("Failed to send call member event (retrying in ".concat(resendDelay, "): ").concat(e));
        yield sleep(resendDelay);
        yield _this4.triggerCallMembershipEventUpdate();
      }
    })();
  }
  scheduleDelayDisconnection() {
    this.memberEventTimeout = setTimeout(() => void this.delayDisconnection(), this.delayedLeaveEventRestartMs);
  }
  makeMembershipStateKey(localUserId, localDeviceId) {
    var stateKey = "".concat(localUserId, "_").concat(localDeviceId);
    if (/^org\.matrix\.msc(3757|3779)\b/.exec(this.room.getVersion())) {
      return stateKey;
    } else {
      return "_".concat(stateKey);
    }
  }
}
function resendIfRateLimited(_x) {
  return _resendIfRateLimited.apply(this, arguments);
}
function _resendIfRateLimited() {
  _resendIfRateLimited = _asyncToGenerator(function* (func) {
    var numRetriesAllowed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return yield func();
      } catch (e) {
        if (numRetriesAllowed > 0 && e instanceof HTTPError && e.isRateLimitError()) {
          numRetriesAllowed--;
          var resendDelay = void 0;
          var defaultMs = 5000;
          try {
            var _e$getRetryAfterMs;
            resendDelay = (_e$getRetryAfterMs = e.getRetryAfterMs()) !== null && _e$getRetryAfterMs !== void 0 ? _e$getRetryAfterMs : defaultMs;
            logger.info("Rate limited by server, retrying in ".concat(resendDelay, "ms"));
          } catch (e) {
            logger.warn("Error while retrieving a rate-limit retry delay, retrying after default delay of ".concat(defaultMs), e);
            resendDelay = defaultMs;
          }
          yield sleep(resendDelay);
        } else {
          throw e;
        }
      }
    }
  });
  return _resendIfRateLimited.apply(this, arguments);
}
//# sourceMappingURL=LegacyMembershipManager.js.map