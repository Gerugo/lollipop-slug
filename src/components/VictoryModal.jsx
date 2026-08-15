import React from 'react';
import { Trophy, Award, Sparkles, Play, Home, Star } from 'lucide-react';

export const VictoryModal = ({
  score = 0,
  highScore = 0,
  rescuedHostages = 5,
  totalHostages = 5,
  gameTime = 0,
  onPlayAgain,
  onExitToMenu
}) => {
  const safeTime = Number(gameTime || 0);
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const numScore = Number(score || 0);
  const safeScore = numScore.toString().padStart(6, '0');

  // Calculate Rank
  let rank = 'B';
  let rankColor = 'text-candy-blue';
  if (numScore >= 80000) {
    rank = 'S';
    rankColor = 'text-candy-yellow';
  } else if (numScore >= 50000) {
    rank = 'A';
    rankColor = 'text-candy-pink';
  }

  const hostageBonus = Number(rescuedHostages || 0) * 10000;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 select-none overflow-y-auto">
      <div className="candy-card rounded-3xl p-4 sm:p-6 max-w-lg w-full flex flex-col items-center text-center shadow-2xl border-2 border-candy-yellow/60 m-auto max-h-[94vh] overflow-y-auto">
        {/* Victory Badge */}
        <div className="relative mb-1 sm:mb-2">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-candy-yellow via-amber-400 to-candy-pink p-1 flex items-center justify-center shadow-xl shadow-candy-yellow/40 animate-bounce-soft">
            <Trophy size={26} className="text-slate-950 sm:w-8 sm:h-8" />
          </div>
          <div className="absolute -top-1 -right-1 text-candy-yellow animate-spin-slow">
            <Sparkles size={18} />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bungee text-candy-yellow tracking-wide mb-0.5 text-stroke-thin">
          ¡VICTORIA TOTAL!
        </h2>
        <p className="font-arcade text-[10px] sm:text-xs text-candy-mint tracking-widest uppercase mb-3">
          HAS SALVADO EL MUNDO LULIPOP 🍭✨
        </p>

        {/* Results & Score Tally Box */}
        <div className="w-full bg-slate-900/85 rounded-2xl p-3 sm:p-4 border border-white/20 mb-4 flex flex-col gap-1.5 sm:gap-2.5 font-arcade text-xs text-slate-200">
          <div className="flex justify-between items-center pb-1.5 border-b border-white/10">
            <span className="text-slate-400 text-[11px] sm:text-xs">TIEMPO TOTAL:</span>
            <span className="text-white font-bold text-[11px] sm:text-xs">{timeStr}</span>
          </div>

          <div className="flex justify-between items-center pb-1.5 border-b border-white/10">
            <span className="text-slate-400 text-[11px] sm:text-xs">REHENES LIBERADOS:</span>
            <span className="text-candy-mint font-bold flex items-center gap-1 text-[11px] sm:text-xs">
              <span>🍪 x{rescuedHostages}/{totalHostages}</span>
              <span className="text-candy-yellow text-[9px] sm:text-[10px]">(+{hostageBonus} PTS)</span>
            </span>
          </div>

          <div className="flex justify-between items-center pb-1.5 border-b border-white/10">
            <span className="text-slate-400 text-[11px] sm:text-xs">RANGO DE COMBATE:</span>
            <span className={`text-lg sm:text-2xl font-bungee ${rankColor} text-stroke-thin flex items-center gap-1`}>
              <Star size={16} className="fill-current sm:w-5 sm:h-5" /> RANK {rank}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 text-xs sm:text-sm">
            <span className="text-candy-pink font-bold">PUNTUACIÓN TOTAL:</span>
            <span className="text-candy-yellow text-base sm:text-lg font-bold tracking-wider">
              {safeScore}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-2 sm:gap-3 w-full">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 sm:py-3.5 px-3 sm:px-6 candy-button-pink rounded-xl sm:rounded-2xl font-bungee text-white text-xs sm:text-sm tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-lg"
          >
            <Play size={16} className="fill-white stroke-none sm:w-5 sm:h-5" />
            JUGAR DE NUEVO
          </button>

          <button
            onClick={onExitToMenu}
            className="py-2.5 sm:py-3.5 px-3 sm:px-6 bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-white/20 rounded-xl sm:rounded-2xl font-candy text-slate-300 text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Home size={16} className="sm:w-5 sm:h-5" />
            MENÚ
          </button>
        </div>
      </div>
    </div>
  );
};
export default VictoryModal;
