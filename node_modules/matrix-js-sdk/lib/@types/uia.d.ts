import { type AuthDict } from "../interactive-auth.ts";
/**
 * Helper type to represent HTTP request body for a UIA enabled endpoint
 */
export type UIARequest<T> = T & {
    auth?: AuthDict;
};
/**
 * Helper type to represent HTTP response body for a UIA enabled endpoint
 * @deprecated - a successful response for a UIA enabled endpoint is no different, UIA is signalled via an error
 */
export type UIAResponse<T> = T;
//# sourceMappingURL=uia.d.ts.map