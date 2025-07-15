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

export var Status = /*#__PURE__*/function (Status) {
  Status["Disconnected"] = "Disconnected";
  Status["Connecting"] = "Connecting";
  Status["ConnectingFailed"] = "ConnectingFailed";
  Status["Connected"] = "Connected";
  Status["Reconnecting"] = "Reconnecting";
  Status["Disconnecting"] = "Disconnecting";
  Status["Stuck"] = "Stuck";
  Status["Unknown"] = "Unknown";
  return Status;
}({});

/**
 * A type collecting call encryption statistics for a session.
 */

export var isMyMembership = (m, userId, deviceId) => m.sender === userId && m.deviceId === deviceId;
//# sourceMappingURL=types.js.map