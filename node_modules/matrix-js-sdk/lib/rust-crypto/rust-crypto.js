import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/*
Copyright 2022-2023 The Matrix.org Foundation C.I.C.

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

import anotherjson from "another-json";
import * as RustSdkCryptoJs from "@matrix-org/matrix-sdk-crypto-wasm";
import { KnownMembership } from "../@types/membership.js";
import { MatrixEventEvent } from "../models/event.js";
import { DecryptionError } from "../common-crypto/CryptoBackend.js";
import { logger, LogSpan } from "../logger.js";
import { Method } from "../http-api/index.js";
import { RoomEncryptor } from "./RoomEncryptor.js";
import { OutgoingRequestProcessor } from "./OutgoingRequestProcessor.js";
import { KeyClaimManager } from "./KeyClaimManager.js";
import { MapWithDefault } from "../utils.js";
import { CrossSigningKey, DecryptionFailureCode, DeviceVerificationStatus, EventShieldColour, EventShieldReason, UserVerificationStatus, encodeRecoveryKey, deriveRecoveryKeyFromPassphrase, AllDevicesIsolationMode, DeviceIsolationModeKind, CryptoEvent, ImportRoomKeyStage } from "../crypto-api/index.js";
import { deviceKeysToDeviceMap, rustDeviceToJsDevice } from "./device-converter.js";
import { SECRET_STORAGE_ALGORITHM_V1_AES } from "../secret-storage.js";
import { CrossSigningIdentity } from "./CrossSigningIdentity.js";
import { secretStorageCanAccessSecrets, secretStorageContainsCrossSigningKeys } from "./secret-storage.js";
import { isVerificationEvent, RustVerificationRequest, verificationMethodIdentifierToMethod } from "./verification.js";
import { EventType, MsgType } from "../@types/event.js";
import { TypedEventEmitter } from "../models/typed-event-emitter.js";
import { decryptionKeyMatchesKeyBackupInfo, RustBackupManager } from "./backup.js";
import { TypedReEmitter } from "../ReEmitter.js";
import { secureRandomString } from "../randomstring.js";
import { ClientStoppedError } from "../errors.js";
import { decodeBase64, encodeBase64 } from "../base64.js";
import { OutgoingRequestsManager } from "./OutgoingRequestsManager.js";
import { PerSessionKeyBackupDownloader } from "./PerSessionKeyBackupDownloader.js";
import { DehydratedDeviceManager } from "./DehydratedDeviceManager.js";
import { VerificationMethod } from "../types.js";
import { keyFromAuthData } from "../common-crypto/key-passphrase.js";
var ALL_VERIFICATION_METHODS = [VerificationMethod.Sas, VerificationMethod.ScanQrCode, VerificationMethod.ShowQrCode, VerificationMethod.Reciprocate];
/**
 * An implementation of {@link CryptoBackend} using the Rust matrix-sdk-crypto.
 *
 * @internal
 */
export class RustCrypto extends TypedEventEmitter {
  constructor(logger, /** The `OlmMachine` from the underlying rust crypto sdk. */
  olmMachine,
  /**
   * Low-level HTTP interface: used to make outgoing requests required by the rust SDK.
   *
   * We expect it to set the access token, etc.
   */
  http, /** The local user's User ID. */
  userId, /** The local user's Device ID. */
  _deviceId, /** Interface to server-side secret storage */
  secretStorage, /** Crypto callbacks provided by the application */
  cryptoCallbacks) {
    super();
    this.logger = logger;
    this.olmMachine = olmMachine;
    this.http = http;
    this.userId = userId;
    this.secretStorage = secretStorage;
    this.cryptoCallbacks = cryptoCallbacks;
    /**
     * The number of iterations to use when deriving a recovery key from a passphrase.
     */
    _defineProperty(this, "RECOVERY_KEY_DERIVATION_ITERATIONS", 500000);
    _defineProperty(this, "_trustCrossSignedDevices", true);
    _defineProperty(this, "deviceIsolationMode", new AllDevicesIsolationMode(false));
    /** whether {@link stop} has been called */
    _defineProperty(this, "stopped", false);
    /** mapping of roomId → encryptor class */
    _defineProperty(this, "roomEncryptors", {});
    _defineProperty(this, "eventDecryptor", void 0);
    _defineProperty(this, "keyClaimManager", void 0);
    _defineProperty(this, "outgoingRequestProcessor", void 0);
    _defineProperty(this, "crossSigningIdentity", void 0);
    _defineProperty(this, "backupManager", void 0);
    _defineProperty(this, "outgoingRequestsManager", void 0);
    _defineProperty(this, "perSessionBackupDownloader", void 0);
    _defineProperty(this, "dehydratedDeviceManager", void 0);
    _defineProperty(this, "reemitter", new TypedReEmitter(this));
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // CryptoApi implementation
    //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    _defineProperty(this, "globalBlacklistUnverifiedDevices", false);
    /**
     * The verification methods we offer to the other side during an interactive verification.
     */
    _defineProperty(this, "_supportedVerificationMethods", ALL_VERIFICATION_METHODS);
    this.outgoingRequestProcessor = new OutgoingRequestProcessor(olmMachine, http);
    this.outgoingRequestsManager = new OutgoingRequestsManager(this.logger, olmMachine, this.outgoingRequestProcessor);
    this.keyClaimManager = new KeyClaimManager(olmMachine, this.outgoingRequestProcessor);
    this.backupManager = new RustBackupManager(olmMachine, http, this.outgoingRequestProcessor);
    this.perSessionBackupDownloader = new PerSessionKeyBackupDownloader(this.logger, this.olmMachine, this.http, this.backupManager);
    this.dehydratedDeviceManager = new DehydratedDeviceManager(this.logger, olmMachine, http, this.outgoingRequestProcessor, secretStorage);
    this.eventDecryptor = new EventDecryptor(this.logger, olmMachine, this.perSessionBackupDownloader);

    // re-emit the events emitted by managers
    this.reemitter.reEmit(this.backupManager, [CryptoEvent.KeyBackupStatus, CryptoEvent.KeyBackupSessionsRemaining, CryptoEvent.KeyBackupFailed, CryptoEvent.KeyBackupDecryptionKeyCached]);
    this.reemitter.reEmit(this.dehydratedDeviceManager, [CryptoEvent.DehydratedDeviceCreated, CryptoEvent.DehydratedDeviceUploaded, CryptoEvent.RehydrationStarted, CryptoEvent.RehydrationProgress, CryptoEvent.RehydrationCompleted, CryptoEvent.RehydrationError, CryptoEvent.DehydrationKeyCached, CryptoEvent.DehydratedDeviceRotationError]);
    this.crossSigningIdentity = new CrossSigningIdentity(olmMachine, this.outgoingRequestProcessor, secretStorage);

    // Check and start in background the key backup connection
    this.checkKeyBackupAndEnable();
  }

