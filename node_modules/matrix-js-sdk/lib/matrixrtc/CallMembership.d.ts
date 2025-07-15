import { type MatrixEvent } from "../matrix.ts";
import { type Focus } from "./focus.ts";
/**
 * The default duration in milliseconds that a membership is considered valid for.
 * Ordinarily the client responsible for the session will update the membership before it expires.
 * We use this duration as the fallback case where stale sessions are present for some reason.
 */
export declare const DEFAULT_EXPIRE_DURATION: number;
type CallScope = "m.room" | "m.user";
/**
 * MSC4143 (MatrixRTC) session membership data.
 * Represents an entry in the memberships section of an m.call.member event as it is on the wire.
 **/
export type SessionMembershipData = {
    /**
     * The RTC application defines the type of the RTC session.
     */
    application: string;
    /**
     * The id of this session.
     * A session can never span over multiple rooms so this id is to distinguish between
     * multiple session in one room. A room wide session that is not associated with a user,
     * and therefore immune to creation race conflicts, uses the `call_id: ""`.
     */
    call_id: string;
    /**
     * The Matrix device ID of this session. A single user can have multiple sessions on different devices.
     */
    device_id: string;
    /**
     * The focus selection system this user/membership is using.
     */
    focus_active: Focus;
    /**
     * A list of possible foci this uses knows about. One of them might be used based on the focus_active
     * selection system.
     */
    foci_preferred: Focus[];
    /**
     * Optional field that contains the creation of the session. If it is undefined the creation
     * is the `origin_server_ts` of the event itself. For updates to the event this property tracks
     * the `origin_server_ts` of the initial join event.
     *  - If it is undefined it can be interpreted as a "Join".
     *  - If it is defined it can be interpreted as an "Update"
     */
    created_ts?: number;
    /**
     * If the `application` = `"m.call"` this defines if it is a room or user owned call.
     * There can always be one room scroped call but multiple user owned calls (breakout sessions)
     */
    scope?: CallScope;
    /**
     * Optionally we allow to define a delta to the `created_ts` that defines when the event is expired/invalid.
     * This should be set to multiple hours. The only reason it exist is to deal with failed delayed events.
     * (for example caused by a homeserver crashes)
     **/
    expires?: number;
};
export declare class CallMembership {
    private parentEvent;
    static equal(a: CallMembership, b: CallMembership): boolean;
    private membershipData;
    constructor(parentEvent: MatrixEvent, data: any);
    get sender(): string | undefined;
    get eventId(): string | undefined;
    get callId(): string;
    get deviceId(): string;
    get application(): string | undefined;
    get scope(): CallScope | undefined;
    get membershipID(): string;
    createdTs(): number;
    /**
     * Gets the absolute expiry timestamp of the membership.
     * @returns The absolute expiry time of the membership as a unix timestamp in milliseconds or undefined if not applicable
     */
    getAbsoluteExpiry(): number;
    /**
     * @returns The number of milliseconds until the membership expires or undefined if applicable
     */
    getMsUntilExpiry(): number;
    /**
     * @returns true if the membership has expired, otherwise false
     */
    isExpired(): boolean;
    getPreferredFoci(): Focus[];
    getFocusSelection(): string | undefined;
}
export {};
//# sourceMappingURL=CallMembership.d.ts.map