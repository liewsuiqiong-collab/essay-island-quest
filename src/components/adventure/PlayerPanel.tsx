import { Flag, Star, Trophy, Target } from "lucide-react";
import { setName, setPlayerDetails, type State } from "@/lib/store";
import { STATIONS, stationDone, totalScore, TOTAL_MAX } from "@/lib/scores";

export function PlayerPanel({ player }: { player: State }) {
  const completed = STATIONS.filter((st) => stationDone(player, st.id)).length;
  const total = totalScore(player);
  return <section className="player-panel" aria-label="玩家信息">
    <div className="player-inputs">
      <label><span>探险家姓名</span><input aria-label="玩家姓名" value={player.name} onChange={e => setName(e.target.value)} maxLength={30} /></label>
      <label><span>我的班级</span><input aria-label="玩家班级" placeholder="输入班级" value={player.className} onChange={e => setPlayerDetails({ className: e.target.value })} maxLength={30} /></label>
    </div>
    <div className="player-rewards"><Star className="reward-star" size={29} /><div><strong>{player.xp}</strong><span>冒险 XP</span></div><div className="reward-divider" /><Trophy size={26} className="reward-trophy" /><div><strong>{player.badges.length}</strong><span>我的徽章</span></div><div className="reward-divider" /><Target size={26} className="reward-trophy" /><div><strong>{total}</strong><span>总分 /{TOTAL_MAX}</span></div></div>
    <div className="player-progress"><div><span><Flag size={13} /> 闯关进度</span><strong>{completed} / {STATIONS.length}</strong></div><div className="quest-progress" role="progressbar" aria-label="五岛闯关进度" aria-valuemin={0} aria-valuemax={STATIONS.length} aria-valuenow={completed}><span style={{ width: `${(completed / STATIONS.length) * 100}%` }} /></div></div>
  </section>;
}
