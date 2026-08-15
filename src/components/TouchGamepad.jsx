import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, ArrowBigUp, Bomb } from 'lucide-react';

export const TouchGamepad = ({ onTouchInput }) => {
  const handleTouch = (action, active, e) => {
    if (e && e.cancelable) {
      e.preventDefault();
    }
    onTouchInput(action, active);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex justify-between items-end p-3 sm:p-6 md:p-8 select-none">
      {/* 1. Left: Lightweight Transparent Glass D-Pad */}
      <div className="pointer-events-auto relative w-36 h-36 sm:w-40 sm:h-40">
        {/* Subtle center indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] opacity-60">🍭</span>
        </div>

        {/* UP Button (Aim Up) */}
        <button
          aria-label="Apuntar Arriba"
          onTouchStart={(e) => handleTouch('up', true, e)}
          onTouchEnd={(e) => handleTouch('up', false, e)}
          onTouchCancel={(e) => handleTouch('up', false, e)}
          onMouseDown={() => handleTouch('up', true)}
          onMouseUp={() => handleTouch('up', false)}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-white/15 active:bg-pink-500/60 border border-white/40 active:border-white rounded-2xl backdrop-blur-sm flex items-center justify-center text-white shadow-sm active:scale-90 transition-all duration-75"
        >
          <ArrowUp size={22} className="stroke-[2.5] drop-shadow opacity-90" />
        </button>

        {/* DOWN Button (Crouch / Drop) */}
        <button
          aria-label="Agacharse"
          onTouchStart={(e) => handleTouch('down', true, e)}
          onTouchEnd={(e) => handleTouch('down', false, e)}
          onTouchCancel={(e) => handleTouch('down', false, e)}
          onMouseDown={() => handleTouch('down', true)}
          onMouseUp={() => handleTouch('down', false)}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-white/15 active:bg-pink-500/60 border border-white/40 active:border-white rounded-2xl backdrop-blur-sm flex items-center justify-center text-white shadow-sm active:scale-90 transition-all duration-75"
        >
          <ArrowDown size={22} className="stroke-[2.5] drop-shadow opacity-90" />
        </button>

        {/* LEFT Button (Run Left) */}
        <button
          aria-label="Mover Izquierda"
          onTouchStart={(e) => handleTouch('left', true, e)}
          onTouchEnd={(e) => handleTouch('left', false, e)}
          onTouchCancel={(e) => handleTouch('left', false, e)}
          onMouseDown={() => handleTouch('left', true)}
          onMouseUp={() => handleTouch('left', false)}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-white/15 active:bg-pink-500/60 border border-white/40 active:border-white rounded-2xl backdrop-blur-sm flex items-center justify-center text-white shadow-sm active:scale-90 transition-all duration-75"
        >
          <ArrowLeft size={22} className="stroke-[2.5] drop-shadow opacity-90" />
        </button>

        {/* RIGHT Button (Run Right) */}
        <button
          aria-label="Mover Derecha"
          onTouchStart={(e) => handleTouch('right', true, e)}
          onTouchEnd={(e) => handleTouch('right', false, e)}
          onTouchCancel={(e) => handleTouch('right', false, e)}
          onMouseDown={() => handleTouch('right', true)}
          onMouseUp={() => handleTouch('right', false)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-white/15 active:bg-pink-500/60 border border-white/40 active:border-white rounded-2xl backdrop-blur-sm flex items-center justify-center text-white shadow-sm active:scale-90 transition-all duration-75"
        >
          <ArrowRight size={22} className="stroke-[2.5] drop-shadow opacity-90" />
        </button>
      </div>

      {/* 2. Right: Ergonomic Semi-Transparent Action Buttons */}
      <div className="pointer-events-auto relative w-48 h-40 sm:w-52 sm:h-44">
        {/* 1. SLUG / VEHICLE (Top Right) */}
        <button
          aria-label="Montar o Salir del Tanque"
          onTouchStart={(e) => handleTouch('vehicle', true, e)}
          onTouchEnd={(e) => handleTouch('vehicle', false, e)}
          onTouchCancel={(e) => handleTouch('vehicle', false, e)}
          onMouseDown={() => handleTouch('vehicle', true)}
          onMouseUp={() => handleTouch('vehicle', false)}
          className="absolute top-1 right-2 w-11 h-11 sm:w-12 sm:h-12 bg-amber-500/30 active:bg-amber-500/80 border border-amber-300/60 active:border-white rounded-2xl backdrop-blur-sm flex flex-col items-center justify-center text-white font-bungee text-[8px] active:scale-90 transition-all duration-75"
        >
          <span className="text-xs leading-none opacity-90">🛡️</span>
          <span className="text-[7px] tracking-tight opacity-80">SLUG</span>
        </button>

        {/* 2. GRENADE (Top Left) */}
        <button
          aria-label="Lanzar Granada"
          onTouchStart={(e) => handleTouch('grenade', true, e)}
          onTouchEnd={(e) => handleTouch('grenade', false, e)}
          onTouchCancel={(e) => handleTouch('grenade', false, e)}
          onMouseDown={() => handleTouch('grenade', true)}
          onMouseUp={() => handleTouch('grenade', false)}
          className="absolute top-3 left-2 w-12 h-12 sm:w-13 sm:h-13 bg-sky-500/30 active:bg-sky-500/80 border border-sky-300/60 active:border-white rounded-2xl backdrop-blur-sm flex flex-col items-center justify-center text-white font-bungee text-[9px] active:scale-90 transition-all duration-75"
        >
          <Bomb size={16} className="mb-0.5 opacity-90" />
          <span className="text-[8px] tracking-tight opacity-80">BOMBA</span>
        </button>

        {/* 3. JUMP Button (Bottom Left) */}
        <button
          aria-label="Saltar"
          onTouchStart={(e) => handleTouch('jump', true, e)}
          onTouchEnd={(e) => handleTouch('jump', false, e)}
          onTouchCancel={(e) => handleTouch('jump', false, e)}
          onMouseDown={() => handleTouch('jump', true)}
          onMouseUp={() => handleTouch('jump', false)}
          className="absolute bottom-1 left-2 w-14 h-14 sm:w-15 sm:h-15 bg-emerald-500/35 active:bg-emerald-500/85 border border-emerald-300/70 active:border-white rounded-3xl backdrop-blur-sm flex flex-col items-center justify-center text-white font-bungee active:scale-90 transition-all duration-75"
        >
          <ArrowBigUp size={20} className="fill-white stroke-none opacity-90" />
          <span className="text-[9px] tracking-wide opacity-85">SALTO</span>
        </button>

        {/* 4. SHOOT Button (Bottom Right) */}
        <button
          aria-label="Disparar"
          onTouchStart={(e) => handleTouch('shoot', true, e)}
          onTouchEnd={(e) => handleTouch('shoot', false, e)}
          onTouchCancel={(e) => handleTouch('shoot', false, e)}
          onMouseDown={() => handleTouch('shoot', true)}
          onMouseUp={() => handleTouch('shoot', false)}
          className="absolute bottom-0 right-0 w-16 h-16 sm:w-18 sm:h-18 bg-pink-500/40 active:bg-pink-500/90 border-2 border-pink-300/80 active:border-white rounded-3xl backdrop-blur-sm flex flex-col items-center justify-center text-white font-bungee shadow-lg active:scale-90 transition-all duration-75"
        >
          <Zap size={22} className="fill-yellow-300 stroke-white stroke-1.5 opacity-95" />
          <span className="text-[10px] tracking-wider opacity-90">FUEGO</span>
        </button>
      </div>
    </div>
  );
};
export default TouchGamepad;
