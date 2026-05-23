import type { ReactNode } from "react";

export interface SurfaceProps {
  readonly title?: string;
  readonly children: ReactNode;
  readonly tone?: "default" | "success" | "warning" | "danger";
}

export function Surface({ title, children, tone = "default" }: SurfaceProps) {
  const toneClass = {
    default: "border-slate-700 bg-slate-950/70",
    success: "border-emerald-500/50 bg-emerald-950/30",
    warning: "border-amber-500/50 bg-amber-950/30",
    danger: "border-rose-500/50 bg-rose-950/30"
  }[tone];

  return (
    <section className={`rounded-lg border ${toneClass} p-4 shadow-sm`}>
      {title ? <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">{title}</h2> : null}
      {children}
    </section>
  );
}

export interface StatProps {
  readonly label: string;
  readonly value: string | number;
  readonly detail?: string;
}

export function Stat({ label, value, detail }: StatProps) {
  return (
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      {detail ? <div className="mt-1 text-sm text-slate-300">{detail}</div> : null}
    </div>
  );
}

export interface StatusPillProps {
  readonly children: ReactNode;
  readonly tone?: "default" | "success" | "warning" | "danger";
}

export function StatusPill({ children, tone = "default" }: StatusPillProps) {
  const toneClass = {
    default: "bg-slate-800 text-slate-200",
    success: "bg-emerald-500/15 text-emerald-200",
    warning: "bg-amber-500/15 text-amber-100",
    danger: "bg-rose-500/15 text-rose-100"
  }[tone];

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}>{children}</span>;
}
