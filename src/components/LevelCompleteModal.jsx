import React, { useEffect, useState } from 'react';
import { Trophy, FastForward, Sparkles, Star } from 'lucide-react';

export const LevelCompleteModal = ({
  score = 0,
  rescuedHostages = 5,
  totalHostages = 5,
  gameTime = 0,
  onNextLevel
}) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNextLevel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onNextLevel]);

  const safeTime = Number(gameTime || 0);
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const numScore = Number(score || 0);
  const safeScore = numScore.toString().padStart(6, '0');

  // Calculate Rank
  let rank = 'B';
  let rankColor = 'text-candy-blue';
  if (numScore >= 40000) {
    rank = 'S';
    rankColor = 'text-candy-yellow';
  } else if (numScore >= 25000) {
    rank = 'A';
    rankColor = 'text-candy-pink';
  }

  const hostageBonus = Number(rescuedHostages || 0) * 10000;

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="candy-card rounded-3xl p-6 sm:p-8 max-w-lg w-full flex flex-col items-center text-center shadow-2xl border-2 border-candy-yellow/60 my-auto">
        {/* Victory Badge */}
        <div className="relative mb-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-candy-blue via-cyan-400 to-candy-mint p-1 flex items-center justify-center shadow-2xl shadow-candy-blue/40 animate-bounce-soft">
            <Trophy size={40} className="text-slate-950" />
          </div>
          <div className="absolute -top-1 -right-1 text-candy-yellow animate-spin-slow">
            <Sparkles size={24} />
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bungee text-candy-blue tracking-wide mb-1 text-stroke-thin">
          ¡NIVEL COMPLETADO!
        </h2>
        <p className="font-arcade text-xs text-candy-mint tracking-widest uppercase mb-4">
          PREPARANDO SIGUIENTE ZONA...
        </p>

        {/* Results & Score Tally Box */}
        <div className="w-full bg-slate-900/85 rounded-2xl p-4 border border-white/20 mb-6 flex flex-col gap-2.5 font-arcade text-xs text-slate-200">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-slate-400">TIEMPO DE SECTOR:</span>
            <span className="text-white font-bold">{timeStr}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-slate-400">REHENES LIBERADOS:</span>
            <span className="text-candy-mint font-bold flex items-center gap-1">
              <span>🍪 x{rescuedHostages}/{totalHostages}</span>
              <span className="text-candy-yellow text-[10px]">(+{hostageBonus} PTS)</span>
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-slate-400">RANGO DE COMBATE:</span>
            <span className={`text-2xl font-bungee ${rankColor} text-stroke-thin flex items-center gap-1`}>
              <Star size={18} className="fill-current" /> RANK {rank}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 text-sm">
            <span className="text-candy-pink font-bold">PUNTUACIÓN ACTUAL:</span>
            <span className="text-candy-yellow text-lg font-bold tracking-wider">
              {safeScore}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full">
          <button
            onClick={onNextLevel}
            className="w-full py-4 px-6 candy-button-blue rounded-2xl font-bungee text-white text-base tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"
          >
            <FastForward size={20} className="fill-white stroke-none" />
            AVANZAR AHORA ({countdown}s)
          </button>
        </div>
      </div>
    </div>
  );
};
export default LevelCompleteModal;
