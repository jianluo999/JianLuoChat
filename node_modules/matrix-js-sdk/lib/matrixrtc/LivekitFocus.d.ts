import { type Focus } from "./focus.ts";
export interface LivekitFocusConfig extends Focus {
    type: "livekit";
    livekit_service_url: string;
}
export declare const isLivekitFocusConfig: (object: any) => object is LivekitFocusConfig;
export interface LivekitFocus extends LivekitFocusConfig {
    livekit_alias: string;
}
export declare const isLivekitFocus: (object: any) => object is LivekitFocus;
export interface LivekitFocusActive extends Focus {
    type: "livekit";
    focus_selection: "oldest_membership";
}
export declare const isLivekitFocusActive: (object: any) => object is LivekitFocusActive;
//# sourceMappingURL=LivekitFocus.d.ts.map