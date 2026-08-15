import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

export const PauseModal = ({
  onResume,
  onRestart,
  onExitToMenu,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none overflow-y-auto">
      <div className="candy-card rounded-3xl p-4 sm:p-6 max-w-sm w-full flex flex-col items-center text-center shadow-2xl animate-bounce-soft m-auto max-h-[94vh] overflow-y-auto">
        <h2 className="text-2xl sm:text-3xl font-bungee text-candy-yellow tracking-wider mb-0.5 text-stroke-thin">
          PAUSA ⏸️
        </h2>
        <p className="font-arcade text-[10px] sm:text-xs text-slate-300 mb-3 sm:mb-4">MISIÓN EN ESPERA</p>

        {/* Buttons */}
        <div className="flex flex-col gap-2 sm:gap-2.5 w-full mb-3 sm:mb-4">
          <button
            onClick={onResume}
            className="w-full py-2.5 sm:py-3 px-4 sm:px-6 candy-button-green rounded-xl sm:rounded-2xl font-bungee text-white text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Play size={16} className="fill-white stroke-none" />
            REANUDAR
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 sm:py-3 px-4 sm:px-6 candy-button-blue rounded-xl sm:rounded-2xl font-bungee text-white text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <RotateCcw size={16} />
            REINICIAR MISIÓN
          </button>

          <button
            onClick={onExitToMenu}
            className="w-full py-2 sm:py-2.5 px-4 sm:px-6 bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-white/20 rounded-xl sm:rounded-2xl font-candy text-slate-300 text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} />
            MENÚ PRINCIPAL
          </button>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={onToggleMute}
          className="flex items-center gap-2 text-[11px] sm:text-xs font-arcade text-slate-300 hover:text-white"
        >
          {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-candy-green" />}
          <span>{isMuted ? 'ACTIVAR SONIDO' : 'SILENCIAR SONIDO'}</span>
        </button>
      </div>
    </div>
  );
};
export default PauseModal;
