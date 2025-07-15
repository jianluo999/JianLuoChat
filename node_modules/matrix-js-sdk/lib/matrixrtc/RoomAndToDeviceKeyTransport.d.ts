import { type Logger } from "../logger.ts";
import { KeyTransportEvents, type KeyTransportEventsHandlerMap, type IKeyTransport } from "./IKeyTransport.ts";
import { type CallMembership } from "./CallMembership.ts";
import type { RoomKeyTransport } from "./RoomKeyTransport.ts";
import { type ToDeviceKeyTransport } from "./ToDeviceKeyTransport.ts";
import { TypedEventEmitter } from "../models/typed-event-emitter.ts";
export interface EnabledTransports {
    toDevice: boolean;
    room: boolean;
}
export declare enum RoomAndToDeviceEvents {
    EnabledTransportsChanged = "enabled_transports_changed"
}
export type RoomAndToDeviceEventsHandlerMap = {
    [RoomAndToDeviceEvents.EnabledTransportsChanged]: (enabledTransports: EnabledTransports) => void;
};
/**
 * A custom transport that subscribes to room key events (via `RoomKeyTransport`) and to device key events (via: `ToDeviceKeyTransport`)
 * The public setEnabled method allows to turn one or the other on or off on the fly.
 * It will emit `RoomAndToDeviceEvents.EnabledTransportsChanged` if the enabled transport changes to allow comminitcating this to
 * the user in the ui.
 *
 * Since it will always subscribe to both (room and to device) but only emit for the enabled ones, it can detect
 * if a room key event was received and autoenable it.
 */
export declare class RoomAndToDeviceTransport extends TypedEventEmitter<KeyTransportEvents | RoomAndToDeviceEvents, KeyTransportEventsHandlerMap & RoomAndToDeviceEventsHandlerMap> implements IKeyTransport {
    private toDeviceTransport;
    private roomKeyTransport;
    private readonly logger;
    private _enabled;
    constructor(toDeviceTransport: ToDeviceKeyTransport, roomKeyTransport: RoomKeyTransport, parentLogger?: Logger);
    /** Set which transport type should be used to send and receive keys.*/
    setEnabled(enabled: {
        toDevice: boolean;
        room: boolean;
    }): void;
    /** The currently enabled transports that are used to send and receive keys.*/
    get enabled(): EnabledTransports;
    start(): void;
    stop(): void;
    sendKey(keyBase64Encoded: string, index: number, members: CallMembership[]): Promise<void>;
}
//# sourceMappingURL=RoomAndToDeviceKeyTransport.d.ts.map