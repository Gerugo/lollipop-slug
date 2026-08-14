import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw } from 'lucide-react';

export const OrientationOverlay = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if viewport height is greater than width (portrait orientation on mobile/tablet)
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 1024;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center text-white select-none">
      {/* Animated Candy Phone Rotation Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-candy-pink via-candy-yellow to-candy-blue p-1 flex items-center justify-center shadow-2xl animate-bounce-soft">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
            <Smartphone size={48} className="text-candy-pink animate-pulse" />
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-candy-yellow text-slate-900 flex items-center justify-center font-bold shadow-lg animate-spin-slow">
          <RotateCw size={22} />
        </div>
      </div>

      <h2 className="text-2xl font-bungee text-candy-yellow mb-2 tracking-wide text-stroke-thin">
        ¡GIRA TU DISPOSITIVO! 🔄
      </h2>

      <p className="text-sm font-candy text-slate-300 max-w-xs leading-relaxed mb-6">
        Para disfrutar de la mejor experiencia arcade de <strong className="text-candy-pink font-bold">Lollipop Slug</strong>, gira tu pantalla a modo horizontal (Landscape).
      </p>

      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-arcade text-candy-mint">
        <span>🍭 MODO ARCADE 16:9</span>
      </div>
    </div>
  );
};
export default OrientationOverlay;
