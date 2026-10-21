import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Compass, Printer } from "lucide-react";
import { levelInfo, useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "冒险地图" },
  { to: "/audit", label: "内容寻宝岛" },
  { to: "/words", label: "词语魔法屋" },
  { to: "/describe", label: "句子升级站" },
  { to: "/museum", label: "范文学习馆" },
  { to: "/challenge", label: "终极挑战" },
  { to: "/report", label: "学习报告" },
] as const;

export function AppHeader() {
  const { pathname } = useLocation();
  const s = useStore();
  const [open, setOpen] = useState(false);
  const lv = levelInfo(s.xp);

  if (pathname === "/") return <header className="game-header"><div><Link to="/" className="game-header-brand"><Compass size={19} />作文闯关岛<span>ADVENTURE ISLAND</span></Link><nav aria-label="首页导航"><Link to="/portfolio"><BookOpen size={16} />我的作品集</Link><Link to="/report"><Printer size={16} />学习报告</Link></nav></div></header>;

  return (
    <header className="app-header sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="font-display text-xl text-primary">🏝️ 作文闯关岛</Link>
        <nav className="ml-4 hidden flex-1 gap-1 lg:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted" activeProps={{ className: "bg-sky-soft text-primary font-semibold" }} activeOptions={{ exact: n.to === "/" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-sun-soft px-3 py-1 text-sm font-semibold">⭐ {s.xp} XP · Lv{lv.lv}</span>
          <button className="btn btn-ghost lg:hidden" onClick={() => setOpen(!open)} aria-label="菜单">☰</button>
        </div>
      </div>
      {open && (
        <nav className="grid grid-cols-2 gap-1 border-t px-4 py-3 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
