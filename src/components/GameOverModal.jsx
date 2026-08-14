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
    <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 select-none">
      <div className="candy-card rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl animate-bounce-soft border-2 border-red-500/50">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-3 text-red-400">
          <Skull size={36} />
        </div>

        <h2 className="text-4xl font-bungee text-red-500 tracking-wider mb-1 text-stroke-thin animate-pulse">
          GAME OVER
        </h2>

        {/* Retro Countdown */}
        <div className="my-4 flex flex-col items-center">
          <span className="font-arcade text-xs text-slate-300 mb-1">CONTINUE?</span>
          <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-candy-yellow flex items-center justify-center shadow-inner">
            <span className="font-bungee text-4xl text-candy-yellow animate-ping">
              {countdown}
            </span>
          </div>
        </div>

        {/* Score Summary */}
        <div className="w-full bg-slate-900/80 rounded-2xl p-3 border border-white/10 flex justify-around items-center mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-arcade text-slate-400">PUNTUACIÓN</span>
            <span className="text-lg font-arcade text-candy-yellow">{safeScore}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-arcade text-slate-400 flex items-center gap-1">
              <Trophy size={12} className="text-amber-400" /> RÉCORD
            </span>
            <span className="text-lg font-arcade text-white">{safeHighScore}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onContinue}
            className="w-full py-4 px-6 candy-button-pink rounded-2xl font-bungee text-white text-lg tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"
          >
            <RotateCcw size={22} />
            ¡CONTINUAR! (INSERT COIN)
          </button>

          <button
            onClick={onExitToMenu}
            className="w-full py-2.5 px-6 bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-white/20 rounded-2xl font-candy text-slate-300 text-sm transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} />
            MENÚ PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
};
export default GameOverModal;
