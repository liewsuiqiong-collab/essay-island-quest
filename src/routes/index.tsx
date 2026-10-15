import { createFileRoute, Link } from "@tanstack/react-router";
import { Progress, LocalNotice } from "@/components/kit";
import { BADGES, levelInfo, useStore, setName, type Skill } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "作文冒险岛 · 冒险地图" },
      { name: "description", content: "查看今日任务、XP、写作等级与关卡进度，继续你的华文作文冒险。" },
      { property: "og:title", content: "作文冒险岛 · 冒险地图" },
      { property: "og:description", content: "游戏化华文作文学习平台：审题、构思、描写、词句、作文挑战。" },
    ],
  }),
  component: Home,
});

const MODULES = [
  { id: "audit", to: "/audit", icon: "🔍", name: "审题侦探", desc: "找关键词，判断切题", tone: "bg-sky-soft" },
  { id: "plot", to: "/plot", icon: "🗺️", name: "情节设计师", desc: "规划开端到反思", tone: "bg-mint-soft" },
  { id: "describe", to: "/describe", icon: "✨", name: "描写魔法师", desc: "把普通句子变生动", tone: "bg-grape-soft" },
  { id: "words", to: "/words", icon: "🧩", name: "词语与句子工坊", desc: "搭配、近义词、造句", tone: "bg-sun-soft" },
  { id: "challenge", to: "/challenge", icon: "🏆", name: "作文挑战赛", desc: "审题→构思→写作→修改", tone: "bg-sky-soft" },
] as const;

const SKILL_TO: Record<Skill, string> = { 审题: "/audit", 构思: "/plot", 描写: "/describe", 词句: "/words", 修改: "/challenge" };

function Home() {
  const s = useStore();
  const lv = levelInfo(s.xp);
  const done = MODULES.filter((m) => s.badges.includes(m.id));
  const next = MODULES.find((m) => !s.badges.includes(m.id)) ?? MODULES[4];
  const weak = (Object.entries(s.skills) as [Skill, number][]).sort((a, b) => a[1] - b[1]).slice(0, 2);
  const day = new Date().getDate();
  const tasks = [
    { t: "完成一个描写魔法挑战", ok: s.descs.some((d) => d.date.slice(0, 10) === new Date().toISOString().slice(0, 10)), to: "/describe" },
    { t: day % 2 ? "审题侦探：完成一套关卡" : "词句工坊：答对 5 题", ok: day % 2 ? s.badges.includes("audit") : s.badges.includes("words"), to: day % 2 ? "/audit" : "/words" },
    { t: "为作文写一份修改稿或反思", ok: s.essays.some((e) => e.revision && e.reflection), to: "/challenge" },
  ];

  return (
    <div className="space-y-6">
      <section className="bg-hero relative overflow-hidden rounded-3xl p-6 text-primary-foreground sm:p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-card/10" />
        <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-card/10" />
        <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <p className="text-sm opacity-90">欢迎回来，
              <input aria-label="你的称呼" value={s.name} onChange={(e) => setName(e.target.value)} className="w-24 rounded border-b border-card/50 bg-transparent px-1 font-semibold outline-none" />
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl">今天也来一场作文冒险吧！</h1>
            <p className="mt-2 max-w-md text-sm opacity-90">每完成一个练习、每认真修改一次，你都会离「冒险岛岛主」更近一步。</p>
            <Link to={next.to} className="btn btn-sun mt-5 text-base">继续学习：{next.name} →</Link>
          </div>
          <div className="rounded-2xl bg-card p-5 text-foreground shadow-card">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">写作等级</span>
              <span className="font-display text-2xl text-primary">Lv{lv.lv} {lv.title}</span>
            </div>
            <div className="mt-3"><Progress value={lv.pct} tone="sun" /></div>
            <p className="mt-2 text-xs text-muted-foreground">⭐ {s.xp} XP · 距下一级还差 {lv.next} XP</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat n={`${done.length}/5`} l="已完成关卡" />
              <Stat n={s.badges.length} l="徽章" />
              <Stat n={s.essays.length} l="作品" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-xl">🗺️ 关卡地图</h2>
          <div className="relative mt-4 grid gap-4 sm:grid-cols-5">
            <div className="absolute left-[10%] right-[10%] top-9 hidden border-t-4 border-dashed border-border sm:block" />
            {MODULES.map((m, i) => {
              const ok = s.badges.includes(m.id);
              return (
                <Link key={m.id} to={m.to} className="group relative flex items-center gap-3 sm:flex-col sm:text-center">
                  <div className={`${m.tone} relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-4 text-3xl transition group-hover:-translate-y-1 ${ok ? "border-success" : "border-card"} shadow-card`}>
                    {m.icon}
                    {ok && <span className="absolute -right-1 -top-1 rounded-full bg-success px-1.5 text-xs text-primary-foreground">✓</span>}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">第 {i + 1} 关</div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-xl">📋 今日任务</h2>
          <ul className="mt-3 space-y-2">
            {tasks.map((t) => (
              <li key={t.t}>
                <Link to={t.to} className={`flex items-center gap-3 rounded-xl border p-3 text-sm hover:bg-muted ${t.ok ? "bg-mint-soft" : ""}`}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs ${t.ok ? "border-success bg-success text-primary-foreground" : ""}`}>{t.ok ? "✓" : ""}</span>
                  <span className={t.ok ? "line-through opacity-70" : ""}>{t.t}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5">
          <h2 className="text-xl">🎯 待加强技能</h2>
          <p className="mt-1 text-xs text-muted-foreground">根据你完成的练习数量计算</p>
          <div className="mt-3 space-y-3">
            {weak.map(([k, v]) => (
              <Link key={k} to={SKILL_TO[k]} className="block rounded-xl bg-sun-soft p-3 hover:opacity-90">
                <div className="flex justify-between text-sm"><span className="font-semibold">{k}</span><span>已练 {v} 次 →</span></div>
              </Link>
            ))}
          </div>
        </section>
        <section className="card p-5">
          <h2 className="text-xl">🏅 我的徽章</h2>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {Object.entries(BADGES).map(([id, b]) => (
              <div key={id} title={`${b.name}：${b.desc}`} className={`flex flex-col items-center rounded-xl p-2 text-center ${s.badges.includes(id) ? "bg-grape-soft" : "opacity-35 grayscale"}`}>
                <span className="text-2xl">{b.icon}</span>
                <span className="mt-1 text-[11px] leading-tight">{b.name}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-5">
          <h2 className="text-xl">⚡ 最近获得</h2>
          {s.log.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">还没有记录，去完成第一个练习吧！</p>
          ) : (
            <ul className="mt-3 max-h-48 space-y-1.5 overflow-auto text-sm">
              {s.log.slice(0, 8).map((l, i) => (
                <li key={i} className="flex justify-between gap-2"><span className="truncate">{l.text}</span><span className="shrink-0 font-semibold text-sun">+{l.xp}</span></li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <LocalNotice />
    </div>
  );
}

function Stat({ n, l }: { n: string | number; l: string }) {
  return (
    <div className="rounded-xl bg-muted p-2">
      <div className="font-display text-xl text-primary">{n}</div>
      <div className="text-[11px] text-muted-foreground">{l}</div>
    </div>
  );
}
