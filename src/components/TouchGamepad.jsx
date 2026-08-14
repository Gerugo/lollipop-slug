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
    <div className="absolute inset-0 pointer-events-none z-20 flex justify-between items-end p-6 md:p-8 select-none">
      {/* 1. Left: Ergonomic Pastel Glassmorphism D-Pad */}
      <div className="pointer-events-auto relative w-40 h-40 sm:w-44 sm:h-44 bg-pink-500/20 backdrop-blur-[6px] rounded-full border-2 border-white/40 shadow-[0_8px_32px_rgba(255,119,176,0.25),inset_0_2px_4px_rgba(255,255,255,0.4)] p-2 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* UP Button (Aim Up) */}
          <button
            aria-label="Apuntar Arriba"
            onTouchStart={(e) => handleTouch('up', true, e)}
            onTouchEnd={(e) => handleTouch('up', false, e)}
            onTouchCancel={(e) => handleTouch('up', false, e)}
            onMouseDown={() => handleTouch('up', true)}
            onMouseUp={() => handleTouch('up', false)}
            className="absolute top-1 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-white/30 active:bg-pink-400 border border-white/60 rounded-2xl flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform duration-75"
          >
            <ArrowUp size={22} className="stroke-[3] drop-shadow" />
          </button>

          {/* DOWN Button (Crouch / Drop) */}
          <button
            aria-label="Agacharse"
            onTouchStart={(e) => handleTouch('down', true, e)}
            onTouchEnd={(e) => handleTouch('down', false, e)}
            onTouchCancel={(e) => handleTouch('down', false, e)}
            onMouseDown={() => handleTouch('down', true)}
            onMouseUp={() => handleTouch('down', false)}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-white/30 active:bg-pink-400 border border-white/60 rounded-2xl flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform duration-75"
          >
            <ArrowDown size={22} className="stroke-[3] drop-shadow" />
          </button>

          {/* LEFT Button (Run Left) */}
          <button
            aria-label="Mover Izquierda"
            onTouchStart={(e) => handleTouch('left', true, e)}
            onTouchEnd={(e) => handleTouch('left', false, e)}
            onTouchCancel={(e) => handleTouch('left', false, e)}
            onMouseDown={() => handleTouch('left', true)}
            onMouseUp={() => handleTouch('left', false)}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-white/30 active:bg-pink-400 border border-white/60 rounded-2xl flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform duration-75"
          >
            <ArrowLeft size={22} className="stroke-[3] drop-shadow" />
          </button>

          {/* RIGHT Button (Run Right) */}
          <button
            aria-label="Mover Derecha"
            onTouchStart={(e) => handleTouch('right', true, e)}
            onTouchEnd={(e) => handleTouch('right', false, e)}
            onTouchCancel={(e) => handleTouch('right', false, e)}
            onMouseDown={() => handleTouch('right', true)}
            onMouseUp={() => handleTouch('right', false)}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-white/30 active:bg-pink-400 border border-white/60 rounded-2xl flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform duration-75"
          >
            <ArrowRight size={22} className="stroke-[3] drop-shadow" />
          </button>

          {/* Center Candy Jewel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-tr from-candy-pink to-candy-yellow border-2 border-white/80 flex items-center justify-center shadow-md pointer-events-none">
            <span className="text-[11px] leading-none">🍭</span>
          </div>
        </div>
      </div>

      {/* 2. Right: Ergonomic Thumb Arc (Glassmorphism Candy Action Controls) */}
      <div className="pointer-events-auto relative w-52 h-44 sm:w-56 sm:h-48">
        {/* Semi-transparent Glass Backplate for the Thumb Arc */}
        <div className="absolute inset-0 bg-blue-500/15 backdrop-blur-[6px] rounded-3xl border-2 border-white/40 shadow-[0_8px_32px_rgba(112,214,255,0.2),inset_0_2px_4px_rgba(255,255,255,0.4)] pointer-events-none" />

        {/* 1. SLUG / VEHICLE Action (Top Right of the thumb arc) */}
        <button
          aria-label="Montar o Salir del Tanque"
          onTouchStart={(e) => handleTouch('vehicle', true, e)}
          onTouchEnd={(e) => handleTouch('vehicle', false, e)}
          onTouchCancel={(e) => handleTouch('vehicle', false, e)}
          onMouseDown={() => handleTouch('vehicle', true)}
          onMouseUp={() => handleTouch('vehicle', false)}
          className="absolute top-2 right-4 w-12 h-12 bg-gradient-to-b from-amber-300 to-amber-500 active:from-amber-400 active:to-amber-600 border-2 border-white rounded-2xl flex flex-col items-center justify-center text-white font-bungee text-[9px] shadow-[0_4px_12px_rgba(245,158,11,0.35),inset_0_2px_2px_rgba(255,255,255,0.7)] active:scale-90 transition-transform duration-75"
        >
          <span className="text-sm leading-none">🛡️</span>
          <span className="text-[7px] tracking-tight">SLUG</span>
        </button>

        {/* 2. GRENADE Button (Top Left of the thumb arc) */}
        <button
          aria-label="Lanzar Granada"
          onTouchStart={(e) => handleTouch('grenade', true, e)}
          onTouchEnd={(e) => handleTouch('grenade', false, e)}
          onTouchCancel={(e) => handleTouch('grenade', false, e)}
          onMouseDown={() => handleTouch('grenade', true)}
          onMouseUp={() => handleTouch('grenade', false)}
          className="absolute top-4 left-4 w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-b from-sky-300 to-sky-500 active:from-sky-400 active:to-sky-600 border-2 border-white rounded-2xl flex flex-col items-center justify-center text-white font-bungee text-[10px] shadow-[0_4px_12px_rgba(14,165,233,0.35),inset_0_2px_2px_rgba(255,255,255,0.7)] active:scale-90 transition-transform duration-75"
        >
          <Bomb size={18} className="mb-0.5 drop-shadow" />
          <span className="text-[8px] tracking-tight">BOMBA</span>
        </button>

        {/* 3. JUMP Button (Bottom Left along natural thumb sweep) */}
        <button
          aria-label="Saltar"
          onTouchStart={(e) => handleTouch('jump', true, e)}
          onTouchEnd={(e) => handleTouch('jump', false, e)}
          onTouchCancel={(e) => handleTouch('jump', false, e)}
          onMouseDown={() => handleTouch('jump', true)}
          onMouseUp={() => handleTouch('jump', false)}
          className="absolute bottom-2.5 left-4 w-15 h-15 sm:w-16 sm:h-16 bg-gradient-to-b from-emerald-300 to-emerald-500 active:from-emerald-400 active:to-emerald-600 border-2 border-white rounded-3xl flex flex-col items-center justify-center text-white font-bungee text-xs shadow-[0_6px_16px_rgba(16,185,129,0.4),inset_0_2px_3px_rgba(255,255,255,0.7)] active:scale-90 transition-transform duration-75"
        >
          <ArrowBigUp size={22} className="fill-white stroke-none drop-shadow" />
          <span className="text-[9px] tracking-wide">SALTO</span>
        </button>

        {/* 4. SHOOT Button (Primary focal point, comfortably right under the thumb) */}
        <button
          aria-label="Disparar"
          onTouchStart={(e) => handleTouch('shoot', true, e)}
          onTouchEnd={(e) => handleTouch('shoot', false, e)}
          onTouchCancel={(e) => handleTouch('shoot', false, e)}
          onMouseDown={() => handleTouch('shoot', true)}
          onMouseUp={() => handleTouch('shoot', false)}
          className="absolute bottom-2 right-2.5 w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-b from-pink-400 to-rose-500 active:from-pink-500 active:to-rose-600 border-3 border-white rounded-3xl flex flex-col items-center justify-center text-white font-bungee shadow-[0_6px_20px_rgba(244,63,94,0.45),inset_0_2px_4px_rgba(255,255,255,0.8)] active:scale-90 transition-transform duration-75"
        >
          <Zap size={24} className="fill-yellow-300 stroke-white stroke-2 drop-shadow" />
          <span className="text-[11px] tracking-wider">FUEGO</span>
        </button>
      </div>
    </div>
  );
};
export default TouchGamepad;
