import React, { useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, ArrowBigUp, Bomb } from 'lucide-react';

export const TouchGamepad = ({ onTouchInput }) => {
  const handleTouch = (action, active, e) => {
    if (e && e.cancelable) {
      e.preventDefault();
    }
    onTouchInput(action, active);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex justify-between items-end p-4 md:p-8 select-none">
      {/* Left: Virtual D-Pad */}
      <div className="pointer-events-auto relative w-36 h-36 sm:w-44 sm:h-44 bg-slate-900/60 backdrop-blur-md rounded-full border-2 border-white/20 shadow-2xl p-2 flex items-center justify-center">
        {/* D-Pad Cross Background */}
        <div className="relative w-full h-full">
          {/* UP Button (Aim Up) */}
          <button
            aria-label="Apuntar Arriba"
            onTouchStart={(e) => handleTouch('up', true, e)}
            onTouchEnd={(e) => handleTouch('up', false, e)}
            onTouchCancel={(e) => handleTouch('up', false, e)}
            onMouseDown={() => handleTouch('up', true)}
            onMouseUp={() => handleTouch('up', false)}
            className="absolute top-1 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-13 sm:h-13 bg-slate-800/90 active:bg-candy-pink border border-white/30 rounded-xl flex items-center justify-center text-white shadow active:scale-95 transition-transform"
          >
            <ArrowUp size={22} className="stroke-[3]" />
          </button>

          {/* DOWN Button (Crouch / Drop) */}
          <button
            aria-label="Agacharse"
            onTouchStart={(e) => handleTouch('down', true, e)}
            onTouchEnd={(e) => handleTouch('down', false, e)}
            onTouchCancel={(e) => handleTouch('down', false, e)}
            onMouseDown={() => handleTouch('down', true)}
            onMouseUp={() => handleTouch('down', false)}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-13 sm:h-13 bg-slate-800/90 active:bg-candy-pink border border-white/30 rounded-xl flex items-center justify-center text-white shadow active:scale-95 transition-transform"
          >
            <ArrowDown size={22} className="stroke-[3]" />
          </button>

          {/* LEFT Button (Run Left) */}
          <button
            aria-label="Mover Izquierda"
            onTouchStart={(e) => handleTouch('left', true, e)}
            onTouchEnd={(e) => handleTouch('left', false, e)}
            onTouchCancel={(e) => handleTouch('left', false, e)}
            onMouseDown={() => handleTouch('left', true)}
            onMouseUp={() => handleTouch('left', false)}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 bg-slate-800/90 active:bg-candy-pink border border-white/30 rounded-xl flex items-center justify-center text-white shadow active:scale-95 transition-transform"
          >
            <ArrowLeft size={22} className="stroke-[3]" />
          </button>

          {/* RIGHT Button (Run Right) */}
          <button
            aria-label="Mover Derecha"
            onTouchStart={(e) => handleTouch('right', true, e)}
            onTouchEnd={(e) => handleTouch('right', false, e)}
            onTouchCancel={(e) => handleTouch('right', false, e)}
            onMouseDown={() => handleTouch('right', true)}
            onMouseUp={() => handleTouch('right', false)}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 bg-slate-800/90 active:bg-candy-pink border border-white/30 rounded-xl flex items-center justify-center text-white shadow active:scale-95 transition-transform"
          >
            <ArrowRight size={22} className="stroke-[3]" />
          </button>

          {/* Center candy logo dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-candy-pink/40 border border-white/40 flex items-center justify-center pointer-events-none">
            <span className="text-[10px]">🍭</span>
          </div>
        </div>
      </div>

      {/* Right: Big Candy Action Buttons */}
      <div className="pointer-events-auto flex items-end gap-3 sm:gap-4">
        {/* GRENADE Button */}
        <div className="flex flex-col items-center gap-1 mb-2">
          <button
            aria-label="Lanzar Granada"
            onTouchStart={(e) => handleTouch('grenade', true, e)}
            onTouchEnd={(e) => handleTouch('grenade', false, e)}
            onTouchCancel={(e) => handleTouch('grenade', false, e)}
            onMouseDown={() => handleTouch('grenade', true)}
            onMouseUp={() => handleTouch('grenade', false)}
            className="w-14 h-14 sm:w-16 sm:h-16 candy-button-blue rounded-full flex flex-col items-center justify-center text-white font-bungee text-xs active:scale-90 transition-transform"
          >
            <Bomb size={20} className="mb-0.5" />
            <span className="text-[9px] tracking-tight">BOMBA</span>
          </button>
        </div>

        {/* JUMP Button */}
        <div className="flex flex-col items-center gap-1 mb-6">
          <button
            aria-label="Saltar"
            onTouchStart={(e) => handleTouch('jump', true, e)}
            onTouchEnd={(e) => handleTouch('jump', false, e)}
            onTouchCancel={(e) => handleTouch('jump', false, e)}
            onMouseDown={() => handleTouch('jump', true)}
            onMouseUp={() => handleTouch('jump', false)}
            className="w-16 h-16 sm:w-18 sm:h-18 candy-button-green rounded-full flex flex-col items-center justify-center text-white font-bungee text-xs active:scale-90 transition-transform"
          >
            <ArrowBigUp size={24} className="mb-0.5 fill-white stroke-none" />
            <span className="text-[10px] tracking-wide">SALTO</span>
          </button>
        </div>

        {/* SHOOT Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            aria-label="Disparar"
            onTouchStart={(e) => handleTouch('shoot', true, e)}
            onTouchEnd={(e) => handleTouch('shoot', false, e)}
            onTouchCancel={(e) => handleTouch('shoot', false, e)}
            onMouseDown={() => handleTouch('shoot', true)}
            onMouseUp={() => handleTouch('shoot', false)}
            className="w-20 h-20 sm:w-22 sm:h-22 candy-button-pink rounded-full flex flex-col items-center justify-center text-white font-bungee text-sm active:scale-90 transition-transform"
          >
            <Zap size={26} className="mb-0.5 fill-yellow-300 stroke-white stroke-2" />
            <span className="text-xs tracking-wider">FUEGO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default TouchGamepad;
