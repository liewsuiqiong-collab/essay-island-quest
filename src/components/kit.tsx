import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function PageHead({ icon, title, desc, tone = "sky" }: { icon: string; title: string; desc: string; tone?: "sky" | "mint" | "sun" | "grape" }) {
  const bg = { sky: "bg-sky-soft", mint: "bg-mint-soft", sun: "bg-sun-soft", grape: "bg-grape-soft" }[tone];
  return (
    <div className={`${bg} mb-6 flex items-center gap-4 rounded-3xl p-5 sm:p-6`}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card text-3xl shadow-card">{icon}</div>
      <div>
        <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← 返回冒险岛</Link>
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

export function Progress({ value, tone = "sky" }: { value: number; tone?: "sky" | "mint" | "sun" | "grape" }) {
  const c = { sky: "bg-sky", mint: "bg-mint", sun: "bg-sun", grape: "bg-grape" }[tone];
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={`${c} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Feedback({ kind, children }: { kind: "ok" | "hint" | "bad" | "info"; children: ReactNode }) {
  const s = {
    ok: "border-success bg-mint-soft",
    hint: "border-warn bg-sun-soft",
    bad: "border-destructive bg-sun-soft",
    info: "border-sky bg-sky-soft",
  }[kind];
  const icon = { ok: "✅", hint: "💡", bad: "🤔", info: "ℹ️" }[kind];
  return (
    <div className={`${s} mt-3 flex gap-2 rounded-xl border-l-4 p-3 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-1`}>
      <span>{icon}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function LocalNotice() {
  return (
    <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
      💾 目前资料只保存在<strong>这台设备的浏览器</strong>中（本地保存）。这不是云端记录，老师无法跨设备查看；清除浏览器数据会导致资料丢失。
    </p>
  );
}

export function XpToast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-sun px-5 py-2 text-sm font-bold text-primary-foreground shadow-card animate-in fade-in zoom-in">
      {text}
    </div>
  );
}
