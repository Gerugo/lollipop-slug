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
      <div className="candy-card rounded-2xl sm:rounded-3xl p-3 sm:p-5 max-w-md w-full flex flex-col items-center text-center shadow-2xl border-2 border-candy-yellow/60 m-auto max-h-[96dvh] overflow-y-auto">
        {/* Header with Badge & Title */}
        <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-candy-yellow via-amber-400 to-candy-pink p-0.5 flex items-center justify-center shadow-lg shadow-candy-yellow/40 animate-bounce-soft shrink-0">
            <Trophy size={18} className="text-slate-950 sm:w-6 sm:h-6" />
          </div>
          <div className="text-left">
            <h2 className="text-lg sm:text-2xl font-bungee text-candy-yellow tracking-wide leading-tight text-stroke-thin">
              ¡VICTORIA TOTAL!
            </h2>
            <p className="font-arcade text-[9px] sm:text-[11px] text-candy-mint tracking-wider uppercase">
              HAS SALVADO EL MUNDO LULIPOP 🍭✨
            </p>
          </div>
        </div>

        {/* Results & Score Tally Box - 2 Column Grid for landscape compact fit */}
        <div className="w-full bg-slate-900/85 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-white/20 mb-2.5 sm:mb-3.5 font-arcade text-xs text-slate-200 grid grid-cols-2 gap-2 text-left">
          <div className="flex flex-col justify-center border-r border-white/10 pr-2">
            <span className="text-slate-400 text-[9px] sm:text-[11px]">TIEMPO:</span>
            <span className="text-white font-bold text-xs sm:text-sm">{timeStr}</span>
          </div>

          <div className="flex flex-col justify-center pl-1">
            <span className="text-slate-400 text-[9px] sm:text-[11px]">REHENES:</span>
            <span className="text-candy-mint font-bold text-[11px] sm:text-xs flex items-center gap-1">
              <span>🍪 {rescuedHostages}/{totalHostages}</span>
              <span className="text-candy-yellow text-[9px]">(+{hostageBonus})</span>
            </span>
          </div>

          <div className="flex flex-col justify-center border-r border-white/10 pr-2 border-t border-white/10 pt-1.5">
            <span className="text-slate-400 text-[9px] sm:text-[11px]">RANGO:</span>
            <span className={`text-sm sm:text-lg font-bungee ${rankColor} text-stroke-thin flex items-center gap-1`}>
              <Star size={14} className="fill-current" /> RANK {rank}
            </span>
          </div>

          <div className="flex flex-col justify-center pl-1 border-t border-white/10 pt-1.5">
            <span className="text-candy-pink font-bold text-[9px] sm:text-[11px]">PUNTOS:</span>
            <span className="text-candy-yellow text-sm sm:text-base font-bold tracking-wider">
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
