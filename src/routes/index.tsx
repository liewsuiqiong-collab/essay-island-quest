import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock3, ArrowRight, Compass, Map, Sparkles, PenLine, CheckCircle2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdventureMap, ISLANDS } from "@/components/adventure/AdventureMap";
import { PlayerPanel } from "@/components/adventure/PlayerPanel";
import { levelInfo, useStore } from "@/lib/store";
import explorer from "@/assets/explorer.png";
import ocean from "@/assets/adventure-ocean.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "作文闯关岛 · 写作能力大冒险" },
      { name: "description", content: "探索内容寻宝岛、词语魔法屋、句子升级站和作文宝藏挑战，开启你的华文写作冒险。" },
      { property: "og:title", content: "作文闯关岛 · 写作能力大冒险" },
      { property: "og:description", content: "四座奇幻岛屿，一场华文作文冒险。收集徽章，提升写作能力。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const s = useStore();
  const lv = levelInfo(s.xp);
  const completed = ISLANDS.filter(i => s.badges.includes(i.id)).length;
  const next = ISLANDS.find(i => !s.badges.includes(i.id)) ?? ISLANDS[3];
  return <div className="adventure-home">
    <img src={ocean} alt="" className="ocean-backdrop" width={1920} height={1024} fetchPriority="high" />
    <div className="adventure-content">
      <section className="adventure-intro">
        <div className="explorer-welcome"><img src={explorer} alt="戴探险帽、拿藏宝图的小探险家与海鸥伙伴" width={816} height={816} /><div><span>欢迎回来，{s.name || "探险家"}！</span><strong>Lv.{lv.lv} · {lv.title}</strong></div></div>
        <div className="game-title"><div className="title-compass"><Compass /></div><h1>作文闯关岛</h1><p>写作能力大冒险</p></div>
        <div className="intro-note"><span>每一个好故事</span><strong>都从勇敢出发开始。</strong><div><Sparkles size={15} /> 今天，也让文字闪耀吧！</div></div>
      </section>
      <PlayerPanel player={s} completed={completed} />
      <AdventureMap badges={s.badges} />
      <section className="adventure-mission">
        <div className="mission-title"><Map size={27} /><div><span>本次冒险任务</span><h2>把灵感，变成好故事</h2></div></div>
        <ul><li><CheckCircle2 />掌握审题与选材技巧</li><li><Sparkles />提升词汇运用能力</li><li><PenLine />把句子写得具体生动</li></ul>
        <div className="mission-action"><span><Clock3 size={14} />全程约 45 分钟</span><Button asChild variant="adventure" size="lg"><Link to={next.to}>{completed ? "继续冒险" : "开始冒险"}<ArrowRight /></Link></Button></div>
      </section>
      <footer className="adventure-footer"><span>记录仅保存在本设备浏览器中，清除浏览器数据会丢失；教师无法跨设备查看。</span><div><Link to="/plot"><PenLine size={14} />我的构思板</Link><Link to="/portfolio"><BookOpen size={14} />我的作品集</Link></div></footer>
    </div>
  </div>;
}
