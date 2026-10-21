import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock3, Compass, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import treasure from "@/assets/treasure-island.png";
import magic from "@/assets/magic-island.png";
import sentence from "@/assets/sentence-island.png";
import finalIsland from "@/assets/final-island.png";

export const ISLANDS = [
  { id: "audit", name: "内容寻宝岛", to: "/audit", image: treasure, theme: "treasure", time: "约 10 分钟", subtitle: "发现题目里的秘密", number: "01" },
  { id: "words", name: "词语魔法屋", to: "/words", image: magic, theme: "magic", time: "约 8 分钟", subtitle: "收集有力量的词语", number: "02" },
  { id: "describe", name: "句子升级站", to: "/describe", image: sentence, theme: "sentence", time: "约 10 分钟", subtitle: "让每一句话闪闪发光", number: "03" },
  { id: "challenge", name: "作文宝藏挑战", to: "/challenge", image: finalIsland, theme: "final", time: "约 17 分钟", subtitle: "写下属于你的故事", number: "04" },
] as const;

export function AdventureMap({ badges }: { badges: string[] }) {
  return <section className="adventure-map" aria-label="四座冒险岛屿">
    <div className="map-heading"><Compass size={21} /><h2>你的冒险地图</h2><span>四座岛屿 · 一场写作冒险</span></div>
    <div className="island-grid">
      <svg className="adventure-trail" viewBox="0 0 1100 370" preserveAspectRatio="none" aria-hidden="true"><path d="M 120 225 C 235 330 290 75 400 120 S 550 320 660 225 S 835 40 985 110" /></svg>
      {ISLANDS.map((island, index) => {
        const completed = badges.includes(island.id);
        return <article key={island.id} className={`island island-${island.theme}`}>
          <div className="island-status">{completed ? <><Check size={13} />已完成</> : <><span className="status-dot" />{index === 3 ? "最终挑战" : "准备出发"}</>}</div>
          <Link to={island.to} className="island-art-link" aria-label={`探索${island.name}`}><img src={island.image} alt={island.name} width={816} height={816} className="island-art" loading={index < 2 ? "eager" : "lazy"} /></Link>
          <div className="island-caption">
            <div className="island-number">{island.number}</div>
            <h3>{island.name}</h3>
            <p>{island.subtitle}</p>
            <div className="island-meta"><span><Clock3 size={12} />{island.time}</span><span aria-label={completed ? "已获得关卡徽章" : "尚未获得关卡徽章"}><Star size={14} className={completed ? "earned-star" : "unearned-star"} />{completed ? "已获徽章" : "待挑战"}</span></div>
            <Button asChild variant="adventure" className="island-enter"><Link to={island.to}>{completed ? "再次探索" : "进入岛屿"}<ArrowRight /></Link></Button>
          </div>
        </article>;
      })}
    </div>
  </section>;
}