  /**
   * Return the OlmMachine only if {@link RustCrypto#stop} has not been called.
   *
   * This allows us to better handle race conditions where the client is stopped before or during a crypto API call.
   *
   * @throws ClientStoppedError if {@link RustCrypto#stop} has been called.
   */
  getOlmMachineOrThrow() {
    if (this.stopped) {
      throw new ClientStoppedError();
    }
    return this.olmMachine;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // CryptoBackend implementation
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  set globalErrorOnUnknownDevices(_v) {
    // Not implemented for rust crypto.
  }
  get globalErrorOnUnknownDevices() {
    // Not implemented for rust crypto.
    return false;
  }
  stop() {
    // stop() may be called multiple times, but attempting to close() the OlmMachine twice
    // will cause an error.
    if (this.stopped) {
      return;
    }
    this.stopped = true;
    this.keyClaimManager.stop();
    this.backupManager.stop();
    this.outgoingRequestsManager.stop();
    this.perSessionBackupDownloader.stop();
    this.dehydratedDeviceManager.stop();

    // make sure we close() the OlmMachine; doing so means that all the Rust objects will be
    // cleaned up; in particular, the indexeddb connections will be closed, which means they
    // can then be deleted.
    this.olmMachine.close();
  }
  encryptEvent(event, _room) {
    var _this = this;
    return _asyncToGenerator(function* () {
      var roomId = event.getRoomId();
      var encryptor = _this.roomEncryptors[roomId];
      if (!encryptor) {
        throw new Error("Cannot encrypt event in unconfigured room ".concat(roomId));
      }
      yield encryptor.encryptEvent(event, _this.globalBlacklistUnverifiedDevices, _this.deviceIsolationMode);
    })();
  }
  decryptEvent(event) {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      var roomId = event.getRoomId();
      if (!roomId) {
        // presumably, a to-device message. These are normally decrypted in preprocessToDeviceMessages
        // so the fact it has come back here suggests that decryption failed.
        //
        // once we drop support for the libolm crypto implementation, we can stop passing to-device messages
        // through decryptEvent and hence get rid of this case.
        throw new Error("to-device event was not decrypted in preprocessToDeviceMessages");
      }
      return yield _this2.eventDecryptor.attemptEventDecryption(event, _this2.deviceIsolationMode);
    })();
  }

  /**
   * Implementation of {@link CryptoBackend#getBackupDecryptor}.
   */
  getBackupDecryptor(backupInfo, privKey) {
    var _this3 = this;
    return _asyncToGenerator(function* () {
      if (!(privKey instanceof Uint8Array)) {
        throw new Error("getBackupDecryptor: expects Uint8Array");
      }
      if (backupInfo.algorithm != "m.megolm_backup.v1.curve25519-aes-sha2") {
        throw new Error("getBackupDecryptor: Unsupported algorithm ".concat(backupInfo.algorithm));
      }
      var backupDecryptionKey = RustSdkCryptoJs.BackupDecryptionKey.fromBase64(encodeBase64(privKey));
      if (!decryptionKeyMatchesKeyBackupInfo(backupDecryptionKey, backupInfo)) {
        throw new Error("getBackupDecryptor: key backup on server does not match the decryption key");
      }
      return _this3.backupManager.createBackupDecryptor(backupDecryptionKey);
    })();
  }

  /**
   * Implementation of {@link CryptoBackend#importBackedUpRoomKeys}.
   */
  importBackedUpRoomKeys(keys, backupVersion, opts) {
    var _this4 = this;
    return _asyncToGenerator(function* () {
      return yield _this4.backupManager.importBackedUpRoomKeys(keys, backupVersion, opts);
    })();
  }
  /**
   * Implementation of {@link CryptoApi#getVersion}.
   */
  getVersion() {
    var versions = RustSdkCryptoJs.getVersions();
    return "Rust SDK ".concat(versions.matrix_sdk_crypto, " (").concat(versions.git_sha, "), Vodozemac ").concat(versions.vodozemac);
  }

  /**
   * Implementation of {@link CryptoApi#setDeviceIsolationMode}.
   */
  setDeviceIsolationMode(isolationMode) {
    this.deviceIsolationMode = isolationMode;
  }

  /**
   * Implementation of {@link CryptoApi#isEncryptionEnabledInRoom}.
   */
  isEncryptionEnabledInRoom(roomId) {
    var _this5 = this;
    return _asyncToGenerator(function* () {
      var roomSettings = yield _this5.olmMachine.getRoomSettings(new RustSdkCryptoJs.RoomId(roomId));
      return Boolean(roomSettings === null || roomSettings === void 0 ? void 0 : roomSettings.algorithm);
    })();
  }

  /**
   * Implementation of {@link CryptoApi#getOwnDeviceKeys}.
   */
  getOwnDeviceKeys() {
    var _this6 = this;
    return _asyncToGenerator(function* () {
      var keys = _this6.olmMachine.identityKeys;
      return {
        ed25519: keys.ed25519.toBase64(),
        curve25519: keys.curve25519.toBase64()
      };
    })();
  }
  prepareToEncrypt(room) {
    var encryptor = this.roomEncryptors[room.roomId];
    if (encryptor) {
      encryptor.prepareForEncryption(this.globalBlacklistUnverifiedDevices, this.deviceIsolationMode);
    }
  }
  forceDiscardSession(roomId) {
    var _this$roomEncryptors$;
    return (_this$roomEncryptors$ = this.roomEncryptors[roomId]) === null || _this$roomEncryptors$ === void 0 ? void 0 : _this$roomEncryptors$.forceDiscardSession();
  }
  exportRoomKeys() {
    var _this7 = this;
    return _asyncToGenerator(function* () {
      var raw = yield _this7.olmMachine.exportRoomKeys(() => true);
      return JSON.parse(raw);
    })();
  }
  exportRoomKeysAsJson() {
    var _this8 = this;
    return _asyncToGenerator(function* () {
      return yield _this8.olmMachine.exportRoomKeys(() => true);
    })();
  }
  importRoomKeys(keys, opts) {
    var _this9 = this;
    return _asyncToGenerator(function* () {
      return yield _this9.backupManager.importRoomKeys(keys, opts);
    })();
  }
  importRoomKeysAsJson(keys, opts) {
    var _this0 = this;
    return _asyncToGenerator(function* () {
      return yield _this0.backupManager.importRoomKeysAsJson(keys, opts);
    })();
  }

  /**
   * Implementation of {@link CryptoApi.userHasCrossSigningKeys}.
   */
  userHasCrossSigningKeys() {
    var _arguments = arguments,
      _this1 = this;
    return _asyncToGenerator(function* () {
      var userId = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : _this1.userId;
      var downloadUncached = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : false;
      // TODO: could probably do with a more efficient way of doing this than returning the whole set and searching
      var rustTrackedUsers = yield _this1.olmMachine.trackedUsers();
      var rustTrackedUser;
      for (var u of rustTrackedUsers) {
        if (userId === u.toString()) {
          rustTrackedUser = u;
          break;
        }
      }
      if (rustTrackedUser !== undefined) {
        if (userId === _this1.userId) {
          /* make sure we have an *up-to-date* idea of the user's cross-signing keys. This is important, because if we
           * return "false" here, we will end up generating new cross-signing keys and replacing the existing ones.
           */
          var request = _this1.olmMachine.queryKeysForUsers(
          // clone as rust layer will take ownership and it's reused later
          [rustTrackedUser.clone()]);
          yield _this1.outgoingRequestProcessor.makeOutgoingRequest(request);
        }
        var userIdentity = yield _this1.olmMachine.getIdentity(rustTrackedUser);
        userIdentity === null || userIdentity === void 0 || userIdentity.free();
        return userIdentity !== undefined;
      } else if (downloadUncached) {
        var _keyResult$master_key;
        // Download the cross signing keys and check if the master key is available
        var keyResult = yield _this1.downloadDeviceList(new Set([userId]));
        var keys = (_keyResult$master_key = keyResult.master_keys) === null || _keyResult$master_key === void 0 ? void 0 : _keyResult$master_key[userId];

        // No master key
        if (!keys) return false;

        // `keys` is an object with { [`ed25519:${pubKey}`]: pubKey }
        // We assume only a single key, and we want the bare form without type
        // prefix, so we select the values.
        return Boolean(Object.values(keys.keys)[0]);
      } else {
        return false;
      }
    })();
  }

  /**
   * Get the device information for the given list of users.
   *
   * @param userIds - The users to fetch.
   * @param downloadUncached - If true, download the device list for users whose device list we are not
   *    currently tracking. Defaults to false, in which case such users will not appear at all in the result map.
   *
   * @returns A map `{@link DeviceMap}`.
   */
  getUserDeviceInfo(userIds) {
    var _arguments2 = arguments,
      _this10 = this;
    return _asyncToGenerator(function* () {
      var downloadUncached = _arguments2.length > 1 && _arguments2[1] !== undefined ? _arguments2[1] : false;
      var deviceMapByUserId = new Map();
      var rustTrackedUsers = yield _this10.getOlmMachineOrThrow().trackedUsers();

      // Convert RustSdkCryptoJs.UserId to a `Set<string>`
      var trackedUsers = new Set();
      rustTrackedUsers.forEach(rustUserId => trackedUsers.add(rustUserId.toString()));

      // Keep untracked user to download their keys after
      var untrackedUsers = new Set();
      for (var _userId of userIds) {
        // if this is a tracked user, we can just fetch the device list from the rust-sdk
        // (NB: this is probably ok even if we race with a leave event such that we stop tracking the user's
        // devices: the rust-sdk will return the last-known device list, which will be good enough.)
        if (trackedUsers.has(_userId)) {
          deviceMapByUserId.set(_userId, yield _this10.getUserDevices(_userId));
        } else {
          untrackedUsers.add(_userId);
        }
      }

      // for any users whose device lists we are not tracking, fall back to downloading the device list
      // over HTTP.
      if (downloadUncached && untrackedUsers.size >= 1) {
        var queryResult = yield _this10.downloadDeviceList(untrackedUsers);
        Object.entries(queryResult.device_keys).forEach(_ref => {
          var [userId, deviceKeys] = _ref;
          return deviceMapByUserId.set(userId, deviceKeysToDeviceMap(deviceKeys));
        });
      }
      return deviceMapByUserId;
    })();
  }

  /**
   * Get the device list for the given user from the olm machine
   * @param userId - Rust SDK UserId
   */
  getUserDevices(userId) {
    var _this11 = this;
    return _asyncToGenerator(function* () {
      var rustUserId = new RustSdkCryptoJs.UserId(userId);

      // For reasons I don't really understand, the Javascript FinalizationRegistry doesn't seem to run the
      // registered callbacks when `userDevices` goes out of scope, nor when the individual devices in the array
      // returned by `userDevices.devices` do so.
      //
      // This is particularly problematic, because each of those structures holds a reference to the
      // VerificationMachine, which in turn holds a reference to the IndexeddbCryptoStore. Hence, we end up leaking
      // open connections to the crypto store, which means the store can't be deleted on logout.
      //
      // To fix this, we explicitly call `.free` on each of the objects, which tells the rust code to drop the
      // allocated memory and decrement the refcounts for the crypto store.

      // Wait for up to a second for any in-flight device list requests to complete.
      // The reason for this isn't so much to avoid races (some level of raciness is
      // inevitable for this method) but to make testing easier.
      var userDevices = yield _this11.olmMachine.getUserDevices(rustUserId, 1);
      try {
        var deviceArray = userDevices.devices();
        try {
          return new Map(deviceArray.map(device => [device.deviceId.toString(), rustDeviceToJsDevice(device, rustUserId)]));
        } finally {
          deviceArray.forEach(d => d.free());
        }
      } finally {
        userDevices.free();
      }
    })();
  }

  /**
   * Download the given user keys by calling `/keys/query` request
   * @param untrackedUsers - download keys of these users
   */
  downloadDeviceList(untrackedUsers) {
    var _this12 = this;
    return _asyncToGenerator(function* () {
      var queryBody = {
        device_keys: {}
      };
      untrackedUsers.forEach(user => queryBody.device_keys[user] = []);
      return yield _this12.http.authedRequest(Method.Post, "/_matrix/client/v3/keys/query", undefined, queryBody, {
        prefix: ""
      });
    })();
  }

  /**
   * Implementation of {@link CryptoApi#getTrustCrossSignedDevices}.
   */
  getTrustCrossSignedDevices() {
    return this._trustCrossSignedDevices;
  }

  /**
   * Implementation of {@link CryptoApi#setTrustCrossSignedDevices}.
   */
  setTrustCrossSignedDevices(val) {
    this._trustCrossSignedDevices = val;
    // TODO: legacy crypto goes through the list of known devices and emits DeviceVerificationChanged
    //  events. Maybe we need to do the same?
  }

  /**
   * Mark the given device as locally verified.
   *
   * Implementation of {@link CryptoApi#setDeviceVerified}.
   */
  setDeviceVerified(userId, deviceId) {
    var _arguments3 = arguments,
      _this13 = this;
    return _asyncToGenerator(function* () {
      var verified = _arguments3.length > 2 && _arguments3[2] !== undefined ? _arguments3[2] : true;
      var device = yield _this13.olmMachine.getDevice(new RustSdkCryptoJs.UserId(userId), new RustSdkCryptoJs.DeviceId(deviceId));
      if (!device) {
        throw new Error("Unknown device ".concat(userId, "|").concat(deviceId));
      }
      try {
        yield device.setLocalTrust(verified ? RustSdkCryptoJs.LocalTrust.Verified : RustSdkCryptoJs.LocalTrust.Unset);
      } finally {
        device.free();
      }
    })();
  }

  /**
   * Blindly cross-sign one of our other devices.
   *
   * Implementation of {@link CryptoApi#crossSignDevice}.
   */
  crossSignDevice(deviceId) {
    var _this14 = this;
    return _asyncToGenerator(function* () {
      var device = yield _this14.olmMachine.getDevice(new RustSdkCryptoJs.UserId(_this14.userId), new RustSdkCryptoJs.DeviceId(deviceId));
      if (!device) {
        throw new Error("Unknown device ".concat(deviceId));
      }
      try {
        var outgoingRequest = yield device.verify();
        yield _this14.outgoingRequestProcessor.makeOutgoingRequest(outgoingRequest);
      } finally {
        device.free();
      }
    })();
  }

  /**
   * Implementation of {@link CryptoApi#getDeviceVerificationStatus}.
   */
  getDeviceVerificationStatus(userId, deviceId) {
    var _this15 = this;
    return _asyncToGenerator(function* () {
      var device = yield _this15.olmMachine.getDevice(new RustSdkCryptoJs.UserId(userId), new RustSdkCryptoJs.DeviceId(deviceId));
      if (!device) return null;
      try {
        return new DeviceVerificationStatus({
          signedByOwner: device.isCrossSignedByOwner(),
          crossSigningVerified: device.isCrossSigningTrusted(),
          localVerified: device.isLocallyTrusted(),
          trustCrossSignedDevices: _this15._trustCrossSignedDevices
        });
      } finally {
        device.free();
      }
    })();
  }

  /**
   * Implementation of {@link CryptoApi#getUserVerificationStatus}.
   */
  getUserVerificationStatus(userId) {
    var _this16 = this;
    return _asyncToGenerator(function* () {
      var userIdentity = yield _this16.getOlmMachineOrThrow().getIdentity(new RustSdkCryptoJs.UserId(userId));
      if (userIdentity === undefined) {
        return new UserVerificationStatus(false, false, false);
      }
      var verified = userIdentity.isVerified();
      var wasVerified = userIdentity.wasPreviouslyVerified();
      var needsUserApproval = userIdentity instanceof RustSdkCryptoJs.OtherUserIdentity ? userIdentity.identityNeedsUserApproval() : false;
      userIdentity.free();
      return new UserVerificationStatus(verified, wasVerified, false, needsUserApproval);
    })();
  }

  /**
   * Implementation of {@link CryptoApi#pinCurrentUserIdentity}.
   */
  pinCurrentUserIdentity(userId) {
    var _this17 = this;
    return _asyncToGenerator(function* () {
      var userIdentity = yield _this17.getOlmMachineOrThrow().getIdentity(new RustSdkCryptoJs.UserId(userId));
      if (userIdentity === undefined) {
        throw new Error("Cannot pin identity of unknown user");
      }
      if (userIdentity instanceof RustSdkCryptoJs.OwnUserIdentity) {
        throw new Error("Cannot pin identity of own user");
      }
      yield userIdentity.pinCurrentMasterKey();
    })();
  }

  /**
   * Implementation of {@link CryptoApi#withdrawVerificationRequirement}.
   */
  withdrawVerificationRequirement(userId) {
    var _this18 = this;
    return _asyncToGenerator(function* () {
      var userIdentity = yield _this18.getOlmMachineOrThrow().getIdentity(new RustSdkCryptoJs.UserId(userId));
      if (userIdentity === undefined) {
        throw new Error("Cannot withdraw verification of unknown user");
      }
      yield userIdentity.withdrawVerification();
    })();
  }

  /**
   * Implementation of {@link CryptoApi#isCrossSigningReady}
   */
  isCrossSigningReady() {
    var _this19 = this;
    return _asyncToGenerator(function* () {
      var {
        privateKeysInSecretStorage,
        privateKeysCachedLocally
      } = yield _this19.getCrossSigningStatus();
      var hasKeysInCache = Boolean(privateKeysCachedLocally.masterKey) && Boolean(privateKeysCachedLocally.selfSigningKey) && Boolean(privateKeysCachedLocally.userSigningKey);
      var identity = yield _this19.getOwnIdentity();

      // Cross-signing is ready if the public identity is trusted, and the private keys
      // are either cached, or accessible via secret-storage.
      return !!(identity !== null && identity !== void 0 && identity.isVerified()) && (hasKeysInCache || privateKeysInSecretStorage);
    })();
  }

  /**
   * Implementation of {@link CryptoApi#getCrossSigningKeyId}
   */
  getCrossSigningKeyId() {
    var _arguments4 = arguments,
      _this20 = this;
    return _asyncToGenerator(function* () {
      var type = _arguments4.length > 0 && _arguments4[0] !== undefined ? _arguments4[0] : CrossSigningKey.Master;
      var userIdentity = yield _this20.olmMachine.getIdentity(new RustSdkCryptoJs.UserId(_this20.userId));
      if (!userIdentity) {
        // The public keys are not available on this device
        return null;
      }
      try {
        var crossSigningStatus = yield _this20.olmMachine.crossSigningStatus();
        var privateKeysOnDevice = crossSigningStatus.hasMaster && crossSigningStatus.hasUserSigning && crossSigningStatus.hasSelfSigning;
        if (!privateKeysOnDevice) {
          // The private keys are not available on this device
          return null;
        }
        if (!userIdentity.isVerified()) {
          // We have both public and private keys, but they don't match!
          return null;
        }
        var key;
        switch (type) {
          case CrossSigningKey.Master:
            key = userIdentity.masterKey;
            break;
          case CrossSigningKey.SelfSigning:
            key = userIdentity.selfSigningKey;
            break;
          case CrossSigningKey.UserSigning:
            key = userIdentity.userSigningKey;
            break;
          default:
            // Unknown type
            return null;
        }
        var parsedKey = JSON.parse(key);
        // `keys` is an object with { [`ed25519:${pubKey}`]: pubKey }
        // We assume only a single key, and we want the bare form without type
        // prefix, so we select the values.
        return Object.values(parsedKey.keys)[0];
      } finally {
        userIdentity.free();
      }
    })();
  }

  /**
   * Implementation of {@link CryptoApi#bootstrapCrossSigning}
   */
  bootstrapCrossSigning(opts) {
    var _this21 = this;
    return _asyncToGenerator(function* () {
      yield _this21.crossSigningIdentity.bootstrapCrossSigning(opts);
    })();
  }

  /**
   * Implementation of {@link CryptoApi#isSecretStorageReady}
   */
  isSecretStorageReady() {
    var _this22 = this;
    return _asyncToGenerator(function* () {
      // make sure that the cross-signing keys are stored
      var secretsToCheck = ["m.cross_signing.master", "m.cross_signing.user_signing", "m.cross_signing.self_signing"];

      // if key backup is active, we also need to check that the backup decryption key is stored
      var keyBackupEnabled = (yield _this22.backupManager.getActiveBackupVersion()) != null;
      if (keyBackupEnabled) {
        secretsToCheck.push("m.megolm_backup.v1");
      }
      return secretStorageCanAccessSecrets(_this22.secretStorage, secretsToCheck);
    })();
  }

  /**
   * Implementation of {@link CryptoApi#bootstrapSecretStorage}
   */
  bootstrapSecretStorage() {
    var _arguments5 = arguments,
      _this23 = this;
    return _asyncToGenerator(function* () {
      var {
        createSecretStorageKey,
        setupNewSecretStorage,
        setupNewKeyBackup
      } = _arguments5.length > 0 && _arguments5[0] !== undefined ? _arguments5[0] : {};
      // If an AES Key is already stored in the secret storage and setupNewSecretStorage is not set
      // we don't want to create a new key
      var isNewSecretStorageKeyNeeded = setupNewSecretStorage || !(yield _this23.secretStorageHasAESKey());
      if (isNewSecretStorageKeyNeeded) {
        if (!createSecretStorageKey) {
          throw new Error("unable to create a new secret storage key, createSecretStorageKey is not set");
        }

        // Create a new storage key and add it to secret storage
        _this23.logger.info("bootstrapSecretStorage: creating new secret storage key");
        var recoveryKey = yield createSecretStorageKey();
        if (!recoveryKey) {
          throw new Error("createSecretStorageKey() callback did not return a secret storage key");
        }
        yield _this23.addSecretStorageKeyToSecretStorage(recoveryKey);
      }
      var crossSigningPrivateKeys = yield _this23.olmMachine.exportCrossSigningKeys();
      var hasPrivateKeys = crossSigningPrivateKeys && crossSigningPrivateKeys.masterKey !== undefined && crossSigningPrivateKeys.self_signing_key !== undefined && crossSigningPrivateKeys.userSigningKey !== undefined;

      // If we have cross-signing private keys cached, store them in secret
      // storage if they are not there already.
      if (hasPrivateKeys && (isNewSecretStorageKeyNeeded || !(yield secretStorageContainsCrossSigningKeys(_this23.secretStorage)))) {
        _this23.logger.info("bootstrapSecretStorage: cross-signing keys not yet exported; doing so now.");
        yield _this23.secretStorage.store("m.cross_signing.master", crossSigningPrivateKeys.masterKey);
        yield _this23.secretStorage.store("m.cross_signing.user_signing", crossSigningPrivateKeys.userSigningKey);
        yield _this23.secretStorage.store("m.cross_signing.self_signing", crossSigningPrivateKeys.self_signing_key);
      }

      // likewise with the key backup key: if we have one, store it in secret storage (if it's not already there)
      // also don't bother storing it if we're about to set up a new backup
      if (!setupNewKeyBackup) {
        yield _this23.saveBackupKeyToStorage();
      } else {
        yield _this23.resetKeyBackup();
      }
    })();
  }

  /**
   * If we have a backup key for the current, trusted backup in cache,
   * save it to secret storage.
   */
  saveBackupKeyToStorage() {
    var _this24 = this;
    return _asyncToGenerator(function* () {
      var keyBackupInfo = yield _this24.backupManager.getServerBackupInfo();
      if (!keyBackupInfo || !keyBackupInfo.version) {
        logger.info("Not saving backup key to secret storage: no backup info");
        return;
      }
      var backupKeys = yield _this24.olmMachine.getBackupKeys();
      if (!backupKeys.decryptionKey) {
        logger.info("Not saving backup key to secret storage: no backup key");
        return;
      }
      if (!decryptionKeyMatchesKeyBackupInfo(backupKeys.decryptionKey, keyBackupInfo)) {
        logger.info("Not saving backup key to secret storage: decryption key does not match backup info");
        return;
      }
      var backupKeyBase64 = backupKeys.decryptionKey.toBase64();
      yield _this24.secretStorage.store("m.megolm_backup.v1", backupKeyBase64);
    })();
  }

  /**
   * Add the secretStorage key to the secret storage
   * - The secret storage key must have the `keyInfo` field filled
   * - The secret storage key is set as the default key of the secret storage
   * - Call `cryptoCallbacks.cacheSecretStorageKey` when done
   *
   * @param secretStorageKey - The secret storage key to add in the secret storage.
   */
  addSecretStorageKeyToSecretStorage(secretStorageKey) {
    var _this25 = this;
    return _asyncToGenerator(function* () {
      var _secretStorageKey$key, _secretStorageKey$key2, _this25$cryptoCallbac, _this25$cryptoCallbac2;
      var secretStorageKeyObject = yield _this25.secretStorage.addKey(SECRET_STORAGE_ALGORITHM_V1_AES, {
        passphrase: (_secretStorageKey$key = secretStorageKey.keyInfo) === null || _secretStorageKey$key === void 0 ? void 0 : _secretStorageKey$key.passphrase,
        name: (_secretStorageKey$key2 = secretStorageKey.keyInfo) === null || _secretStorageKey$key2 === void 0 ? void 0 : _secretStorageKey$key2.name,
        key: secretStorageKey.privateKey
      });
      yield _this25.secretStorage.setDefaultKeyId(secretStorageKeyObject.keyId);
      (_this25$cryptoCallbac = (_this25$cryptoCallbac2 = _this25.cryptoCallbacks).cacheSecretStorageKey) === null || _this25$cryptoCallbac === void 0 || _this25$cryptoCallbac.call(_this25$cryptoCallbac2, secretStorageKeyObject.keyId, secretStorageKeyObject.keyInfo, secretStorageKey.privateKey);
    })();
  }

  /**
   * Check if a secret storage AES Key is already added in secret storage
   *
   * @returns True if an AES key is in the secret storage
   */
  secretStorageHasAESKey() {
    var _this26 = this;
    return _asyncToGenerator(function* () {
      // See if we already have an AES secret-storage key.
      var secretStorageKeyTuple = yield _this26.secretStorage.getKey();
      if (!secretStorageKeyTuple) return false;
      var [, keyInfo] = secretStorageKeyTuple;

      // Check if the key is an AES key
      return keyInfo.algorithm === SECRET_STORAGE_ALGORITHM_V1_AES;
    })();
  }

  /**
   * Implementation of {@link CryptoApi#getCrossSigningStatus}
   */
  getCrossSigningStatus() {
    var _this27 = this;
    return _asyncToGenerator(function* () {
      var userIdentity = yield _this27.getOlmMachineOrThrow().getIdentity(new RustSdkCryptoJs.UserId(_this27.userId));
      var publicKeysOnDevice = Boolean(userIdentity === null || userIdentity === void 0 ? void 0 : userIdentity.masterKey) && Boolean(userIdentity === null || userIdentity === void 0 ? void 0 : userIdentity.selfSigningKey) && Boolean(userIdentity === null || userIdentity === void 0 ? void 0 : userIdentity.userSigningKey);
      userIdentity === null || userIdentity === void 0 || userIdentity.free();
      var privateKeysInSecretStorage = yield secretStorageContainsCrossSigningKeys(_this27.secretStorage);
      var crossSigningStatus = yield _this27.getOlmMachineOrThrow().crossSigningStatus();
      return {
        publicKeysOnDevice,
        privateKeysInSecretStorage,
        privateKeysCachedLocally: {
          masterKey: Boolean(crossSigningStatus === null || crossSigningStatus === void 0 ? void 0 : crossSigningStatus.hasMaster),
          userSigningKey: Boolean(crossSigningStatus === null || crossSigningStatus === void 0 ? void 0 : crossSigningStatus.hasUserSigning),
          selfSigningKey: Boolean(crossSigningStatus === null || crossSigningStatus === void 0 ? void 0 : crossSigningStatus.hasSelfSigning)
        }
      };
    })();
  }

  /**
   * Implementation of {@link CryptoApi#createRecoveryKeyFromPassphrase}
   */
  createRecoveryKeyFromPassphrase(password) {
    var _this28 = this;
    return _asyncToGenerator(function* () {
      if (password) {
        // Generate the key from the passphrase
        // first we generate a random salt
        var salt = secureRandomString(32);
        // then we derive the key from the passphrase
        var recoveryKey = yield deriveRecoveryKeyFromPassphrase(password, salt, _this28.RECOVERY_KEY_DERIVATION_ITERATIONS);
        return {
          keyInfo: {
            passphrase: {
              algorithm: "m.pbkdf2",
              iterations: _this28.RECOVERY_KEY_DERIVATION_ITERATIONS,
              salt
            }
          },
          privateKey: recoveryKey,
          encodedPrivateKey: encodeRecoveryKey(recoveryKey)
        };
      } else {
        // Using the navigator crypto API to generate the private key
        var key = new Uint8Array(32);
        globalThis.crypto.getRandomValues(key);
        return {
          privateKey: key,
          encodedPrivateKey: encodeRecoveryKey(key)
        };
      }
    })();
  }

  /**
   * Implementation of {@link CryptoApi#getEncryptionInfoForEvent}.
   */
  getEncryptionInfoForEvent(event) {
    var _this29 = this;
    return _asyncToGenerator(function* () {
      return _this29.eventDecryptor.getEncryptionInfoForEvent(event);
    })();
  }

  /**
   * Returns to-device verification requests that are already in progress for the given user id.
   *
   * Implementation of {@link CryptoApi#getVerificationRequestsToDeviceInProgress}
   *
   * @param userId - the ID of the user to query
   *
   * @returns the VerificationRequests that are in progress
   */
  getVerificationRequestsToDeviceInProgress(userId) {
    var requests = this.olmMachine.getVerificationRequests(new RustSdkCryptoJs.UserId(userId));
    return requests.filter(request => request.roomId === undefined).map(request => this.makeVerificationRequest(request));
  }

  /**
   * Finds a DM verification request that is already in progress for the given room id
   *
   * Implementation of {@link CryptoApi#findVerificationRequestDMInProgress}
   *
   * @param roomId - the room to use for verification
   * @param userId - search the verification request for the given user
   *
   * @returns the VerificationRequest that is in progress, if any
   *
   */
  findVerificationRequestDMInProgress(roomId, userId) {
    if (!userId) throw new Error("missing userId");
    var requests = this.olmMachine.getVerificationRequests(new RustSdkCryptoJs.UserId(userId));

    // Search for the verification request for the given room id
    var request = requests.find(request => {
      var _request$roomId;
      return ((_request$roomId = request.roomId) === null || _request$roomId === void 0 ? void 0 : _request$roomId.toString()) === roomId;
    });
    if (request) {
      return this.makeVerificationRequest(request);
    }
  }

  /**
   * Implementation of {@link CryptoApi#requestVerificationDM}
   */
  requestVerificationDM(userId, roomId) {
    var _this30 = this;
    return _asyncToGenerator(function* () {
      var userIdentity = yield _this30.olmMachine.getIdentity(new RustSdkCryptoJs.UserId(userId));
      if (!userIdentity) throw new Error("unknown userId ".concat(userId));
      try {
        // Transform the verification methods into rust objects
        var methods = _this30._supportedVerificationMethods.map(method => verificationMethodIdentifierToMethod(method));
        // Get the request content to send to the DM room
        var verificationEventContent = yield userIdentity.verificationRequestContent(methods);

        // Send the request content to send to the DM room
        var eventId = yield _this30.sendVerificationRequestContent(roomId, verificationEventContent);

        // Get a verification request
        var request = yield userIdentity.requestVerification(new RustSdkCryptoJs.RoomId(roomId), new RustSdkCryptoJs.EventId(eventId), methods);
        return _this30.makeVerificationRequest(request);
      } finally {
        userIdentity.free();
      }
    })();
  }

  /**
   * Send the verification content to a room
   * See https://spec.matrix.org/v1.7/client-server-api/#put_matrixclientv3roomsroomidsendeventtypetxnid
   *
   * Prefer to use {@link OutgoingRequestProcessor.makeOutgoingRequest} when dealing with {@link RustSdkCryptoJs.RoomMessageRequest}
   *
   * @param roomId - the targeted room
   * @param verificationEventContent - the request body.
   *
   * @returns the event id
   */
  sendVerificationRequestContent(roomId, verificationEventContent) {
    var _this31 = this;
    return _asyncToGenerator(function* () {
      var txId = secureRandomString(32);
      // Send the verification request content to the DM room
      var {
        event_id: eventId
      } = yield _this31.http.authedRequest(Method.Put, "/_matrix/client/v3/rooms/".concat(encodeURIComponent(roomId), "/send/m.room.message/").concat(encodeURIComponent(txId)), undefined, verificationEventContent, {
        prefix: ""
      });
      return eventId;
    })();
  }
  /**
   * Set the verification methods we offer to the other side during an interactive verification.
   *
   * If `undefined`, we will offer all the methods supported by the Rust SDK.
   */
  setSupportedVerificationMethods(methods) {
    // by default, the Rust SDK does not offer `m.qr_code.scan.v1`, but we do want to offer that.
    this._supportedVerificationMethods = methods !== null && methods !== void 0 ? methods : ALL_VERIFICATION_METHODS;
  }

  /**
   * Send a verification request to our other devices.
   *
   * If a verification is already in flight, returns it. Otherwise, initiates a new one.
   *
   * Implementation of {@link CryptoApi#requestOwnUserVerification}.
   *
   * @returns a VerificationRequest when the request has been sent to the other party.
   */
  requestOwnUserVerification() {
    var _this32 = this;
    return _asyncToGenerator(function* () {
      var userIdentity = yield _this32.olmMachine.getIdentity(new RustSdkCryptoJs.UserId(_this32.userId));
      if (userIdentity === undefined) {
        throw new Error("cannot request verification for this device when there is no existing cross-signing key");
      }
      try {
        var [request, outgoingRequest] = yield userIdentity.requestVerification(_this32._supportedVerificationMethods.map(verificationMethodIdentifierToMethod));
        yield _this32.outgoingRequestProcessor.makeOutgoingRequest(outgoingRequest);
        return _this32.makeVerificationRequest(request);
      } finally {
        userIdentity.free();
      }
    })();
  }

  /**
   * Request an interactive verification with the given device.
   *
   * If a verification is already in flight, returns it. Otherwise, initiates a new one.
   *
   * Implementation of {@link CryptoApi#requestDeviceVerification}.
   *
   * @param userId - ID of the owner of the device to verify
   * @param deviceId - ID of the device to verify
   *
   * @returns a VerificationRequest when the request has been sent to the other party.
   */
  requestDeviceVerification(userId, deviceId) {
    var _this33 = this;
    return _asyncToGenerator(function* () {
      var device = yield _this33.olmMachine.getDevice(new RustSdkCryptoJs.UserId(userId), new RustSdkCryptoJs.DeviceId(deviceId));
      if (!device) {
        throw new Error("Not a known device");
      }
      try {
        var [request, outgoingRequest] = device.requestVerification(_this33._supportedVerificationMethods.map(verificationMethodIdentifierToMethod));
        yield _this33.outgoingRequestProcessor.makeOutgoingRequest(outgoingRequest);
        return _this33.makeVerificationRequest(request);
      } finally {
        device.free();
      }
    })();
  }

  /**
   * Fetch the backup decryption key we have saved in our store.
   *
   * Implementation of {@link CryptoApi#getSessionBackupPrivateKey}.
   *
   * @returns the key, if any, or null
   */
  getSessionBackupPrivateKey() {
    var _this34 = this;
    return _asyncToGenerator(function* () {
      var backupKeys = yield _this34.olmMachine.getBackupKeys();
      if (!backupKeys.decryptionKey) return null;
      return decodeBase64(backupKeys.decryptionKey.toBase64());
    })();
  }

  /**
   * Store the backup decryption key.
   *
   * Implementation of {@link CryptoApi#storeSessionBackupPrivateKey}.
   *
   * @param key - the backup decryption key
   * @param version - the backup version for this key.
   */
  storeSessionBackupPrivateKey(key, version) {
    var _this35 = this;
    return _asyncToGenerator(function* () {
      var base64Key = encodeBase64(key);
      if (!version) {
        throw new Error("storeSessionBackupPrivateKey: version is required");
      }
      yield _this35.backupManager.saveBackupDecryptionKey(RustSdkCryptoJs.BackupDecryptionKey.fromBase64(base64Key), version);
    })();
  }

  /**
   * Implementation of {@link CryptoApi#loadSessionBackupPrivateKeyFromSecretStorage}.
   */
  loadSessionBackupPrivateKeyFromSecretStorage() {
    var _this36 = this;
    return _asyncToGenerator(function* () {
      var backupKey = yield _this36.secretStorage.get("m.megolm_backup.v1");
      if (!backupKey) {
        throw new Error("loadSessionBackupPrivateKeyFromSecretStorage: missing decryption key in secret storage");
      }
      var keyBackupInfo = yield _this36.backupManager.getServerBackupInfo();
      if (!keyBackupInfo || !keyBackupInfo.version) {
        throw new Error("loadSessionBackupPrivateKeyFromSecretStorage: unable to get backup version");
      }
      var backupDecryptionKey = RustSdkCryptoJs.BackupDecryptionKey.fromBase64(backupKey);
      if (!decryptionKeyMatchesKeyBackupInfo(backupDecryptionKey, keyBackupInfo)) {
        throw new Error("loadSessionBackupPrivateKeyFromSecretStorage: decryption key does not match backup info");
      }
      yield _this36.backupManager.saveBackupDecryptionKey(backupDecryptionKey, keyBackupInfo.version);
    })();
  }

  /**
   * Get the current status of key backup.
   *
   * Implementation of {@link CryptoApi#getActiveSessionBackupVersion}.
   */
  getActiveSessionBackupVersion() {
    var _this37 = this;
    return _asyncToGenerator(function* () {
      return yield _this37.backupManager.getActiveBackupVersion();
    })();
  }

  /**
   * Implementation of {@link CryptoApi#getKeyBackupInfo}.
   */
  getKeyBackupInfo() {
    var _this38 = this;
    return _asyncToGenerator(function* () {
      return (yield _this38.backupManager.getServerBackupInfo()) || null;
    })();
  }

  /**
   * Determine if a key backup can be trusted.
   *
   * Implementation of {@link CryptoApi#isKeyBackupTrusted}.
   */
  isKeyBackupTrusted(info) {
    var _this39 = this;
    return _asyncToGenerator(function* () {
      return yield _this39.backupManager.isKeyBackupTrusted(info);
    })();
  }

  /**
   * Force a re-check of the key backup and enable/disable it as appropriate.
   *
   * Implementation of {@link CryptoApi#checkKeyBackupAndEnable}.
   */
  checkKeyBackupAndEnable() {
    var _this40 = this;
    return _asyncToGenerator(function* () {
      return yield _this40.backupManager.checkKeyBackupAndEnable(true);
    })();
  }

  /**
   * Implementation of {@link CryptoApi#deleteKeyBackupVersion}.
   */
  deleteKeyBackupVersion(version) {
    var _this41 = this;
    return _asyncToGenerator(function* () {
      yield _this41.backupManager.deleteKeyBackupVersion(version);
    })();
  }

  /**
   * Implementation of {@link CryptoApi#resetKeyBackup}.
   */
  resetKeyBackup() {
    var _this42 = this;
    return _asyncToGenerator(function* () {
      var backupInfo = yield _this42.backupManager.setupKeyBackup(o => _this42.signObject(o));

      // we want to store the private key in 4S
      // need to check if 4S is set up?
      if (yield _this42.secretStorageHasAESKey()) {
        yield _this42.secretStorage.store("m.megolm_backup.v1", backupInfo.decryptionKey.toBase64());
      }

      // we can check and start async
      _this42.checkKeyBackupAndEnable();
    })();
  }

  /**
   * Implementation of {@link CryptoApi#disableKeyStorage}.
   */
  disableKeyStorage() {
    var _this43 = this;
    return _asyncToGenerator(function* () {
      // Get the key backup version we're using
      var info = yield _this43.getKeyBackupInfo();
      if (info !== null && info !== void 0 && info.version) {
        yield _this43.deleteKeyBackupVersion(info.version);
      } else {
        logger.error("Can't delete key backup version: no version available");
      }

      // also turn off 4S, since this is also storing keys on the server.
      yield _this43.deleteSecretStorage();
      yield _this43.dehydratedDeviceManager.delete();
    })();
  }

  /**
   * Signs the given object with the current device and current identity (if available).
   * As defined in {@link https://spec.matrix.org/v1.8/appendices/#signing-json | Signing JSON}.
   *
   * Helper for {@link RustCrypto#resetKeyBackup}.
   *
   * @param obj - The object to sign
   */
  signObject(obj) {
    var _this44 = this;
    return _asyncToGenerator(function* () {
      var sigs = new Map(Object.entries(obj.signatures || {}));
      var unsigned = obj.unsigned;
      delete obj.signatures;
      delete obj.unsigned;
      var userSignatures = sigs.get(_this44.userId) || {};
      var canonalizedJson = anotherjson.stringify(obj);
      var signatures = yield _this44.olmMachine.sign(canonalizedJson);
      var map = JSON.parse(signatures.asJSON());
      sigs.set(_this44.userId, _objectSpread(_objectSpread({}, userSignatures), map[_this44.userId]));
      if (unsigned !== undefined) obj.unsigned = unsigned;
      obj.signatures = Object.fromEntries(sigs.entries());
    })();
  }

  /**
   * Implementation of {@link CryptoApi#restoreKeyBackupWithPassphrase}.
   */
  restoreKeyBackupWithPassphrase(passphrase, opts) {
    var _this45 = this;
    return _asyncToGenerator(function* () {
      var backupInfo = yield _this45.backupManager.getServerBackupInfo();
      if (!(backupInfo !== null && backupInfo !== void 0 && backupInfo.version)) {
        throw new Error("No backup info available");
      }
      var privateKey = yield keyFromAuthData(backupInfo.auth_data, passphrase);

      // Cache the key
      yield _this45.storeSessionBackupPrivateKey(privateKey, backupInfo.version);
      return _this45.restoreKeyBackup(opts);
    })();
  }

  /**
   * Implementation of {@link CryptoApi#restoreKeyBackup}.
   */
  restoreKeyBackup(opts) {
    var _this46 = this;
    return _asyncToGenerator(function* () {
      // Get the decryption key from the crypto store
      var backupKeys = yield _this46.olmMachine.getBackupKeys();
      var {
        decryptionKey,
        backupVersion
      } = backupKeys;
      if (!decryptionKey || !backupVersion) throw new Error("No decryption key found in crypto store");
      var decodedDecryptionKey = decodeBase64(decryptionKey.toBase64());
      var backupInfo = yield _this46.backupManager.requestKeyBackupVersion(backupVersion);
      if (!backupInfo) throw new Error("Backup version to restore ".concat(backupVersion, " not found on server"));
      var backupDecryptor = yield _this46.getBackupDecryptor(backupInfo, decodedDecryptionKey);
      try {
        var _opts$progressCallbac;
        opts === null || opts === void 0 || (_opts$progressCallbac = opts.progressCallback) === null || _opts$progressCallbac === void 0 || _opts$progressCallbac.call(opts, {
          stage: ImportRoomKeyStage.Fetch
        });
        return yield _this46.backupManager.restoreKeyBackup(backupVersion, backupDecryptor, opts);
      } finally {
        // Free to avoid to keep in memory the decryption key stored in it. To avoid to exposing it to an attacker.
        backupDecryptor.free();
      }
    })();
  }

  /**
   * Implementation of {@link CryptoApi#isDehydrationSupported}.
   */
  isDehydrationSupported() {
    var _this47 = this;
    return _asyncToGenerator(function* () {
      return yield _this47.dehydratedDeviceManager.isSupported();
    })();
  }

  /**
   * Implementation of {@link CryptoApi#startDehydration}.
   */
  startDehydration() {
    var _arguments6 = arguments,
      _this48 = this;
    return _asyncToGenerator(function* () {
      var opts = _arguments6.length > 0 && _arguments6[0] !== undefined ? _arguments6[0] : {};
      if (!(yield _this48.isCrossSigningReady()) || !(yield _this48.isSecretStorageReady())) {
        throw new Error("Device dehydration requires cross-signing and secret storage to be set up");
      }
      return yield _this48.dehydratedDeviceManager.start(opts || {});
    })();
  }

  /**
   * Implementation of {@link CryptoApi#importSecretsBundle}.
   */
  importSecretsBundle(secrets) {
    var _this49 = this;
    return _asyncToGenerator(function* () {
      var secretsBundle = RustSdkCryptoJs.SecretsBundle.from_json(secrets);
      yield _this49.getOlmMachineOrThrow().importSecretsBundle(secretsBundle); // this method frees the SecretsBundle
    })();
  }

  /**
   * Implementation of {@link CryptoApi#exportSecretsBundle}.
   */
  exportSecretsBundle() {
    var _this50 = this;
    return _asyncToGenerator(function* () {
      var secretsBundle = yield _this50.getOlmMachineOrThrow().exportSecretsBundle();
      var secrets = secretsBundle.to_json();
      secretsBundle.free();
      return secrets;
    })();
  }

  /**
   * Implementation of {@link CryptoApi#encryptToDeviceMessages}.
   */
  encryptToDeviceMessages(eventType, devices, payload) {
    var _this51 = this;
    return _asyncToGenerator(function* () {
      var logger = new LogSpan(_this51.logger, "encryptToDeviceMessages");
      var uniqueUsers = new Set(devices.map(_ref2 => {
        var {
          userId
        } = _ref2;
        return userId;
      }));

      // This will ensure we have Olm sessions for all of the users' devices.
      // However, we only care about some of the devices.
      // So, perhaps we can optimise this later on.
      yield _this51.keyClaimManager.ensureSessionsForUsers(logger, Array.from(uniqueUsers).map(userId => new RustSdkCryptoJs.UserId(userId)));
      var batch = {
        batch: [],
        eventType: EventType.RoomMessageEncrypted
      };
      yield Promise.all(devices.map(/*#__PURE__*/function () {
        var _ref4 = _asyncToGenerator(function* (_ref3) {
          var {
            userId,
            deviceId
          } = _ref3;
          var device = yield _this51.olmMachine.getDevice(new RustSdkCryptoJs.UserId(userId), new RustSdkCryptoJs.DeviceId(deviceId));
          if (device) {
            var encryptedPayload = JSON.parse(yield device.encryptToDeviceEvent(eventType, payload));
            batch.batch.push({
              deviceId,
              userId,
              payload: encryptedPayload
            });
          } else {
            _this51.logger.warn("encryptToDeviceMessages: unknown device ".concat(userId, ":").concat(deviceId));
          }
        });
        return function (_x) {
          return _ref4.apply(this, arguments);
        };
      }()));
      return batch;
    })();
  }

  /**
   * Implementation of {@link CryptoApi#resetEncryption}.
   */
  resetEncryption(authUploadDeviceSigningKeys) {
    var _this52 = this;
    return _asyncToGenerator(function* () {
      _this52.logger.debug("resetEncryption: resetting encryption");

      // Delete the dehydrated device, since any existing one will be signed
      // by the wrong cross-signing key
      _this52.dehydratedDeviceManager.delete();

      // Disable backup, and delete all the backups from the server
      yield _this52.backupManager.deleteAllKeyBackupVersions();
      yield _this52.deleteSecretStorage();

      // Reset the cross-signing keys
      yield _this52.crossSigningIdentity.bootstrapCrossSigning({
        setupNewCrossSigning: true,
        authUploadDeviceSigningKeys
      });

      // Create a new key backup
      yield _this52.resetKeyBackup();
      _this52.logger.debug("resetEncryption: ended");
    })();
  }

  /**
   * Removes the secret storage key, default key pointer and all (known) secret storage data
   * from the user's account data
   */
  deleteSecretStorage() {
    var _this53 = this;
    return _asyncToGenerator(function* () {
      // Remove the stored secrets in the secret storage
      yield _this53.secretStorage.store("m.cross_signing.master", null);
      yield _this53.secretStorage.store("m.cross_signing.self_signing", null);
      yield _this53.secretStorage.store("m.cross_signing.user_signing", null);
      yield _this53.secretStorage.store("m.megolm_backup.v1", null);

      // Remove the recovery key
      var defaultKeyId = yield _this53.secretStorage.getDefaultKeyId();
      if (defaultKeyId) yield _this53.secretStorage.store("m.secret_storage.key.".concat(defaultKeyId), null);
      // Disable the recovery key and the secret storage
      yield _this53.secretStorage.setDefaultKeyId(null);
    })();
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // SyncCryptoCallbacks implementation
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Apply sync changes to the olm machine
   * @param events - the received to-device messages
   * @param oneTimeKeysCounts - the received one time key counts
   * @param unusedFallbackKeys - the received unused fallback keys
   * @param devices - the received device list updates
   * @returns A list of preprocessed to-device messages.
   */
  receiveSyncChanges(_ref5) {
    var _this54 = this;
    return _asyncToGenerator(function* () {
      var {
        events,
        oneTimeKeysCounts = new Map(),
        unusedFallbackKeys,
        devices = new RustSdkCryptoJs.DeviceLists()
      } = _ref5;
      var result = yield _this54.olmMachine.receiveSyncChanges(events ? JSON.stringify(events) : "[]", devices, oneTimeKeysCounts, unusedFallbackKeys);
      return result.map(processed => JSON.parse(processed.rawEvent));
    })();
  }

  /** called by the sync loop to preprocess incoming to-device messages
   *
   * @param events - the received to-device messages
   * @returns A list of preprocessed to-device messages.
   */
  preprocessToDeviceMessages(events) {
    var _this55 = this;
    return _asyncToGenerator(function* () {
      // send the received to-device messages into receiveSyncChanges. We have no info on device-list changes,
      // one-time-keys, or fallback keys, so just pass empty data.
      var processed = yield _this55.receiveSyncChanges({
        events
      });

      // look for interesting to-device messages
      for (var message of processed) {
        if (message.type === EventType.KeyVerificationRequest) {
          var sender = message.sender;
          var transactionId = message.content.transaction_id;
          if (transactionId && sender) {
            _this55.onIncomingKeyVerificationRequest(sender, transactionId);
          }
        }
      }
      return processed;
    })();
  }

  /** called by the sync loop to process one time key counts and unused fallback keys
   *
   * @param oneTimeKeysCounts - the received one time key counts
   * @param unusedFallbackKeys - the received unused fallback keys
   */
  processKeyCounts(oneTimeKeysCounts, unusedFallbackKeys) {
    var _this56 = this;
    return _asyncToGenerator(function* () {
      var mapOneTimeKeysCount = oneTimeKeysCounts && new Map(Object.entries(oneTimeKeysCounts));
      var setUnusedFallbackKeys = unusedFallbackKeys && new Set(unusedFallbackKeys);
      if (mapOneTimeKeysCount !== undefined || setUnusedFallbackKeys !== undefined) {
        yield _this56.receiveSyncChanges({
          oneTimeKeysCounts: mapOneTimeKeysCount,
          unusedFallbackKeys: setUnusedFallbackKeys
        });
      }
    })();
  }

  /** called by the sync loop to process the notification that device lists have
   * been changed.
   *
   * @param deviceLists - device_lists field from /sync
   */
  processDeviceLists(deviceLists) {
    var _this57 = this;
    return _asyncToGenerator(function* () {
      var _deviceLists$changed, _deviceLists$left;
      var devices = new RustSdkCryptoJs.DeviceLists((_deviceLists$changed = deviceLists.changed) === null || _deviceLists$changed === void 0 ? void 0 : _deviceLists$changed.map(userId => new RustSdkCryptoJs.UserId(userId)), (_deviceLists$left = deviceLists.left) === null || _deviceLists$left === void 0 ? void 0 : _deviceLists$left.map(userId => new RustSdkCryptoJs.UserId(userId)));
      yield _this57.receiveSyncChanges({
        devices
      });
    })();
  }

  /** called by the sync loop on m.room.encrypted events
   *
   * @param room - in which the event was received
   * @param event - encryption event to be processed
   */
  onCryptoEvent(room, event) {
    var _this58 = this;
    return _asyncToGenerator(function* () {
      var config = event.getContent();
      var settings = new RustSdkCryptoJs.RoomSettings();
      if (config.algorithm === "m.megolm.v1.aes-sha2") {
        settings.algorithm = RustSdkCryptoJs.EncryptionAlgorithm.MegolmV1AesSha2;
      } else {
        // Among other situations, this happens if the crypto state event is redacted.
        _this58.logger.warn("Room ".concat(room.roomId, ": ignoring crypto event with invalid algorithm ").concat(config.algorithm));
        return;
      }
      try {
        settings.sessionRotationPeriodMs = config.rotation_period_ms;
        settings.sessionRotationPeriodMessages = config.rotation_period_msgs;
        yield _this58.olmMachine.setRoomSettings(new RustSdkCryptoJs.RoomId(room.roomId), settings);
      } catch (e) {
        _this58.logger.warn("Room ".concat(room.roomId, ": ignoring crypto event which caused error: ").concat(e));
        return;
      }

      // If we got this far, the SDK found the event acceptable.
      // We need to either create or update the active RoomEncryptor.
      var existingEncryptor = _this58.roomEncryptors[room.roomId];
      if (existingEncryptor) {
        existingEncryptor.onCryptoEvent(config);
      } else {
        _this58.roomEncryptors[room.roomId] = new RoomEncryptor(_this58.olmMachine, _this58.keyClaimManager, _this58.outgoingRequestsManager, room, config);
      }
    })();
  }

  /** called by the sync loop after processing each sync.
   *
   *
   * @param syncState - information on the completed sync.
   */
  onSyncCompleted(syncState) {
    // Processing the /sync may have produced new outgoing requests which need sending, so kick off the outgoing
    // request loop, if it's not already running.
    this.outgoingRequestsManager.doProcessOutgoingRequests().catch(e => {
      this.logger.warn("onSyncCompleted: Error processing outgoing requests", e);
    });
  }

  /**
   * Implementation of {@link CryptoApi#markAllTrackedUsersAsDirty}.
   */
  markAllTrackedUsersAsDirty() {
    var _this59 = this;
    return _asyncToGenerator(function* () {
      yield _this59.olmMachine.markAllTrackedUsersAsDirty();
    })();
  }

  /**
   * Handle an incoming m.key.verification.request event, received either in-room or in a to-device message.
   *
   * @param sender - the sender of the event
   * @param transactionId - the transaction ID for the verification. For to-device messages, this comes from the
   *    content of the message; for in-room messages it is the event ID.
   */
  onIncomingKeyVerificationRequest(sender, transactionId) {
    var request = this.olmMachine.getVerificationRequest(new RustSdkCryptoJs.UserId(sender), transactionId);
    if (request) {
      this.emit(CryptoEvent.VerificationRequestReceived, this.makeVerificationRequest(request));
    } else {
      // There are multiple reasons this can happen; probably the most likely is that the event is an
      // in-room event which is too old.
      this.logger.info("Ignoring just-received verification request ".concat(transactionId, " which did not start a rust-side verification"));
    }
  }

  /** Utility function to wrap a rust `VerificationRequest` with our own {@link VerificationRequest}. */
  makeVerificationRequest(request) {
    return new RustVerificationRequest(this.logger, this.olmMachine, request, this.outgoingRequestProcessor, this._supportedVerificationMethods);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // Other public functions
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /** called by the MatrixClient on a room membership event
   *
   * @param event - The matrix event which caused this event to fire.
   * @param member - The member whose RoomMember.membership changed.
   * @param oldMembership - The previous membership state. Null if it's a new member.
   */
  onRoomMembership(event, member, oldMembership) {
    var enc = this.roomEncryptors[event.getRoomId()];
    if (!enc) {
      // not encrypting in this room
      return;
    }
    enc.onRoomMembership(member);
  }

  /** Callback for OlmMachine.registerRoomKeyUpdatedCallback
   *
   * Called by the rust-sdk whenever there is an update to (megolm) room keys. We
   * check if we have any events waiting for the given keys, and schedule them for
   * a decryption retry if so.
   *
   * @param keys - details of the updated keys
   */
  onRoomKeysUpdated(keys) {
    var _this60 = this;
    return _asyncToGenerator(function* () {
      for (var key of keys) {
        _this60.onRoomKeyUpdated(key);
      }
      _this60.backupManager.maybeUploadKey();
    })();
  }
  onRoomKeyUpdated(key) {
    var _this61 = this;
    if (this.stopped) return;
    this.logger.debug("Got update for session ".concat(key.sessionId, " from sender ").concat(key.senderKey.toBase64(), " in ").concat(key.roomId.toString()));
    var pendingList = this.eventDecryptor.getEventsPendingRoomKey(key.roomId.toString(), key.sessionId);
    if (pendingList.length === 0) return;
    this.logger.debug("Retrying decryption on events:", pendingList.map(e => "".concat(e.getId())));

    // Have another go at decrypting events with this key.
    //
    // We don't want to end up blocking the callback from Rust, which could otherwise end up dropping updates,
    // so we don't wait for the decryption to complete. In any case, there is no need to wait:
    // MatrixEvent.attemptDecryption ensures that there is only one decryption attempt happening at once,
    // and deduplicates repeated attempts for the same event.
    var _loop = function _loop(ev) {
      ev.attemptDecryption(_this61, {
        isRetry: true
      }).catch(_e => {
        _this61.logger.info("Still unable to decrypt event ".concat(ev.getId(), " after receiving key"));
      });
    };
    for (var ev of pendingList) {
      _loop(ev);
    }
  }

  /**
   * Callback for `OlmMachine.registerRoomKeyWithheldCallback`.
   *
   * Called by the rust sdk whenever we are told that a key has been withheld. We see if we had any events that
   * failed to decrypt for the given session, and update their status if so.
   *
   * @param withheld - Details of the withheld sessions.
   */
  onRoomKeysWithheld(withheld) {
    var _this62 = this;
    return _asyncToGenerator(function* () {
      for (var session of withheld) {
        _this62.logger.debug("Got withheld message for session ".concat(session.sessionId, " in ").concat(session.roomId.toString()));
        var pendingList = _this62.eventDecryptor.getEventsPendingRoomKey(session.roomId.toString(), session.sessionId);
        if (pendingList.length === 0) return;

        // The easiest way to update the status of the event is to have another go at decrypting it.
        _this62.logger.debug("Retrying decryption on events:", pendingList.map(e => "".concat(e.getId())));
        for (var ev of pendingList) {
          ev.attemptDecryption(_this62, {
            isRetry: true
          }).catch(_e => {
            // It's somewhat expected that we still can't decrypt here.
          });
        }
      }
    })();
  }

  /**
   * Callback for `OlmMachine.registerUserIdentityUpdatedCallback`
   *
   * Called by the rust-sdk whenever there is an update to any user's cross-signing status. We re-check their trust
   * status and emit a `UserTrustStatusChanged` event, as well as a `KeysChanged` if it is our own identity that changed.
   *
   * @param userId - the user with the updated identity
   */
  onUserIdentityUpdated(userId) {
    var _this63 = this;
    return _asyncToGenerator(function* () {
      var newVerification = yield _this63.getUserVerificationStatus(userId.toString());
      _this63.emit(CryptoEvent.UserTrustStatusChanged, userId.toString(), newVerification);

      // If our own user identity has changed, we may now trust the key backup where we did not before.
      // So, re-check the key backup status and enable it if available.
      if (userId.toString() === _this63.userId) {
        _this63.emit(CryptoEvent.KeysChanged, {});
        yield _this63.checkKeyBackupAndEnable();
      }
    })();
  }

  /**
   * Callback for `OlmMachine.registerDevicesUpdatedCallback`
   *
   * Called when users' devices have updated. Emits `WillUpdateDevices` and `DevicesUpdated`. In the JavaScript
   * crypto backend, these events are called at separate times, with `WillUpdateDevices` being emitted just before
   * the devices are saved, and `DevicesUpdated` being emitted just after. But the OlmMachine only gives us
   * one event, so we emit both events here.
   *
   * @param userIds - an array of user IDs of users whose devices have updated.
   */
  onDevicesUpdated(userIds) {
    var _this64 = this;
    return _asyncToGenerator(function* () {
      _this64.emit(CryptoEvent.WillUpdateDevices, userIds, false);
      _this64.emit(CryptoEvent.DevicesUpdated, userIds, false);
    })();
  }

  /**
   * Handles secret received from the rust secret inbox.
   *
   * The gossipped secrets are received using the `m.secret.send` event type
   * and are guaranteed to have been received over a 1-to-1 Olm
   * Session from a verified device.
   *
   * The only secret currently handled in this way is `m.megolm_backup.v1`.
   *
   * @param name - the secret name
   * @param value - the secret value
   */
  handleSecretReceived(name, value) {
    var _this65 = this;
    return _asyncToGenerator(function* () {
      _this65.logger.debug("onReceiveSecret: Received secret ".concat(name));
      if (name === "m.megolm_backup.v1") {
        return yield _this65.backupManager.handleBackupSecretReceived(value);
        // XXX at this point we should probably try to download the backup and import the keys,
        // or at least retry for the current decryption failures?
        // Maybe add some signaling when a new secret is received, and let clients handle it?
        // as it's where the restore from backup APIs are exposed.
      }
      return false;
    })();
  }

  /**
   * Called when a new secret is received in the rust secret inbox.
   *
   * Will poll the secret inbox and handle the secrets received.
   *
   * @param name - The name of the secret received.
   */
  checkSecrets(name) {
    var _this66 = this;
    return _asyncToGenerator(function* () {
      var pendingValues = yield _this66.olmMachine.getSecretsFromInbox(name);
      for (var value of pendingValues) {
        if (yield _this66.handleSecretReceived(name, value)) {
          // If we have a valid secret for that name there is no point of processing the other secrets values.
          // It's probably the same secret shared by another device.
          break;
        }
      }

      // Important to call this after handling the secrets as good hygiene.
      yield _this66.olmMachine.deleteSecretsFromInbox(name);
    })();
  }

  /**
   * Handle a live event received via /sync.
   * See {@link ClientEventHandlerMap#event}
   *
   * @param event - live event
   */
  onLiveEventFromSync(event) {
    var _this67 = this;
    return _asyncToGenerator(function* () {
      // Ignore state event or remote echo
      // transaction_id is provided in case of remote echo {@link https://spec.matrix.org/v1.7/client-server-api/#local-echo}
      if (event.isState() || !!event.getUnsigned().transaction_id) return;
      var processEvent = /*#__PURE__*/function () {
        var _ref6 = _asyncToGenerator(function* (evt) {
          // Process only verification event
          if (isVerificationEvent(event)) {
            yield _this67.onKeyVerificationEvent(evt);
          }
        });
        return function processEvent(_x2) {
          return _ref6.apply(this, arguments);
        };
      }();

      // If the event is encrypted of in failure, we wait for decryption
      if (event.isDecryptionFailure() || event.isEncrypted()) {
        // 5 mins
        var TIMEOUT_DELAY = 5 * 60 * 1000;

        // After 5mins, we are not expecting the event to be decrypted
        var timeoutId = setTimeout(() => event.off(MatrixEventEvent.Decrypted, onDecrypted), TIMEOUT_DELAY);
        var onDecrypted = (decryptedEvent, error) => {
          if (error) return;
          clearTimeout(timeoutId);
          event.off(MatrixEventEvent.Decrypted, onDecrypted);
          processEvent(decryptedEvent);
        };
        event.on(MatrixEventEvent.Decrypted, onDecrypted);
      } else {
        yield processEvent(event);
      }
    })();
  }

  /**
   * Handle an in-room key verification event.
   *
   * @param event - a key validation request event.
   */
  onKeyVerificationEvent(event) {
    var _this68 = this;
    return _asyncToGenerator(function* () {
      var roomId = event.getRoomId();
      if (!roomId) {
        throw new Error("missing roomId in the event");
      }
      _this68.logger.debug("Incoming verification event ".concat(event.getId(), " type ").concat(event.getType(), " from ").concat(event.getSender()));
      yield _this68.olmMachine.receiveVerificationEvent(JSON.stringify({
        event_id: event.getId(),
        type: event.getType(),
        sender: event.getSender(),
        state_key: event.getStateKey(),
        content: event.getContent(),
        origin_server_ts: event.getTs()
      }), new RustSdkCryptoJs.RoomId(roomId));
      if (event.getType() === EventType.RoomMessage && event.getContent().msgtype === MsgType.KeyVerificationRequest) {
        _this68.onIncomingKeyVerificationRequest(event.getSender(), event.getId());
      }

      // that may have caused us to queue up outgoing requests, so make sure we send them.
      _this68.outgoingRequestsManager.doProcessOutgoingRequests().catch(e => {
        _this68.logger.warn("onKeyVerificationRequest: Error processing outgoing requests", e);
      });
    })();
  }

  /**
   * Returns the cross-signing user identity of the current user.
   *
   * Not part of the public crypto-api interface.
   * Used during migration from legacy js-crypto to update local trust if needed.
   */
  getOwnIdentity() {
    var _this69 = this;
    return _asyncToGenerator(function* () {
      return yield _this69.olmMachine.getIdentity(new RustSdkCryptoJs.UserId(_this69.userId));
    })();
  }
}
class EventDecryptor {
  constructor(logger, olmMachine, perSessionBackupDownloader) {
    this.logger = logger;
    this.olmMachine = olmMachine;
    this.perSessionBackupDownloader = perSessionBackupDownloader;
    /**
     * Events which we couldn't decrypt due to unknown sessions / indexes.
     *
     * Map from roomId to sessionId to Set of MatrixEvents
     */
    _defineProperty(this, "eventsPendingKey", new MapWithDefault(() => new MapWithDefault(() => new Set())));
  }
  attemptEventDecryption(event, isolationMode) {
    var _this70 = this;
    return _asyncToGenerator(function* () {
      // add the event to the pending list *before* attempting to decrypt.
      // then, if the key turns up while decryption is in progress (and
      // decryption fails), we will schedule a retry.
      // (fixes https://github.com/vector-im/element-web/issues/5001)
      _this70.addEventToPendingList(event);
      var trustRequirement;
      switch (isolationMode.kind) {
        case DeviceIsolationModeKind.AllDevicesIsolationMode:
          trustRequirement = RustSdkCryptoJs.TrustRequirement.Untrusted;
          break;
        case DeviceIsolationModeKind.OnlySignedDevicesIsolationMode:
          trustRequirement = RustSdkCryptoJs.TrustRequirement.CrossSignedOrLegacy;
          break;
      }
      try {
        var res = yield _this70.olmMachine.decryptRoomEvent(stringifyEvent(event), new RustSdkCryptoJs.RoomId(event.getRoomId()), new RustSdkCryptoJs.DecryptionSettings(trustRequirement));

        // Success. We can remove the event from the pending list, if
        // that hasn't already happened.
        _this70.removeEventFromPendingList(event);
        return {
          clearEvent: JSON.parse(res.event),
          claimedEd25519Key: res.senderClaimedEd25519Key,
          senderCurve25519Key: res.senderCurve25519Key,
          forwardingCurve25519KeyChain: res.forwardingCurve25519KeyChain
        };
      } catch (err) {
        if (err instanceof RustSdkCryptoJs.MegolmDecryptionError) {
          _this70.onMegolmDecryptionError(event, err, yield _this70.perSessionBackupDownloader.getServerBackupInfo());
        } else {
          throw new DecryptionError(DecryptionFailureCode.UNKNOWN_ERROR, "Unknown error");
        }
      }
    })();
  }

  /**
   * Handle a `MegolmDecryptionError` returned by the rust SDK.
   *
   * Fires off a request to the `perSessionBackupDownloader`, if appropriate, and then throws a `DecryptionError`.
   *
   * @param event - The event which could not be decrypted.
   * @param err - The error from the Rust SDK.
   * @param serverBackupInfo - Details about the current backup from the server. `null` if there is no backup.
   *     `undefined` if our attempt to check failed.
   */
  onMegolmDecryptionError(event, err, serverBackupInfo) {
    var content = event.getWireContent();
    var errorDetails = {
      sender_key: content.sender_key,
      session_id: content.session_id
    };

    // If the error looks like it might be recoverable from backup, queue up a request to try that.
    if (err.code === RustSdkCryptoJs.DecryptionErrorCode.MissingRoomKey || err.code === RustSdkCryptoJs.DecryptionErrorCode.UnknownMessageIndex) {
      this.perSessionBackupDownloader.onDecryptionKeyMissingError(event.getRoomId(), content.session_id);

      // If the server is telling us our membership at the time the event
      // was sent, and it isn't "join", we use a different error code.
      var membership = event.getMembershipAtEvent();
      if (membership && membership !== KnownMembership.Join && membership !== KnownMembership.Invite) {
        throw new DecryptionError(DecryptionFailureCode.HISTORICAL_MESSAGE_USER_NOT_JOINED, "This message was sent when we were not a member of the room.", errorDetails);
      }

      // If the event was sent before this device was created, we use some different error codes.
      if (event.getTs() <= this.olmMachine.deviceCreationTimeMs) {
        if (serverBackupInfo === null) {
          throw new DecryptionError(DecryptionFailureCode.HISTORICAL_MESSAGE_NO_KEY_BACKUP, "This message was sent before this device logged in, and there is no key backup on the server.", errorDetails);
        } else if (!this.perSessionBackupDownloader.isKeyBackupDownloadConfigured()) {
          throw new DecryptionError(DecryptionFailureCode.HISTORICAL_MESSAGE_BACKUP_UNCONFIGURED, "This message was sent before this device logged in, and key backup is not working.", errorDetails);
        } else {
          throw new DecryptionError(DecryptionFailureCode.HISTORICAL_MESSAGE_WORKING_BACKUP, "This message was sent before this device logged in. Key backup is working, but we still do not (yet) have the key.", errorDetails);
        }
      }
    }

    // If we got a withheld code, expose that.
    if (err.maybe_withheld) {
      // Unfortunately the Rust SDK API doesn't let us distinguish between different withheld cases, other than
      // by string-matching.
      var failureCode = err.maybe_withheld === "The sender has disabled encrypting to unverified devices." ? DecryptionFailureCode.MEGOLM_KEY_WITHHELD_FOR_UNVERIFIED_DEVICE : DecryptionFailureCode.MEGOLM_KEY_WITHHELD;
      throw new DecryptionError(failureCode, err.maybe_withheld, errorDetails);
    }
    switch (err.code) {
      case RustSdkCryptoJs.DecryptionErrorCode.MissingRoomKey:
        throw new DecryptionError(DecryptionFailureCode.MEGOLM_UNKNOWN_INBOUND_SESSION_ID, "The sender's device has not sent us the keys for this message.", errorDetails);
      case RustSdkCryptoJs.DecryptionErrorCode.UnknownMessageIndex:
        throw new DecryptionError(DecryptionFailureCode.OLM_UNKNOWN_MESSAGE_INDEX, "The sender's device has not sent us the keys for this message at this index.", errorDetails);
      case RustSdkCryptoJs.DecryptionErrorCode.SenderIdentityVerificationViolation:
        // We're refusing to decrypt due to not trusting the sender,
        // rather than failing to decrypt due to lack of keys, so we
        // don't need to keep it on the pending list.
        this.removeEventFromPendingList(event);
        throw new DecryptionError(DecryptionFailureCode.SENDER_IDENTITY_PREVIOUSLY_VERIFIED, "The sender identity is unverified, but was previously verified.");
      case RustSdkCryptoJs.DecryptionErrorCode.UnknownSenderDevice:
        // We're refusing to decrypt due to not trusting the sender,
        // rather than failing to decrypt due to lack of keys, so we
        // don't need to keep it on the pending list.
        this.removeEventFromPendingList(event);
        throw new DecryptionError(DecryptionFailureCode.UNKNOWN_SENDER_DEVICE, "The sender device is not known.");
      case RustSdkCryptoJs.DecryptionErrorCode.UnsignedSenderDevice:
        // We're refusing to decrypt due to not trusting the sender,
        // rather than failing to decrypt due to lack of keys, so we
        // don't need to keep it on the pending list.
        this.removeEventFromPendingList(event);
        throw new DecryptionError(DecryptionFailureCode.UNSIGNED_SENDER_DEVICE, "The sender identity is not cross-signed.");

      // We don't map MismatchedIdentityKeys for now, as there is no equivalent in legacy.
      // Just put it on the `UNKNOWN_ERROR` bucket.
      default:
        throw new DecryptionError(DecryptionFailureCode.UNKNOWN_ERROR, err.description, errorDetails);
    }
  }
  getEncryptionInfoForEvent(event) {
    var _this71 = this;
    return _asyncToGenerator(function* () {
      if (!event.getClearContent() || event.isDecryptionFailure()) {
        // not successfully decrypted
        return null;
      }

      // special-case outgoing events, which the rust crypto-sdk will barf on
      if (event.status !== null) {
        return {
          shieldColour: EventShieldColour.NONE,
          shieldReason: null
        };
      }
      var encryptionInfo = yield _this71.olmMachine.getRoomEventEncryptionInfo(stringifyEvent(event), new RustSdkCryptoJs.RoomId(event.getRoomId()));
      return rustEncryptionInfoToJsEncryptionInfo(_this71.logger, encryptionInfo);
    })();
  }

  /**
   * Look for events which are waiting for a given megolm session
   *
   * Returns a list of events which were encrypted by `session` and could not be decrypted
   */
  getEventsPendingRoomKey(roomId, sessionId) {
    var roomPendingEvents = this.eventsPendingKey.get(roomId);
    if (!roomPendingEvents) return [];
    var sessionPendingEvents = roomPendingEvents.get(sessionId);
    if (!sessionPendingEvents) return [];
    return [...sessionPendingEvents];
  }

  /**
   * Add an event to the list of those awaiting their session keys.
   */
  addEventToPendingList(event) {
    var roomId = event.getRoomId();
    // We shouldn't have events without a room id here.
    if (!roomId) return;
    var roomPendingEvents = this.eventsPendingKey.getOrCreate(roomId);
    var sessionPendingEvents = roomPendingEvents.getOrCreate(event.getWireContent().session_id);
    sessionPendingEvents.add(event);
  }

  /**
   * Remove an event from the list of those awaiting their session keys.
   */
  removeEventFromPendingList(event) {
    var roomId = event.getRoomId();
    if (!roomId) return;
    var roomPendingEvents = this.eventsPendingKey.getOrCreate(roomId);
    if (!roomPendingEvents) return;
    var sessionPendingEvents = roomPendingEvents.get(event.getWireContent().session_id);
    if (!sessionPendingEvents) return;
    sessionPendingEvents.delete(event);

    // also clean up the higher-level maps if they are now empty
    if (sessionPendingEvents.size === 0) {
      roomPendingEvents.delete(event.getWireContent().session_id);
      if (roomPendingEvents.size === 0) {
        this.eventsPendingKey.delete(roomId);
      }
    }
  }
}
function stringifyEvent(event) {
  return JSON.stringify({
    event_id: event.getId(),
    type: event.getWireType(),
    sender: event.getSender(),
    state_key: event.getStateKey(),
    content: event.getWireContent(),
    origin_server_ts: event.getTs()
  });
}
function rustEncryptionInfoToJsEncryptionInfo(logger, encryptionInfo) {
  if (encryptionInfo === undefined) {
    // not decrypted here
    return null;
  }

  // TODO: use strict shield semantics.
  var shieldState = encryptionInfo.shieldState(false);
  var shieldColour;
  switch (shieldState.color) {
    case RustSdkCryptoJs.ShieldColor.Grey:
      shieldColour = EventShieldColour.GREY;
      break;
    case RustSdkCryptoJs.ShieldColor.None:
      shieldColour = EventShieldColour.NONE;
      break;
    default:
      shieldColour = EventShieldColour.RED;
  }
  var shieldReason;
  switch (shieldState.code) {
    case undefined:
    case null:
      shieldReason = null;
      break;
    case RustSdkCryptoJs.ShieldStateCode.AuthenticityNotGuaranteed:
      shieldReason = EventShieldReason.AUTHENTICITY_NOT_GUARANTEED;
      break;
    case RustSdkCryptoJs.ShieldStateCode.UnknownDevice:
      shieldReason = EventShieldReason.UNKNOWN_DEVICE;
      break;
    case RustSdkCryptoJs.ShieldStateCode.UnsignedDevice:
      shieldReason = EventShieldReason.UNSIGNED_DEVICE;
      break;
    case RustSdkCryptoJs.ShieldStateCode.UnverifiedIdentity:
      shieldReason = EventShieldReason.UNVERIFIED_IDENTITY;
      break;
    case RustSdkCryptoJs.ShieldStateCode.SentInClear:
      shieldReason = EventShieldReason.SENT_IN_CLEAR;
      break;
    case RustSdkCryptoJs.ShieldStateCode.VerificationViolation:
      shieldReason = EventShieldReason.VERIFICATION_VIOLATION;
      break;
  }
  return {
    shieldColour,
    shieldReason
  };
}
//# sourceMappingURL=rust-crypto.js.map