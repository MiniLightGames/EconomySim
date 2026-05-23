import type { ReactNode } from "react";
export interface SurfaceProps {
    readonly title?: string;
    readonly children: ReactNode;
    readonly tone?: "default" | "success" | "warning" | "danger";
}
export declare function Surface({ title, children, tone }: SurfaceProps): import("react/jsx-runtime").JSX.Element;
export interface StatProps {
    readonly label: string;
    readonly value: string | number;
    readonly detail?: string;
}
export declare function Stat({ label, value, detail }: StatProps): import("react/jsx-runtime").JSX.Element;
export interface StatusPillProps {
    readonly children: ReactNode;
    readonly tone?: "default" | "success" | "warning" | "danger";
}
export declare function StatusPill({ children, tone }: StatusPillProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map