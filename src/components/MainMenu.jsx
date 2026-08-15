import React, { useState } from 'react';
import { Play, HelpCircle, Trophy, Sparkles, Volume2, VolumeX, Maximize2, MapPin } from 'lucide-react';

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

  const levels = [
    {
      id: 1,
      title: 'Nivel 1',
      name: 'Bosque de Piruletas',
      emoji: '🌳',
      desc: 'Colinas de azúcar & Gumball Mech',
      color: 'from-emerald-600/40 to-green-900/60',
      borderColor: 'border-emerald-400/50',
      activeBorder: 'border-emerald-300 ring-2 ring-emerald-400/60 shadow-emerald-500/30',
      badge: 'bg-emerald-500 text-emerald-950'
    },
    {
      id: 2,
      title: 'Nivel 2',
      name: 'Profundidades Chocolate',
      emoji: '🍫',
      desc: 'Caverna helada & Volcán Titan',
      color: 'from-amber-700/40 to-orange-950/60',
      borderColor: 'border-amber-400/50',
      activeBorder: 'border-amber-300 ring-2 ring-amber-400/60 shadow-amber-500/30',
      badge: 'bg-amber-500 text-amber-950'
    },
    {
      id: 3,
      title: 'Nivel 3',
      name: 'Fábrica de los Sueños',
      emoji: '🏭',
      desc: 'Espacio, 4 nuevos enemigos & Reina',
      color: 'from-fuchsia-700/40 to-purple-950/60',
      borderColor: 'border-fuchsia-400/50',
      activeBorder: 'border-fuchsia-300 ring-2 ring-fuchsia-400/60 shadow-fuchsia-500/30',
      badge: 'bg-fuchsia-500 text-fuchsia-950'
    }
  ];

  const handleLevelClick = (lvlId) => {
    setSelectedLevel(lvlId);
    if (onPreviewLevel) {
      onPreviewLevel(lvlId);
    }
  };

  const handlePlayClick = () => {
    if (onStartGame) {
      onStartGame(selectedLevel);
    }
  };

  const safeHighScore = (highScore !== undefined && highScore !== null)
    ? Number(highScore).toString().padStart(6, '0')
    : '000000';

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 backdrop-blur-md select-none overflow-y-auto">
      {/* Top Bar: High Score, Fullscreen & Sound Toggle */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg">
          <Trophy size={15} className="text-candy-yellow" />
          <span className="font-arcade text-[10px] sm:text-xs text-slate-300">RÉCORD:</span>
          <span className="font-arcade text-xs sm:text-sm text-candy-yellow tracking-wider">
            {safeHighScore}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFullscreen}
            aria-label="Pantalla completa"
            className="flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-candy text-xs sm:text-sm transition-all shadow-lg active:scale-95"
          >
            <Maximize2 size={15} className="text-amber-400" />
            <span className="hidden sm:inline">Pantalla Completa</span>
          </button>

          <button
            onClick={onToggleMute}
            aria-label="Silenciar o activar sonido"
            className="flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-candy text-xs sm:text-sm transition-all shadow-lg active:scale-95"
          >
            {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-candy-green" />}
            <span className="hidden sm:inline">{isMuted ? 'Mudo' : 'Sonido'}</span>
          </button>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="flex flex-col items-center text-center my-auto py-1 sm:py-2">
        {/* Title Logo */}
        <h1 className="text-2.5xl sm:text-5xl md:text-6xl font-bungee tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-candy-pink via-candy-yellow to-candy-blue drop-shadow-[0_4px_16px_rgba(255,119,176,0.8)] mb-0.5">
          LOLLIPOP SLUG
        </h1>
        <p className="font-arcade text-[9px] sm:text-[11px] text-candy-mint tracking-widest uppercase mb-3 flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="text-candy-yellow animate-spin-slow" />
          Mundo Lulipop • Metal Slug Candy Edition
          <Sparkles size={12} className="text-candy-pink animate-spin-slow" />
        </p>

        {/* --- LEVEL SELECTOR SECTION --- */}
        <div className="w-full max-w-2xl mb-3 sm:mb-4">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <MapPin size={14} className="text-candy-pink" />
            <span className="font-arcade text-[10px] sm:text-xs text-slate-200 tracking-wider">
              ELIGE EL NIVEL A JUGAR:
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {levels.map((lvl) => {
              const isSelected = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => handleLevelClick(lvl.id)}
                  className={`relative flex flex-col items-center text-left p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-200 bg-gradient-to-b ${lvl.color} border backdrop-blur-md shadow-lg ${
                    isSelected
                      ? `${lvl.activeBorder} scale-[1.03] bg-opacity-90`
                      : `${lvl.borderColor} opacity-75 hover:opacity-100 hover:scale-[1.01]`
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={`text-[8px] sm:text-[10px] font-bungee px-1.5 py-0.5 rounded-full ${lvl.badge}`}>
                      {lvl.title}
                    </span>
                    <span className="text-sm sm:text-base">{lvl.emoji}</span>
                  </div>

                  <span className="font-bungee text-[10px] sm:text-xs text-white text-center line-clamp-1 w-full">
                    {lvl.name}
                  </span>

                  <span className="font-candy text-[8px] sm:text-[9px] text-slate-300 text-center line-clamp-1 w-full mt-0.5 hidden xs:block">
                    {lvl.desc}
                  </span>

                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-candy-yellow border-2 border-white flex items-center justify-center animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full max-w-md mb-3">
          <button
            onClick={handlePlayClick}
            className="w-full sm:flex-1 py-2.5 sm:py-3.5 px-6 candy-button-pink rounded-2xl font-bungee text-base sm:text-lg text-white tracking-wider flex items-center justify-center gap-2.5 active:scale-95 shadow-xl transition-transform"
          >
            <Play size={20} className="fill-white stroke-none" />
            ¡JUGAR NIVEL {selectedLevel}!
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="w-full sm:w-auto py-2.5 sm:py-3.5 px-4 candy-button-blue rounded-2xl font-bungee text-xs sm:text-sm text-white tracking-wider flex items-center justify-center gap-1.5 active:scale-95 shadow-lg transition-transform"
          >
            <HelpCircle size={16} />
            AYUDA
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-arcade text-[9px] text-slate-400 tracking-wider">DIFICULTAD:</span>
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/20">
            {[
              { id: 'EASY', label: 'FÁCIL (4 HP)' },
              { id: 'NORMAL', label: 'ARCADE (3 HP)' },
              { id: 'HARD', label: 'EXPERTO (2 HP)' }
            ].map((diff) => (
              <button
                key={diff.id}
                onClick={() => onSelectDifficulty && onSelectDifficulty(diff.id)}
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl font-candy text-[10px] sm:text-[11px] transition-all ${
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
      <div className="w-full max-w-4xl text-center text-[9px] sm:text-[10px] font-candy text-slate-400">
        Usa <strong className="text-white">WASD</strong> o el <strong className="text-white">Gamepad táctil</strong> para jugar a 60 FPS en pantalla completa.
      </div>
    </div>
  );
};
export default MainMenu;
