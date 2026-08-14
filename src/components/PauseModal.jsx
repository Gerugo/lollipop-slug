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
    <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="candy-card rounded-3xl p-6 sm:p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl animate-bounce-soft">
        <h2 className="text-3xl font-bungee text-candy-yellow tracking-wider mb-1 text-stroke-thin">
          PAUSA ⏸️
        </h2>
        <p className="font-arcade text-xs text-slate-300 mb-6">MISIÓN EN ESPERA</p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full mb-6">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-6 candy-button-green rounded-2xl font-bungee text-white text-base tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Play size={20} className="fill-white stroke-none" />
            REANUDAR
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-6 candy-button-blue rounded-2xl font-bungee text-white text-sm tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <RotateCcw size={18} />
            REINICIAR MISIÓN
          </button>

          <button
            onClick={onExitToMenu}
            className="w-full py-2.5 px-6 bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-white/20 rounded-2xl font-candy text-slate-300 text-sm transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} />
            MENÚ PRINCIPAL
          </button>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={onToggleMute}
          className="flex items-center gap-2 text-xs font-arcade text-slate-300 hover:text-white"
        >
          {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-candy-green" />}
          <span>{isMuted ? 'ACTIVAR SONIDO' : 'SILENCIAR SONIDO'}</span>
        </button>
      </div>
    </div>
  );
};
export default PauseModal;
