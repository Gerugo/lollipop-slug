import React from 'react';
import { Volume2, VolumeX, Pause, Maximize, Sparkles } from 'lucide-react';

export const HUD = ({ hudData, onTogglePause, onToggleMute, isMuted, onToggleFullscreen }) => {
  if (!hudData) return null;

  const {
    hp = 3,
    maxHp = 3,
    lives = 3,
    score = 0,
    highScore = 0,
    gameTime = 0,
    weapon = { name: 'Pistol', shortName: 'PISTOL', ammo: Infinity },
    ammo = Infinity,
    grenades = 10,
    boss = null
  } = hudData;

  const minutes = Math.floor(gameTime / 60);
  const seconds = gameTime % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 pointer-events-none p-3 md:p-4 flex flex-col justify-between select-none z-10">
      {/* Top Status Bar */}
      <div className="flex items-start justify-between gap-2 w-full">
        {/* Top Left: Player 1 Lives & Health Bar */}
        <div className="flex flex-col gap-1">
          {/* Life Avatar & Counter */}
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border-2 border-candy-pink shadow-lg">
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Lollipop Hero Life Icon */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-candy-pink via-candy-yellow to-candy-blue border-2 border-white shadow flex items-center justify-center animate-bounce-soft">
                <span className="text-xs">🍭</span>
              </div>
            </div>
            <span className="font-arcade text-candy-yellow text-sm tracking-wider">
              1P x{Math.max(0, lives)}
            </span>
          </div>

          {/* Health Pips */}
          <div className="flex items-center gap-1 bg-slate-900/70 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/20">
            <span className="font-arcade text-[10px] text-candy-mint mr-1">HP</span>
            {Array.from({ length: maxHp }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-3.5 rounded-sm transition-all duration-300 ${
                  i < hp
                    ? 'bg-gradient-to-t from-red-500 to-pink-400 border border-white shadow-sm shadow-pink-500/50 scale-100'
                    : 'bg-slate-700/60 border border-slate-600 scale-90'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Top Center: Boss Health Bar OR Score / Time */}
        <div className="flex-1 max-w-md mx-2 flex flex-col items-center">
          {boss ? (
            /* Boss Health Bar */
            <div className="w-full bg-slate-950/90 backdrop-blur-md p-2.5 rounded-2xl border-2 border-red-500 shadow-xl shadow-red-500/30 animate-pulse-glow">
              <div className="flex justify-between items-center mb-1">
                <span className="font-arcade text-xs text-red-400 tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  {boss.name}
                </span>
                <span className="font-arcade text-[10px] text-amber-300">
                  FASE {boss.phase}/3
                </span>
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-white/40 p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-200 bg-gradient-to-r from-amber-400 via-pink-500 to-red-600 shadow-inner"
                  style={{ width: `${Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))}%` }}
                />
              </div>
            </div>
          ) : (
            /* Arcade Score & High Score */
            <div className="flex flex-col items-center bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/25 shadow-lg">
              <div className="flex items-center gap-4 text-xs font-arcade">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-slate-400">PUNTOS</span>
                  <span className="text-candy-yellow text-sm tracking-wider">{score.toString().padStart(6, '0')}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-candy-pink">RÉCORD</span>
                  <span className="text-white text-sm tracking-wider">{highScore.toString().padStart(6, '0')}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-cyan-400">TIEMPO</span>
                  <span className="text-cyan-300 text-sm tracking-wider">{timeStr}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Right: Weapon, Ammo, Grenades & Quick Action Controls */}
        <div className="flex items-start gap-2">
          {/* Current Weapon & Ammo */}
          <div className="flex flex-col items-end gap-1">
            <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border-2 border-candy-blue shadow-lg flex items-center gap-2">
              <div className="text-right">
                <div className="font-arcade text-[10px] text-candy-blue">{weapon.shortName || 'PISTOL'}</div>
                <div className="font-arcade text-xs text-white">
                  {ammo === Infinity ? '∞' : ammo.toString().padStart(3, '0')}
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-candy-blue/20 border border-candy-blue flex items-center justify-center text-sm">
                {weapon.id === 'HMG' ? '☁️' : weapon.id === 'SHOTGUN' ? '💥' : weapon.id === 'ROCKET' ? '🚀' : '🍬'}
              </div>
            </div>

            {/* Grenade Counter */}
            <div className="bg-slate-900/70 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/20 flex items-center gap-1.5 font-arcade text-xs text-cyan-300">
              <span>💣</span>
              <span>x{grenades}</span>
            </div>
          </div>

          {/* Top Quick Settings Buttons */}
          <div className="flex flex-col gap-1 pointer-events-auto">
            <button
              onClick={onTogglePause}
              aria-label="Pausar juego"
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-white/20 flex items-center justify-center text-white transition-all shadow-md"
            >
              <Pause size={16} />
            </button>
            <button
              onClick={onToggleMute}
              aria-label="Silenciar sonido"
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-white/20 flex items-center justify-center text-white transition-all shadow-md"
            >
              {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-candy-green" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HUD;
