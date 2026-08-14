import React from 'react';
import { Play, HelpCircle, Trophy, Sparkles, Volume2, VolumeX, Shield } from 'lucide-react';

export const MainMenu = ({
  onStartGame,
  onOpenHowToPlay,
  difficulty,
  onSelectDifficulty,
  highScore,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 backdrop-blur-md select-none overflow-y-auto">
      {/* Top Bar: High Score & Sound Toggle */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg">
          <Trophy size={18} className="text-candy-yellow" />
          <span className="font-arcade text-xs text-slate-300">RÉCORD:</span>
          <span className="font-arcade text-sm text-candy-yellow tracking-wider">
            {highScore.toString().padStart(6, '0')}
          </span>
        </div>

        <button
          onClick={onToggleMute}
          aria-label="Silenciar o activar sonido"
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-candy text-sm transition-all shadow-lg active:scale-95"
        >
          {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-candy-green" />}
          <span className="hidden sm:inline">{isMuted ? 'Mudo' : 'Sonido'}</span>
        </button>
      </div>

      {/* Main Title & Hero Banner */}
      <div className="flex flex-col items-center text-center my-auto py-4">
        {/* Hero Mascot Avatar */}
        <div className="relative mb-3 animate-float">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-candy-pink via-candy-yellow to-candy-blue p-1.5 shadow-2xl shadow-candy-pink/50">
            <img
              src="./hero.png"
              alt="Lulipop Hero"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                // Fallback to SVG lollipop if image fails to load
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-candy-yellow text-slate-900 font-bungee text-[10px] px-2 py-0.5 rounded-full border border-white shadow">
            1P HERO
          </div>
        </div>

        {/* Title Logo */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bungee tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-candy-pink via-candy-yellow to-candy-blue drop-shadow-[0_4px_16px_rgba(255,119,176,0.8)] mb-1">
          LOLLIPOP SLUG
        </h1>
        <p className="font-arcade text-xs sm:text-sm text-candy-mint tracking-widest uppercase mb-6 flex items-center justify-center gap-2">
          <Sparkles size={16} className="text-candy-yellow animate-spin-slow" />
          Mundo Lulipop • Metal Slug Candy Edition
          <Sparkles size={16} className="text-candy-pink animate-spin-slow" />
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mb-6">
          <button
            onClick={onStartGame}
            className="w-full sm:flex-1 py-4 px-8 candy-button-pink rounded-2xl font-bungee text-xl text-white tracking-wider flex items-center justify-center gap-3 active:scale-95 shadow-xl transition-transform"
          >
            <Play size={24} className="fill-white stroke-none" />
            ¡JUGAR AHORA!
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="w-full sm:w-auto py-4 px-6 candy-button-blue rounded-2xl font-bungee text-base text-white tracking-wider flex items-center justify-center gap-2 active:scale-95 shadow-lg transition-transform"
          >
            <HelpCircle size={20} />
            CÓMO JUGAR
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-arcade text-[10px] text-slate-400 tracking-wider">SELECCIONA DIFICULTAD:</span>
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900/80 border border-white/20">
            {[
              { id: 'EASY', label: 'FÁCIL (4 Vidas)', color: 'candy-green' },
              { id: 'NORMAL', label: 'ARCADE (3 Vidas)', color: 'candy-yellow' },
              { id: 'HARD', label: 'EXPERTO (2 Vidas)', color: 'candy-cherry' }
            ].map((diff) => (
              <button
                key={diff.id}
                onClick={() => onSelectDifficulty(diff.id)}
                className={`px-3 py-1.5 rounded-xl font-candy text-xs transition-all ${
                  difficulty === diff.id
                    ? 'bg-candy-pink text-white font-bold shadow-md scale-105'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-4xl text-center text-[11px] font-candy text-slate-400">
        Usa <strong className="text-white">WASD / Flechas</strong> para moverte, <strong className="text-white">J</strong> para disparar, <strong className="text-white">Espacio</strong> para saltar y <strong className="text-white">K</strong> para bombas. Compatible con Gamepad Táctil móvil.
      </div>
    </div>
  );
};
export default MainMenu;
