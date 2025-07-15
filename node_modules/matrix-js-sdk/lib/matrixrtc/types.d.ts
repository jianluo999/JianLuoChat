import type { IMentions } from "../matrix.ts";
import type { CallMembership } from "./CallMembership.ts";
export interface EncryptionKeyEntry {
    index: number;
    key: string;
}
export interface EncryptionKeysEventContent {
    keys: EncryptionKeyEntry[];
    device_id: string;
    call_id: string;
    sent_ts?: number;
}
export interface EncryptionKeysToDeviceEventContent {
    keys: {
        index: number;
        key: string;
    };
    member: {
        claimed_device_id: string;
    };
    room_id: string;
    session: {
        application: string;
        call_id: string;
        scope: string;
    };
    sent_ts?: number;
}
export type CallNotifyType = "ring" | "notify";
export interface ICallNotifyContent {
    "application": string;
    "m.mentions": IMentions;
    "notify_type": CallNotifyType;
    "call_id": string;
}
export declare enum Status {
    Disconnected = "Disconnected",
    Connecting = "Connecting",
    ConnectingFailed = "ConnectingFailed",
    Connected = "Connected",
    Reconnecting = "Reconnecting",
    Disconnecting = "Disconnecting",
    Stuck = "Stuck",
    Unknown = "Unknown"
}
/**
 * A type collecting call encryption statistics for a session.
 */
export type Statistics = {
    counters: {
        /**
         * The number of times we have sent a room event containing encryption keys.
         */
        roomEventEncryptionKeysSent: number;
        /**
         * The number of times we have received a room event containing encryption keys.
         */
        roomEventEncryptionKeysReceived: number;
    };
    totals: {
        /**
         * The total age (in milliseconds) of all room events containing encryption keys that we have received.
         * We track the total age so that we can later calculate the average age of all keys received.
         */
        roomEventEncryptionKeysReceivedTotalAge: number;
    };
};
export declare const isMyMembership: (m: CallMembership, userId: string, deviceId: string) => boolean;
//# sourceMappingURL=types.d.ts.map