"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Surface = Surface;
exports.Stat = Stat;
exports.StatusPill = StatusPill;
const jsx_runtime_1 = require("react/jsx-runtime");
function Surface({ title, children, tone = "default" }) {
    const toneClass = {
        default: "border-slate-700 bg-slate-950/70",
        success: "border-emerald-500/50 bg-emerald-950/30",
        warning: "border-amber-500/50 bg-amber-950/30",
        danger: "border-rose-500/50 bg-rose-950/30"
    }[tone];
    return ((0, jsx_runtime_1.jsxs)("section", { className: `rounded-lg border ${toneClass} p-4 shadow-sm`, children: [title ? (0, jsx_runtime_1.jsx)("h2", { className: "mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200", children: title }) : null, children] }));
}
function Stat({ label, value, detail }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-w-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs uppercase tracking-wide text-slate-400", children: label }), (0, jsx_runtime_1.jsx)("div", { className: "mt-1 text-2xl font-semibold text-white", children: value }), detail ? (0, jsx_runtime_1.jsx)("div", { className: "mt-1 text-sm text-slate-300", children: detail }) : null] }));
}
function StatusPill({ children, tone = "default" }) {
    const toneClass = {
        default: "bg-slate-800 text-slate-200",
        success: "bg-emerald-500/15 text-emerald-200",
        warning: "bg-amber-500/15 text-amber-100",
        danger: "bg-rose-500/15 text-rose-100"
    }[tone];
    return (0, jsx_runtime_1.jsx)("span", { className: `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`, children: children });
}
//# sourceMappingURL=index.js.map