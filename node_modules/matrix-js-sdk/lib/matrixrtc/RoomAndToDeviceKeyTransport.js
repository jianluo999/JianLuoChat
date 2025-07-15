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

import { logger as rootLogger } from "../logger.js";
import { KeyTransportEvents } from "./IKeyTransport.js";
import { NotSupportedError } from "./ToDeviceKeyTransport.js";
import { TypedEventEmitter } from "../models/typed-event-emitter.js";

// Deprecate RoomAndToDeviceTransport: This whole class is only a stop gap until we remove RoomKeyTransport.

export var RoomAndToDeviceEvents = /*#__PURE__*/function (RoomAndToDeviceEvents) {
  RoomAndToDeviceEvents["EnabledTransportsChanged"] = "enabled_transports_changed";
  return RoomAndToDeviceEvents;
}({});
/**
 * A custom transport that subscribes to room key events (via `RoomKeyTransport`) and to device key events (via: `ToDeviceKeyTransport`)
 * The public setEnabled method allows to turn one or the other on or off on the fly.
 * It will emit `RoomAndToDeviceEvents.EnabledTransportsChanged` if the enabled transport changes to allow comminitcating this to
 * the user in the ui.
 *
 * Since it will always subscribe to both (room and to device) but only emit for the enabled ones, it can detect
 * if a room key event was received and autoenable it.
 */
export class RoomAndToDeviceTransport extends TypedEventEmitter {
  constructor(toDeviceTransport, roomKeyTransport, parentLogger) {
    var _this;
    super();
    _this = this;
    this.toDeviceTransport = toDeviceTransport;
    this.roomKeyTransport = roomKeyTransport;
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "_enabled", {
      toDevice: true,
      room: false
    });
    this.logger = (parentLogger !== null && parentLogger !== void 0 ? parentLogger : rootLogger).getChild("[RoomAndToDeviceTransport]");
    // update parent loggers for the sub transports so filtering for `RoomAndToDeviceTransport` contains their logs too
    this.toDeviceTransport.setParentLogger(this.logger);
    this.roomKeyTransport.setParentLogger(this.logger);
    this.roomKeyTransport.on(KeyTransportEvents.ReceivedKeys, function () {
      // Turn on the room transport if we receive a roomKey from another participant
      // and disable the toDevice transport.
      if (!_this._enabled.room) {
        _this.logger.debug("Received room key, enabling room key transport, disabling toDevice transport");
        _this.setEnabled({
          toDevice: false,
          room: true
        });
      }
      for (var _len = arguments.length, props = new Array(_len), _key = 0; _key < _len; _key++) {
        props[_key] = arguments[_key];
      }
      _this.emit(KeyTransportEvents.ReceivedKeys, ...props);
    });
    this.toDeviceTransport.on(KeyTransportEvents.ReceivedKeys, function () {
      if (_this._enabled.toDevice) {
        for (var _len2 = arguments.length, props = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          props[_key2] = arguments[_key2];
        }
        _this.emit(KeyTransportEvents.ReceivedKeys, ...props);
      } else {
        _this.logger.debug("To Device transport is disabled, ignoring received keys");
      }
    });
  }

  /** Set which transport type should be used to send and receive keys.*/
  setEnabled(enabled) {
    if (this.enabled.toDevice !== enabled.toDevice || this.enabled.room !== enabled.room) {
      this._enabled = enabled;
      this.emit(RoomAndToDeviceEvents.EnabledTransportsChanged, enabled);
    }
  }

  /** The currently enabled transports that are used to send and receive keys.*/
  get enabled() {
    return this._enabled;
  }
  start() {
    // always start the underlying transport since we need to enable room transport
    // when someone else sends us a room key. (we need to listen to roomKeyTransport)
    this.roomKeyTransport.start();
    this.toDeviceTransport.start();
  }
  stop() {
    // always stop since it is always running
    this.roomKeyTransport.stop();
    this.toDeviceTransport.stop();
  }
  sendKey(keyBase64Encoded, index, members) {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      _this2.logger.debug("Sending key with index ".concat(index, " to call members (count=").concat(members.length, ") via:") + (_this2._enabled.room ? "room transport" : "") + (_this2._enabled.room && _this2._enabled.toDevice ? "and" : "") + (_this2._enabled.toDevice ? "to device transport" : ""));
      if (_this2._enabled.room) yield _this2.roomKeyTransport.sendKey(keyBase64Encoded, index, members);
      if (_this2._enabled.toDevice) {
        try {
          yield _this2.toDeviceTransport.sendKey(keyBase64Encoded, index, members);
        } catch (error) {
          if (error instanceof NotSupportedError && !_this2._enabled.room) {
            _this2.logger.warn("To device is not supported enabling room key transport, disabling toDevice transport");
            _this2.setEnabled({
              toDevice: false,
              room: true
            });
            yield _this2.sendKey(keyBase64Encoded, index, members);
          }
        }
      }
    })();
  }
}
//# sourceMappingURL=RoomAndToDeviceKeyTransport.js.map