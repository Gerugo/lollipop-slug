import React, { useRef, useEffect } from 'react';

export const GameCanvas = ({ onEngineReady }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set internal game virtual resolution (16:9 arcade standard)
    canvas.width = 960;
    canvas.height = 540;

    if (onEngineReady) {
      onEngineReady(canvas);
    }
  }, [onEngineReady]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain max-w-[100dvw] max-h-[100dvh] shadow-2xl"
      />
      {/* Subtle Retro Arcade Scanlines */}
      <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
    </div>
  );
};
export default GameCanvas;
