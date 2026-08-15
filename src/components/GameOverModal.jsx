import React, { useState, useEffect } from 'react';
import { RotateCcw, Home, Skull, Trophy } from 'lucide-react';

export const GameOverModal = ({
  score = 0,
  highScore = 0,
  onContinue,
  onExitToMenu
}) => {
  const [countdown, setCountdown] = useState(9);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const safeScore = (score !== undefined && score !== null)
    ? Number(score).toString().padStart(6, '0')
    : '000000';

  const safeHighScore = (highScore !== undefined && highScore !== null)
    ? Number(highScore).toString().padStart(6, '0')
    : '000000';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 select-none overflow-y-auto">
      <div className="candy-card rounded-2xl sm:rounded-3xl p-3 sm:p-5 max-w-md w-full flex flex-col items-center text-center shadow-2xl animate-bounce-soft border-2 border-red-500/50 m-auto max-h-[96dvh] overflow-y-auto">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 shrink-0">
            <Skull size={18} className="sm:w-6 sm:h-6" />
          </div>
          <div className="text-left">
            <h2 className="text-xl sm:text-3xl font-bungee text-red-500 tracking-wider text-stroke-thin animate-pulse">
              GAME OVER
            </h2>
          </div>
        </div>

        {/* Retro Countdown */}
        <div className="my-1 sm:my-2 flex items-center gap-3">
          <span className="font-arcade text-[10px] sm:text-xs text-slate-300">¿CONTINUAR?</span>
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-900 border-2 sm:border-4 border-candy-yellow flex items-center justify-center shadow-inner">
            <span className="font-bungee text-lg sm:text-2xl text-candy-yellow animate-ping">
              {countdown}
            </span>
          </div>
        </div>

        {/* Score Summary */}
        <div className="w-full bg-slate-900/80 rounded-xl p-2 sm:p-3 border border-white/10 flex justify-around items-center mb-2.5 sm:mb-3.5">
          <div className="flex flex-col items-center">
            <span className="text-[9px] sm:text-[10px] font-arcade text-slate-400">PUNTUACIÓN</span>
            <span className="text-sm sm:text-base font-arcade text-candy-yellow">{safeScore}</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] sm:text-[10px] font-arcade text-slate-400 flex items-center gap-1">
              <Trophy size={12} className="text-amber-400" /> RÉCORD
            </span>
            <span className="text-sm sm:text-base font-arcade text-white">{safeHighScore}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-2 sm:gap-3 w-full">
          <button
            onClick={onContinue}
            className="flex-1 py-2.5 sm:py-3.5 px-3 sm:px-6 candy-button-pink rounded-xl sm:rounded-2xl font-bungee text-white text-xs sm:text-sm tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-lg"
          >
            <RotateCcw size={16} className="sm:w-5 sm:h-5" />
            REINICIAR
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
export default GameOverModal;
