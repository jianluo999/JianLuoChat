import type { MatrixClient } from "../client.ts";
import { type Room } from "../models/room.ts";
import { type CallMembership } from "./CallMembership.ts";
import { type Focus } from "./focus.ts";
import { type MembershipConfig } from "./MatrixRTCSession.ts";
import { Status } from "./types.ts";
import type { IMembershipManager, MembershipManagerEvent } from "./IMembershipManager.ts";
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
export declare class LegacyMembershipManager implements IMembershipManager {
    private joinConfig;
    private room;
    private client;
    private getOldestMembership;
    private relativeExpiry;
    private memberEventTimeout?;
    /**
     *   This is a Foci array that contains the Focus objects this user is aware of and proposes to use.
     */
    private ownFociPreferred?;
    /**
     *   This is a Focus with the specified fields for an ActiveFocus (e.g. LivekitFocusActive for type="livekit")
     */
    private ownFocusActive?;
    private updateCallMembershipRunning;
    private needCallMembershipUpdate;
    /**
     * If the server disallows the configured {@link delayedLeaveEventDelayMs},
     * this stores a delay that the server does allow.
     */
    private delayedLeaveEventDelayMsOverride?;
    private disconnectDelayId;
    private get networkErrorRetryMs();
    private get membershipEventExpiryMs();
    private get delayedLeaveEventDelayMs();
    private get delayedLeaveEventRestartMs();
    constructor(joinConfig: MembershipConfig | undefined, room: Pick<Room, "getLiveTimeline" | "roomId" | "getVersion">, client: Pick<MatrixClient, "getUserId" | "getDeviceId" | "sendStateEvent" | "_unstable_sendDelayedStateEvent" | "_unstable_updateDelayedEvent">, getOldestMembership: () => CallMembership | undefined);
    off(event: MembershipManagerEvent.StatusChanged, listener: (oldStatus: Status, newStatus: Status) => void): this;
    on(event: MembershipManagerEvent.StatusChanged, listener: (oldStatus: Status, newStatus: Status) => void): this;
    isJoined(): boolean;
    isActivated(): boolean;
    /**
     * Unimplemented
     * @returns Status.Unknown
     */
    get status(): Status;
    join(fociPreferred: Focus[], fociActive?: Focus): void;
    leave(timeout?: number | undefined): Promise<boolean>;
    onRTCSessionMemberUpdate(memberships: CallMembership[]): Promise<void>;
    getActiveFocus(): Focus | undefined;
    private triggerCallMembershipEventUpdate;
    private makeNewMembership;
    /**
     * Constructs our own membership
     */
    private makeMyMembership;
    private updateCallMembershipEvent;
    private scheduleDelayDisconnection;
    private readonly delayDisconnection;
    private makeMembershipStateKey;
}
//# sourceMappingURL=LegacyMembershipManager.d.ts.map