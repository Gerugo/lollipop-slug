import React, { useState, useRef } from 'react';
import { Play, HelpCircle, Trophy, Sparkles, Volume2, VolumeX, Maximize2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { LEVEL_REGISTRY } from '../game/level/LevelRegistry.js';

export const MainMenu = ({
  onStartGame,
  onOpenHowToPlay,
  difficulty = 'NORMAL',
  onSelectDifficulty,
  highScore = 0,
  isMuted = false,
  onToggleMute,
  onToggleFullscreen,
  onPreviewLevel
}) => {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const levels = LEVEL_REGISTRY;
  const levelListRef = useRef(null);

  const handleLevelClick = (lvlId) => {
    setSelectedLevel(lvlId);
    if (onPreviewLevel) {
      onPreviewLevel(lvlId);
    }
  };

  const handlePrevLevel = () => {
    const nextId = selectedLevel > 1 ? selectedLevel - 1 : levels.length;
    handleLevelClick(nextId);
  };

  const handleNextLevel = () => {
    const nextId = selectedLevel < levels.length ? selectedLevel + 1 : 1;
    handleLevelClick(nextId);
  };

  const handlePlayClick = () => {
    if (onStartGame) {
      onStartGame(selectedLevel);
    }
  };

  const currentLvl = levels.find((l) => l.id === selectedLevel) || levels[0];

  const safeHighScore = (highScore !== undefined && highScore !== null)
    ? Number(highScore).toString().padStart(6, '0')
    : '000000';

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-between p-2 sm:p-4 bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-slate-950/98 backdrop-blur-md select-none touch-scrollable overflow-y-auto overscroll-contain">
      {/* Top Bar: High Score, Fullscreen & Sound Toggle */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-2 shrink-0 py-1">
        <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg">
          <Trophy size={14} className="text-candy-yellow" />
          <span className="font-arcade text-[9px] sm:text-xs text-slate-300">RÉCORD:</span>
          <span className="font-arcade text-[11px] sm:text-sm text-candy-yellow tracking-wider font-bold">
            {safeHighScore}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onToggleFullscreen}
            aria-label="Pantalla completa"
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-candy text-[11px] sm:text-xs transition-all shadow-lg active:scale-95"
          >
            <Maximize2 size={13} className="text-amber-400" />
            <span className="hidden xs:inline">Pantalla Completa</span>
          </button>

          <button
            onClick={onToggleMute}
            aria-label="Silenciar o activar sonido"
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-candy text-[11px] sm:text-xs transition-all shadow-lg active:scale-95"
          >
            {isMuted ? <VolumeX size={13} className="text-red-400" /> : <Volume2 size={13} className="text-candy-green" />}
            <span className="hidden xs:inline">{isMuted ? 'Mudo' : 'Sonido'}</span>
          </button>
        </div>
      </div>

      {/* Main Center Area */}
      <div className="flex flex-col items-center text-center my-auto py-1 sm:py-2 w-full max-w-2xl shrink-0">
        {/* Title Logo */}
        <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-bungee tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-candy-pink via-candy-yellow to-candy-blue drop-shadow-[0_4px_16px_rgba(255,119,176,0.8)] mb-0.5 leading-tight">
          LOLLIPOP SLUG
        </h1>
        <p className="font-arcade text-[8px] xs:text-[9px] sm:text-[11px] text-candy-mint tracking-widest uppercase mb-2 sm:mb-3 flex items-center justify-center gap-1.5">
          <Sparkles size={11} className="text-candy-yellow animate-spin-slow" />
          Mundo Lulipop • Metal Slug Candy Edition
          <Sparkles size={11} className="text-candy-pink animate-spin-slow" />
        </p>

        {/* --- ACTIVE LEVEL SHOWCASE CARD WITH QUICK NAV --- */}
        <div className="w-full max-w-md bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-white/20 rounded-2xl p-2 sm:p-3 shadow-xl backdrop-blur-md mb-2 sm:mb-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handlePrevLevel}
              aria-label="Nivel anterior"
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-90 transition-transform"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[9px] sm:text-[10px] font-bungee px-2 py-0.5 rounded-full ${currentLvl.badge}`}>
                  {currentLvl.title}
                </span>
                <span className="text-base sm:text-lg">{currentLvl.emoji}</span>
              </div>
              <span className="font-bungee text-xs sm:text-sm text-white tracking-wide truncate w-full">
                {currentLvl.name}
              </span>
              <span className="font-candy text-[9px] sm:text-[10px] text-slate-300 truncate w-full">
                {currentLvl.desc}
              </span>
            </div>

            <button
              onClick={handleNextLevel}
              aria-label="Nivel siguiente"
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-90 transition-transform"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Horizontal Level Ribbon (All 10 levels) */}
          <div
            ref={levelListRef}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 mt-1 border-t border-white/10 scroll-smooth snap-x"
          >
            {levels.map((lvl) => {
              const isSelected = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => handleLevelClick(lvl.id)}
                  className={`snap-center shrink-0 flex items-center gap-1 px-2 py-1 rounded-xl font-candy text-[10px] transition-all border ${
                    isSelected
                      ? 'bg-candy-pink text-white font-bold border-white scale-105 shadow-md'
                      : 'bg-white/5 hover:bg-white/15 text-slate-300 border-white/10'
                  }`}
                >
                  <span>{lvl.emoji}</span>
                  <span>{lvl.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- MAIN ACTION BUTTONS (PLAY & HELP) --- */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-md mb-2 sm:mb-3">
          <button
            onClick={handlePlayClick}
            className="flex-1 py-2.5 sm:py-3.5 px-4 sm:px-6 candy-button-pink rounded-2xl font-bungee text-sm sm:text-lg text-white tracking-wider flex items-center justify-center gap-2 active:scale-95 shadow-2xl transition-transform"
          >
            <Play size={18} className="fill-white stroke-none shrink-0" />
            <span>¡JUGAR NIVEL {selectedLevel}!</span>
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="py-2.5 sm:py-3.5 px-3 sm:px-4 candy-button-blue rounded-2xl font-bungee text-xs sm:text-sm text-white tracking-wider flex items-center justify-center gap-1.5 active:scale-95 shadow-lg transition-transform shrink-0"
          >
            <HelpCircle size={15} />
            <span className="hidden xs:inline">AYUDA</span>
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <span className="font-arcade text-[8px] sm:text-[9px] text-slate-400 tracking-wider">DIFICULTAD:</span>
          <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-white/20">
            {[
              { id: 'EASY', label: 'FÁCIL (4 HP)' },
              { id: 'NORMAL', label: 'ARCADE (3 HP)' },
              { id: 'HARD', label: 'EXPERTO (2 HP)' }
            ].map((diff) => (
              <button
                key={diff.id}
                onClick={() => onSelectDifficulty && onSelectDifficulty(diff.id)}
                className={`px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl font-candy text-[9px] sm:text-[11px] transition-all ${
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
      <div className="w-full max-w-4xl text-center text-[8px] sm:text-[10px] font-candy text-slate-400 shrink-0 py-1">
        Usa <strong className="text-white">WASD</strong> o el <strong className="text-white">Gamepad táctil</strong> para jugar a 60 FPS en pantalla completa.
      </div>
    </div>
  );
};
export default MainMenu;
