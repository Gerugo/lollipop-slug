import React from 'react';
import { Volume2, VolumeX, Pause, Maximize2 } from 'lucide-react';
import armaPistolUrl from '../assets/arma_pistol.png';
import armaHmgUrl from '../assets/arma_hmg.png';
import armaShotgunUrl from '../assets/arma_shotgun.png';
import armaRocketUrl from '../assets/arma_rocket.png';
import armaLatigoUrl from '../assets/arma_latigo.png';
import armaGrenadeUrl from '../assets/arma_grenade.png';
import armaBurbujasUrl from '../assets/arma_burbujas.png';
import armaHieloUrl from '../assets/arma_hielo.png';
import armaLaserUrl from '../assets/arma_laser.png';
import armaFlamethrowerUrl from '../assets/arma_flamethrower.png';

export const HUD = ({ hudData, onTogglePause, onToggleMute, isMuted = false, onToggleFullscreen }) => {
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
    vehicleArmor = null,
    maxVehicleArmor = 5,
    boss = null
  } = hudData;

  const safeHp = Number(hp ?? 3);
  const safeMaxHp = Math.max(1, Number(maxHp ?? 3));
  const safeLives = Math.max(0, Number(lives ?? 3));
  const safeScore = Number(score ?? 0).toString().padStart(6, '0');
  const safeHighScore = Number(highScore ?? 0).toString().padStart(6, '0');
  const safeTime = Number(gameTime ?? 0);
  const minutes = Math.floor(safeTime / 60);
  const seconds = Math.floor(safeTime % 60);
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const safeAmmoStr = (ammo === Infinity || ammo === null || ammo === undefined)
    ? '∞'
    : Number(ammo).toString().padStart(3, '0');

  const safeWeaponName = weapon?.shortName || 'PISTOL';
  const weaponId = weapon?.id || '';

  const getWeaponImg = () => {
    switch (weaponId) {
      case 'HMG': return armaHmgUrl;
      case 'SHOTGUN': return armaShotgunUrl;
      case 'ROCKET': return armaRocketUrl;
      case 'LATIGO_DULCE': return armaLatigoUrl;
      case 'CANON_BURBUJAS': return armaBurbujasUrl;
      case 'LANZAHIELOS': return armaHieloUrl;
      case 'RAYO_LASER': return armaLaserUrl;
      case 'LANZALLAMAS': return armaFlamethrowerUrl;
      default: return armaPistolUrl;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between select-none z-10">
      {/* Top Status Bar */}
      <div className="flex items-start justify-between gap-2 w-full">
        {/* Top Left: Player Lives, Health Bar & Slug Armor */}
        <div className="flex flex-col gap-1.5">
          {/* Life Avatar & Counter */}
          <div className="flex items-center gap-2 bg-pink-500/25 backdrop-blur-[6px] px-3 py-1.5 rounded-3xl border-2 border-white/50 shadow-[0_4px_16px_rgba(255,119,176,0.3),inset_0_1px_2px_rgba(255,255,255,0.6)]">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-candy-pink via-candy-yellow to-candy-blue border-2 border-white shadow flex items-center justify-center animate-bounce-soft">
                <span className="text-[11px]">🍭</span>
              </div>
            </div>
            <span className="font-arcade text-candy-yellow text-xs sm:text-sm tracking-wider drop-shadow">
              1P x{safeLives}
            </span>
          </div>

          {/* Health Pips */}
          <div className="flex items-center gap-1 bg-slate-900/40 backdrop-blur-[6px] px-2.5 py-1 rounded-2xl border border-white/30 shadow-sm">
            <span className="font-arcade text-[9px] text-candy-mint mr-0.5">HP</span>
            {Array.from({ length: safeMaxHp }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3 rounded-md transition-all duration-300 ${
                  i < safeHp
                    ? 'bg-gradient-to-t from-red-500 to-pink-400 border border-white shadow-[0_0_8px_rgba(244,63,94,0.6)] scale-100'
                    : 'bg-slate-700/50 border border-slate-600/60 scale-90'
                }`}
              />
            ))}
          </div>

          {/* Slug Armor Status */}
          {vehicleArmor !== null && (
            <div className="flex items-center gap-1.5 bg-sky-500/25 backdrop-blur-[6px] px-2.5 py-1 rounded-2xl border-2 border-sky-300 shadow-[0_4px_16px_rgba(14,165,233,0.3)] animate-pulse">
              <span className="font-arcade text-[9px] text-sky-200 flex items-center gap-1">
                🛡️ SLUG
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: Number(maxVehicleArmor || 5) }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm transition-all duration-200 ${
                      i < Number(vehicleArmor || 0)
                        ? 'bg-gradient-to-t from-sky-400 to-cyan-200 border border-white shadow-[0_0_6px_rgba(56,189,248,0.7)] scale-100'
                        : 'bg-slate-800/60 border border-slate-600 scale-90'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Center: Boss Health Bar OR Score / Time */}
        <div className="flex-1 max-w-md mx-1 sm:mx-2 flex flex-col items-center">
          {boss ? (
            /* Boss Health Bar */
            <div className="w-full bg-slate-950/70 backdrop-blur-[8px] p-2 rounded-3xl border-2 border-red-500/80 shadow-[0_4px_24px_rgba(239,68,68,0.4),inset_0_1px_2px_rgba(255,255,255,0.4)] animate-pulse-glow">
              <div className="flex justify-between items-center mb-1 px-1">
                <span className="font-arcade text-[11px] text-red-300 tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  {boss.name || 'GUMBALL TITAN'}
                </span>
                <span className="font-arcade text-[9px] text-amber-300">
                  FASE {boss.phase || 1}/3
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-900/80 rounded-full overflow-hidden border border-white/50 p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-200 bg-gradient-to-r from-amber-400 via-pink-500 to-red-600 shadow-inner"
                  style={{ width: `${Math.max(0, Math.min(100, ((boss.hp || 0) / (boss.maxHp || 1)) * 100))}%` }}
                />
              </div>
            </div>
          ) : (
            /* Arcade Score & High Score */
            <div className="flex flex-col items-center bg-slate-900/40 backdrop-blur-[6px] px-3.5 py-1.5 rounded-3xl border border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.3)]">
              <div className="flex items-center gap-3 text-xs font-arcade">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-slate-300">PUNTOS</span>
                  <span className="text-candy-yellow text-xs tracking-wider drop-shadow">{safeScore}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-pink-300">RÉCORD</span>
                  <span className="text-white text-xs tracking-wider drop-shadow">{safeHighScore}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-cyan-300">TIEMPO</span>
                  <span className="text-cyan-200 text-xs tracking-wider drop-shadow">{timeStr}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Right: Weapon, Ammo, Grenades & Controls */}
        <div className="flex items-start gap-1.5 sm:gap-2">
          {/* Current Weapon & Ammo */}
          <div className="flex flex-col items-end gap-1">
            <div className="bg-blue-500/25 backdrop-blur-[6px] px-2.5 py-1 rounded-3xl border-2 border-white/50 shadow-[0_4px_16px_rgba(56,189,248,0.3),inset_0_1px_2px_rgba(255,255,255,0.6)] flex items-center gap-1.5">
              <div className="text-right">
                <div className="font-arcade text-[9px] text-sky-200">{safeWeaponName}</div>
                <div className="font-arcade text-xs text-white drop-shadow">
                  {safeAmmoStr}
                </div>
              </div>
              <div className="w-8 h-8 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center p-0.5 shadow-inner overflow-hidden">
                <img
                  src={getWeaponImg()}
                  alt={safeWeaponName}
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
            </div>

            {/* Grenade Counter */}
            <div className="bg-slate-900/40 backdrop-blur-[6px] px-2 py-0.5 rounded-2xl border border-white/30 flex items-center gap-1 font-arcade text-[10px] text-cyan-200 shadow-sm">
              <img src={armaGrenadeUrl} alt="Soda Grenade" className="w-4 h-4 object-contain" />
              <span>x{Number(grenades ?? 10)}</span>
            </div>
          </div>

          {/* Top Quick Settings Buttons */}
          <div className="flex flex-col gap-1 pointer-events-auto">
            <button
              onClick={onToggleFullscreen}
              aria-label="Pantalla completa"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-2xl bg-slate-900/50 hover:bg-slate-800/70 active:scale-90 border border-white/40 flex items-center justify-center text-white transition-transform duration-75 shadow-sm"
            >
              <Maximize2 size={14} className="text-amber-300" />
            </button>
            <button
              onClick={onTogglePause}
              aria-label="Pausar juego"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-2xl bg-slate-900/50 hover:bg-slate-800/70 active:scale-90 border border-white/40 flex items-center justify-center text-white transition-transform duration-75 shadow-sm"
            >
              <Pause size={14} />
            </button>
            <button
              onClick={onToggleMute}
              aria-label="Silenciar sonido"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-2xl bg-slate-900/50 hover:bg-slate-800/70 active:scale-90 border border-white/40 flex items-center justify-center text-white transition-transform duration-75 shadow-sm"
            >
              {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-candy-mint" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HUD;
