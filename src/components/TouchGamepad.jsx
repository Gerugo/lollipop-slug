import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, ArrowBigUp, Bomb } from 'lucide-react';

export const TouchGamepad = ({ onTouchInput }) => {
  // Directional stick state
  const dpadRef = useRef(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [activeDirections, setActiveDirections] = useState({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // Action buttons active visual state
  const [activeActions, setActiveActions] = useState({
    jump: false,
    shoot: false,
    grenade: false,
    vehicle: false
  });

  // Keep references of active touch IDs to prevent conflicts
  const dpadTouchIdRef = useRef(null);
  const activeDirectionsRef = useRef({ up: false, down: false, left: false, right: false });
  const activeActionsRef = useRef({ jump: false, shoot: false, grenade: false, vehicle: false });

  // Helper to dispatch input changes cleanly
  const updateDirection = useCallback((dir, value) => {
    if (activeDirectionsRef.current[dir] !== value) {
      activeDirectionsRef.current[dir] = value;
      onTouchInput(dir, value);
    }
  }, [onTouchInput]);

  const updateAction = useCallback((action, value) => {
    if (activeActionsRef.current[action] !== value) {
      activeActionsRef.current[action] = value;
      onTouchInput(action, value);
      setActiveActions(prev => ({ ...prev, [action]: value }));
    }
  }, [onTouchInput]);

  // Process D-Pad Touch Coordinates (Dynamic Angle & Radial Tolerance)
  const processDpadPosition = useCallback((clientX, clientY) => {
    if (!dpadRef.current) return;
    const rect = dpadRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    const maxRadius = rect.width * 0.38; // Maximum visual travel for the thumb knob
    const deadzone = 10; // Highly tolerant small deadzone for immediate response

    if (dist < deadzone) {
      // Within deadzone: reset all directions
      updateDirection('up', false);
      updateDirection('down', false);
      updateDirection('left', false);
      updateDirection('right', false);
      setKnobPos({ x: 0, y: 0 });
      setActiveDirections({ up: false, down: false, left: false, right: false });
      return;
    }

    // Clamp visual knob position within radius
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;
    setKnobPos({ x: knobX, y: knobY });

    // Tolerant 8-way directional thresholding (allows natural diagonal aiming & running)
    const isRight = dx > 12 && Math.abs(dx) > Math.abs(dy) * 0.38;
    const isLeft = dx < -12 && Math.abs(dx) > Math.abs(dy) * 0.38;
    const isUp = dy < -12 && Math.abs(dy) > Math.abs(dx) * 0.38;
    const isDown = dy > 12 && Math.abs(dy) > Math.abs(dx) * 0.38;

    updateDirection('right', isRight);
    updateDirection('left', isLeft);
    updateDirection('up', isUp);
    updateDirection('down', isDown);

    setActiveDirections({
      up: isUp,
      down: isDown,
      left: isLeft,
      right: isRight
    });
  }, [updateDirection]);

  // D-Pad Touch Handlers
  const handleDpadTouchStart = (e) => {
    if (e.cancelable) e.preventDefault();
    if (dpadTouchIdRef.current === null && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      dpadTouchIdRef.current = touch.identifier;
      processDpadPosition(touch.clientX, touch.clientY);
    }
  };

  const handleDpadTouchMove = (e) => {
    if (e.cancelable) e.preventDefault();
    if (dpadTouchIdRef.current !== null) {
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === dpadTouchIdRef.current) {
          processDpadPosition(e.touches[i].clientX, e.touches[i].clientY);
          break;
        }
      }
    }
  };

  const handleDpadTouchEnd = (e) => {
    if (e.cancelable) e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === dpadTouchIdRef.current) {
        dpadTouchIdRef.current = null;
        updateDirection('up', false);
        updateDirection('down', false);
        updateDirection('left', false);
        updateDirection('right', false);
        setKnobPos({ x: 0, y: 0 });
        setActiveDirections({ up: false, down: false, left: false, right: false });
        break;
      }
    }
  };

  // Generic Action Button Touch Handlers with Hitbox Tolerance
  const handleActionTouchStart = (action, e) => {
    if (e.cancelable) e.preventDefault();
    updateAction(action, true);
  };

  const handleActionTouchEnd = (action, e) => {
    if (e.cancelable) e.preventDefault();
    updateAction(action, false);
  };

  // Mouse fallback for desktop testing
  const isMouseDownRef = useRef(false);
  const handleMouseDown = (e) => {
    isMouseDownRef.current = true;
    processDpadPosition(e.clientX, e.clientY);
  };
  const handleMouseMove = (e) => {
    if (isMouseDownRef.current) {
      processDpadPosition(e.clientX, e.clientY);
    }
  };
  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    updateDirection('up', false);
    updateDirection('down', false);
    updateDirection('left', false);
    updateDirection('right', false);
    setKnobPos({ x: 0, y: 0 });
    setActiveDirections({ up: false, down: false, left: false, right: false });
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMouseDownRef.current) handleMouseUp();
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      // Clean up inputs on unmount
      ['left', 'right', 'up', 'down', 'jump', 'shoot', 'grenade', 'vehicle'].forEach(a => {
        onTouchInput(a, false);
      });
    };
  }, [onTouchInput]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-20 flex justify-between items-end pb-2 px-2 sm:pb-4 sm:px-5 md:p-6 select-none"
      style={{ touchAction: 'none' }}
    >
      {/* 1. Left: High-Tolerance Virtual Dynamic D-Pad / Thumbstick */}
      <div
        ref={dpadRef}
        onTouchStart={handleDpadTouchStart}
        onTouchMove={handleDpadTouchMove}
        onTouchEnd={handleDpadTouchEnd}
        onTouchCancel={handleDpadTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        aria-label="Pad de Control Direccional"
        className="pointer-events-auto relative w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-slate-950/20 backdrop-blur-[3px] border-2 border-white/25 shadow-xl flex items-center justify-center cursor-pointer transition-all duration-100"
        style={{ touchAction: 'none' }}
      >
        {/* Direction Indicator Rings */}
        <div className="absolute inset-2 rounded-full border border-white/15 pointer-events-none" />
        <div className="absolute inset-8 rounded-full border border-dashed border-white/20 pointer-events-none" />

        {/* UP ARROW */}
        <div
          className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-75 ${
            activeDirections.up
              ? 'bg-pink-500/80 text-white scale-110 shadow-[0_0_12px_rgba(236,72,153,0.9)] border border-white'
              : 'text-white/60 bg-white/10'
          }`}
        >
          <ArrowUp size={22} className="stroke-[2.5]" />
        </div>

        {/* DOWN ARROW */}
        <div
          className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-75 ${
            activeDirections.down
              ? 'bg-pink-500/80 text-white scale-110 shadow-[0_0_12px_rgba(236,72,153,0.9)] border border-white'
              : 'text-white/60 bg-white/10'
          }`}
        >
          <ArrowDown size={22} className="stroke-[2.5]" />
        </div>

        {/* LEFT ARROW */}
        <div
          className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-75 ${
            activeDirections.left
              ? 'bg-pink-500/80 text-white scale-110 shadow-[0_0_12px_rgba(236,72,153,0.9)] border border-white'
              : 'text-white/60 bg-white/10'
          }`}
        >
          <ArrowLeft size={22} className="stroke-[2.5]" />
        </div>

        {/* RIGHT ARROW */}
        <div
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-75 ${
            activeDirections.right
              ? 'bg-pink-500/80 text-white scale-110 shadow-[0_0_12px_rgba(236,72,153,0.9)] border border-white'
              : 'text-white/60 bg-white/10'
          }`}
        >
          <ArrowRight size={22} className="stroke-[2.5]" />
        </div>

        {/* Floating Glowing Thumbstick Knob */}
        <div
          className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-pink-500/70 to-rose-400/90 border-2 border-white shadow-lg pointer-events-none flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
          }}
        >
          <span className="text-sm select-none opacity-90 drop-shadow">🍭</span>
        </div>
      </div>

      {/* 2. Right: Large Ergonomic Action Buttons with Expanded Hitboxes */}
      <div
        className="pointer-events-auto relative w-56 h-44 sm:w-60 sm:h-48"
        style={{ touchAction: 'none' }}
      >
        {/* 1. SLUG / VEHICLE (Top Right) */}
        <button
          aria-label="Montar o Salir del Tanque"
          onTouchStart={(e) => handleActionTouchStart('vehicle', e)}
          onTouchEnd={(e) => handleActionTouchEnd('vehicle', e)}
          onTouchCancel={(e) => handleActionTouchEnd('vehicle', e)}
          onMouseDown={() => updateAction('vehicle', true)}
          onMouseUp={() => updateAction('vehicle', false)}
          className={`absolute top-0 right-2 w-12 h-12 sm:w-13 sm:h-13 rounded-2xl border flex flex-col items-center justify-center text-white font-bungee text-[8px] transition-all duration-75 shadow-md ${
            activeActions.vehicle
              ? 'bg-amber-500 text-white scale-90 border-white shadow-[0_0_15px_rgba(245,158,11,0.9)]'
              : 'bg-amber-500/35 border-amber-300/60 backdrop-blur-[2px]'
          }`}
          style={{ touchAction: 'none' }}
        >
          <span className="text-xs leading-none">🛡️</span>
          <span className="text-[7px] tracking-tight mt-0.5 opacity-90">SLUG</span>
        </button>

        {/* 2. GRENADE / BOMBA (Top Left) */}
        <button
          aria-label="Lanzar Granada"
          onTouchStart={(e) => handleActionTouchStart('grenade', e)}
          onTouchEnd={(e) => handleActionTouchEnd('grenade', e)}
          onTouchCancel={(e) => handleActionTouchEnd('grenade', e)}
          onMouseDown={() => updateAction('grenade', true)}
          onMouseUp={() => updateAction('grenade', false)}
          className={`absolute top-1 left-2 w-14 h-14 sm:w-15 sm:h-15 rounded-2xl border flex flex-col items-center justify-center text-white font-bungee text-[9px] transition-all duration-75 shadow-md ${
            activeActions.grenade
              ? 'bg-sky-500 text-white scale-90 border-white shadow-[0_0_15px_rgba(14,165,233,0.9)]'
              : 'bg-sky-500/35 border-sky-300/60 backdrop-blur-[2px]'
          }`}
          style={{ touchAction: 'none' }}
        >
          <Bomb size={18} className="mb-0.5" />
          <span className="text-[8px] tracking-tight opacity-90">BOMBA</span>
        </button>

        {/* 3. JUMP / SALTO Button (Bottom Left) */}
        <button
          aria-label="Saltar"
          onTouchStart={(e) => handleActionTouchStart('jump', e)}
          onTouchEnd={(e) => handleActionTouchEnd('jump', e)}
          onTouchCancel={(e) => handleActionTouchEnd('jump', e)}
          onMouseDown={() => updateAction('jump', true)}
          onMouseUp={() => updateAction('jump', false)}
          className={`absolute bottom-0 left-0 w-16 h-16 sm:w-18 sm:h-18 rounded-3xl border-2 flex flex-col items-center justify-center text-white font-bungee transition-all duration-75 shadow-lg ${
            activeActions.jump
              ? 'bg-emerald-500 text-white scale-90 border-white shadow-[0_0_20px_rgba(16,185,129,0.9)]'
              : 'bg-emerald-500/40 border-emerald-300/80 backdrop-blur-[2px]'
          }`}
          style={{ touchAction: 'none' }}
        >
          <ArrowBigUp size={24} className="fill-white stroke-none drop-shadow" />
          <span className="text-[10px] tracking-wide mt-0.5 font-bold">SALTO</span>
        </button>

        {/* 4. SHOOT / FUEGO Button (Bottom Right - Extra Large Primary Button) */}
        <button
          aria-label="Disparar"
          onTouchStart={(e) => handleActionTouchStart('shoot', e)}
          onTouchEnd={(e) => handleActionTouchEnd('shoot', e)}
          onTouchCancel={(e) => handleActionTouchEnd('shoot', e)}
          onMouseDown={() => updateAction('shoot', true)}
          onMouseUp={() => updateAction('shoot', false)}
          className={`absolute bottom-0 right-0 w-18 h-18 sm:w-20 sm:h-20 rounded-3xl border-2 flex flex-col items-center justify-center text-white font-bungee transition-all duration-75 shadow-xl ${
            activeActions.shoot
              ? 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white scale-90 border-white shadow-[0_0_25px_rgba(244,63,94,1)]'
              : 'bg-pink-500/45 border-pink-300/90 backdrop-blur-[2px]'
          }`}
          style={{ touchAction: 'none' }}
        >
          <Zap size={26} className="fill-yellow-300 stroke-white stroke-1.5 drop-shadow" />
          <span className="text-[11px] tracking-wider mt-0.5 font-black text-yellow-100">FUEGO</span>
        </button>
      </div>
    </div>
  );
};

export default TouchGamepad;
