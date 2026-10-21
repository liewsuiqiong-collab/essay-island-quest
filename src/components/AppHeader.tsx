import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Compass, GraduationCap } from "lucide-react";
import { levelInfo, useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "冒险地图" },
  { to: "/audit", label: "审题侦探" },
  { to: "/plot", label: "情节设计师" },
  { to: "/describe", label: "描写魔法师" },
  { to: "/words", label: "词句工坊" },
  { to: "/challenge", label: "作文挑战赛" },
  { to: "/portfolio", label: "作品集" },
] as const;

export function AppHeader() {
  const { pathname } = useLocation();
  const s = useStore();
  const [open, setOpen] = useState(false);
  const teacher = pathname.startsWith("/teacher");
  const lv = levelInfo(s.xp);

  if (pathname === "/") return <header className="game-header"><div><Link to="/" className="game-header-brand"><Compass size={19} />作文闯关岛<span>ADVENTURE ISLAND</span></Link><nav aria-label="首页导航"><Link to="/portfolio"><BookOpen size={16} />我的作品集</Link><Link to="/teacher"><GraduationCap size={17} />教师入口</Link></nav></div></header>;

  if (teacher) {
    return (
      <header className="bg-teacher text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="font-display text-lg">🧑‍🏫 作文冒险岛 · 教师后台（演示）</div>
          <Link to="/" className="btn bg-card text-foreground">切换到学生界面</Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="font-display text-xl text-primary">🏝️ 作文冒险岛</Link>
        <nav className="ml-4 hidden flex-1 gap-1 lg:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted" activeProps={{ className: "bg-sky-soft text-primary font-semibold" }} activeOptions={{ exact: n.to === "/" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-sun-soft px-3 py-1 text-sm font-semibold">⭐ {s.xp} XP · Lv{lv.lv}</span>
          <Link to="/teacher" className="hidden rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-muted sm:inline">教师后台</Link>
          <button className="btn btn-ghost lg:hidden" onClick={() => setOpen(!open)} aria-label="菜单">☰</button>
        </div>
      </div>
      {open && (
        <nav className="grid grid-cols-2 gap-1 border-t px-4 py-3 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">{n.label}</Link>
          ))}
          <Link to="/teacher" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-grape hover:bg-muted">教师后台</Link>
        </nav>
      )}
    </header>
  );
}
