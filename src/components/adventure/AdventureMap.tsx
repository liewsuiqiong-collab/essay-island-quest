import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock3, Compass, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATIONS, stationDone, stationScore } from "@/lib/scores";
import type { State } from "@/lib/store";
import treasure from "@/assets/treasure-island.png";
import magic from "@/assets/magic-island.png";
import sentence from "@/assets/sentence-island.png";
import museumIsland from "@/assets/museum-island.png";
import finalIsland from "@/assets/final-island.png";

const ART: Record<string, { image: string; theme: string }> = {
  audit: { image: treasure, theme: "treasure" },
  words: { image: magic, theme: "magic" },
  describe: { image: sentence, theme: "sentence" },
  museum: { image: museumIsland, theme: "museum" },
  challenge: { image: finalIsland, theme: "final" },
};

export function AdventureMap({ player }: { player: State }) {
  return <section className="adventure-map" aria-label="五座冒险岛屿">
    <div className="map-heading"><Compass size={21} /><h2>你的冒险地图</h2><span>五座岛屿 · 建议按顺序挑战 · 总分 100</span></div>
    <div className="island-grid">
      <svg className="adventure-trail" viewBox="0 0 1100 370" preserveAspectRatio="none" aria-hidden="true"><path d="M 90 225 C 165 330 200 75 310 120 S 420 320 530 225 S 640 40 750 110 S 880 320 1010 180" /></svg>
      {STATIONS.map((st, index) => {
        const { image, theme } = ART[st.id]!;
        const completed = stationDone(player, st.id);
        const score = stationScore(player, st.id);
        const caption = (
          <div className="island-caption">
            <div className="island-number">{String(index + 1).padStart(2, "0")}</div>
            <h3>{st.name}</h3>
            <p>{st.subtitle}</p>
            <div className="island-meta">
              <span><Clock3 size={12} />{st.time}</span>
              <span>{score === null ? `满分 ${st.max} 分` : `得分 ${score}/${st.max}`}</span>
              <span aria-label={completed ? "已完成" : "待挑战"}><Star size={14} className={completed ? "earned-star" : "unearned-star"} />{completed ? "已完成" : "待挑战"}</span>
            </div>
            <Button asChild variant="adventure" className="island-enter"><Link to={st.to}>{completed ? "再次探索" : "进入岛屿"}<ArrowRight /></Link></Button>
          </div>
        );
        return <article key={st.id} className={`island island-${theme}`}>
          <div className="island-status">{completed ? <><Check size={13} />已完成</> : <><span className="status-dot" />{index === STATIONS.length - 1 ? "最终挑战" : "准备出发"}</>}</div>
          <Link to={st.to} className="island-art-link" aria-label={`探索${st.name}`}><img src={image} alt={st.name} width={816} height={816} className="island-art" loading={index < 2 ? "eager" : "lazy"} /></Link>
          {caption}
        </article>;
      })}
    </div>
  </section>;
}
