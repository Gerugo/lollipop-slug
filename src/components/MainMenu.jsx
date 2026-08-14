import React from 'react';
import { Play, HelpCircle, Trophy, Sparkles, Volume2, VolumeX, Maximize2 } from 'lucide-react';

export const MainMenu = ({
  onStartGame,
  onOpenHowToPlay,
  difficulty = 'NORMAL',
  onSelectDifficulty,
  highScore = 0,
  isMuted = false,
  onToggleMute,
  onToggleFullscreen
}) => {
  const handlePlayClick = () => {
    if (onStartGame) {
      onStartGame();
    }
  };

  const safeHighScore = (highScore !== undefined && highScore !== null)
    ? Number(highScore).toString().padStart(6, '0')
    : '000000';

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 backdrop-blur-md select-none overflow-y-auto">
      {/* Top Bar: High Score, Fullscreen & Sound Toggle */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg">
          <Trophy size={16} className="text-candy-yellow" />
          <span className="font-arcade text-[10px] sm:text-xs text-slate-300">RÉCORD:</span>
          <span className="font-arcade text-xs sm:text-sm text-candy-yellow tracking-wider">
            {safeHighScore}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFullscreen}
            aria-label="Pantalla completa"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-candy text-xs sm:text-sm transition-all shadow-lg active:scale-95"
          >
            <Maximize2 size={16} className="text-amber-400" />
            <span className="hidden sm:inline">Pantalla Completa</span>
          </button>

          <button
            onClick={onToggleMute}
            aria-label="Silenciar o activar sonido"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-candy text-xs sm:text-sm transition-all shadow-lg active:scale-95"
          >
            {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-candy-green" />}
            <span className="hidden sm:inline">{isMuted ? 'Mudo' : 'Sonido'}</span>
          </button>
        </div>
      </div>

      {/* Main Title & Hero Banner */}
      <div className="flex flex-col items-center text-center my-auto py-2 sm:py-4">
        {/* Hero Mascot Avatar */}
        <div className="relative mb-2 sm:mb-3 animate-float">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-candy-pink via-candy-yellow to-candy-blue p-1.5 shadow-2xl shadow-candy-pink/50 flex items-center justify-center">
            <span className="text-4xl sm:text-5xl">🍭</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-candy-yellow text-slate-900 font-bungee text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full border border-white shadow">
            1P HERO
          </div>
        </div>

        {/* Title Logo */}
        <h1 className="text-3xl sm:text-6xl md:text-7xl font-bungee tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-candy-pink via-candy-yellow to-candy-blue drop-shadow-[0_4px_16px_rgba(255,119,176,0.8)] mb-1">
          LOLLIPOP SLUG
        </h1>
        <p className="font-arcade text-[10px] sm:text-xs text-candy-mint tracking-widest uppercase mb-4 sm:mb-6 flex items-center justify-center gap-2">
          <Sparkles size={14} className="text-candy-yellow animate-spin-slow" />
          Mundo Lulipop • Metal Slug Candy Edition
          <Sparkles size={14} className="text-candy-pink animate-spin-slow" />
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full max-w-md mb-4 sm:mb-6">
          <button
            onClick={handlePlayClick}
            className="w-full sm:flex-1 py-3 sm:py-4 px-6 sm:px-8 candy-button-pink rounded-2xl font-bungee text-lg sm:text-xl text-white tracking-wider flex items-center justify-center gap-3 active:scale-95 shadow-xl transition-transform"
          >
            <Play size={22} className="fill-white stroke-none" />
            ¡JUGAR AHORA!
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="w-full sm:w-auto py-3 sm:py-4 px-5 sm:px-6 candy-button-blue rounded-2xl font-bungee text-sm sm:text-base text-white tracking-wider flex items-center justify-center gap-2 active:scale-95 shadow-lg transition-transform"
          >
            <HelpCircle size={18} />
            CÓMO JUGAR
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          <span className="font-arcade text-[9px] sm:text-[10px] text-slate-400 tracking-wider">SELECCIONA DIFICULTAD:</span>
          <div className="flex items-center gap-1 sm:gap-2 p-1 rounded-2xl bg-slate-900/80 border border-white/20">
            {[
              { id: 'EASY', label: 'FÁCIL (4 HP)', color: 'candy-green' },
              { id: 'NORMAL', label: 'ARCADE (3 HP)', color: 'candy-yellow' },
              { id: 'HARD', label: 'EXPERTO (2 HP)', color: 'candy-cherry' }
            ].map((diff) => (
              <button
                key={diff.id}
                onClick={() => onSelectDifficulty && onSelectDifficulty(diff.id)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-candy text-[11px] sm:text-xs transition-all ${
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
      <div className="w-full max-w-4xl text-center text-[10px] sm:text-[11px] font-candy text-slate-400">
        Usa <strong className="text-white">WASD</strong> o el <strong className="text-white">Gamepad táctil</strong> para jugar a 60 FPS en pantalla completa.
      </div>
    </div>
  );
};
export default MainMenu;
