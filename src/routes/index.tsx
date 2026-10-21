import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock3, ArrowRight, Compass, Map, Sparkles, Printer, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdventureMap } from "@/components/adventure/AdventureMap";
import { PlayerPanel } from "@/components/adventure/PlayerPanel";
import { levelInfo, resetAll, useStore } from "@/lib/store";
import { STATIONS, stationScore, stationUnlocked, totalScore, TOTAL_MAX } from "@/lib/scores";
import explorer from "@/assets/explorer.png";
import ocean from "@/assets/adventure-ocean.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "作文闯关岛 · 写作能力大冒险" },
      { name: "description", content: "五站华文作文复习冒险：内容寻宝岛、词语魔法屋、句子升级站、范文学习馆与作文终极挑战，约 90 分钟完成，总分 100。" },
      { property: "og:title", content: "作文闯关岛 · 写作能力大冒险" },
      { property: "og:description", content: "五座奇幻岛屿，一场约 90 分钟的华文作文复习冒险。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const s = useStore();
  const lv = levelInfo(s.xp);
  const total = totalScore(s);
  const next = STATIONS.find((st) => stationUnlocked(s, st.id) && stationScore(s, st.id) === null) ?? STATIONS[STATIONS.length - 1]!;
  const clearProgress = () => {
    if (window.confirm("确定要清除这台设备上的所有进度吗？XP、徽章、作文草稿和得分都会被删除，无法恢复。建议先生成 PDF 学习报告。")) resetAll();
  };
  return <div className="adventure-home">
    <img src={ocean} alt="" className="ocean-backdrop" width={1920} height={1024} fetchPriority="high" />
    <div className="adventure-content">
      <section className="adventure-intro">
        <div className="explorer-welcome"><img src={explorer} alt="戴探险帽、拿藏宝图的小探险家与海鸥伙伴" width={816} height={816} /><div><span>欢迎回来，{s.name || "探险家"}！</span><strong>Lv.{lv.lv} · {lv.title}</strong></div></div>
        <div className="game-title"><div className="title-compass"><Compass /></div><h1>作文闯关岛</h1><p>写作能力大冒险</p></div>
        <div className="intro-note"><span>每一个好故事</span><strong>都从勇敢出发开始。</strong><div><Sparkles size={15} /> 今天，也让文字闪耀吧！</div></div>
      </section>
      <PlayerPanel player={s} />
      <AdventureMap player={s} />
      <section className="adventure-mission">
        <div className="mission-title"><Map size={27} /><div><span>本次冒险任务</span><h2>五站闯关 · 总分 {total}/{TOTAL_MAX}</h2></div></div>
        <ul>
          {STATIONS.map((st) => (
            <li key={st.id}><CheckCircle2 />{st.name}：{st.time} · {st.max} 分{stationScore(s, st.id) !== null ? `（已得 ${stationScore(s, st.id)} 分）` : ""}</li>
          ))}
        </ul>
        <div className="mission-action">
          <span><Clock3 size={14} />全程约 90 分钟</span>
          <Button asChild variant="adventure" size="lg"><Link to={next.to}>{total > 0 ? "继续冒险" : "开始冒险"}<ArrowRight /></Link></Button>
        </div>
      </section>
      <footer className="adventure-footer">
        <span>记录仅保存在本设备浏览器中，刷新或换设备可能丢失进度；完成后请生成 PDF 学习报告。</span>
        <div>
          <Link to="/report"><Printer size={14} />生成我的学习报告（PDF）</Link>
          <button type="button" onClick={clearProgress} className="adventure-footer-btn"><Trash2 size={14} />清除本机进度</button>
        </div>
      </footer>
    </div>
  </div>;
}
