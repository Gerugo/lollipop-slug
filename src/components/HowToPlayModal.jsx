import React from 'react';
import { X, Keyboard, Smartphone, Sparkles, Zap, Bomb, HelpCircle } from 'lucide-react';

export const HowToPlayModal = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="candy-card rounded-3xl p-6 max-w-2xl w-full flex flex-col shadow-2xl border-2 border-candy-blue/50 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <HelpCircle size={24} className="text-candy-yellow" />
            <h2 className="text-2xl font-bungee text-candy-yellow tracking-wider">
              CÓMO JUGAR & ARSENAL
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Controls Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Desktop Keyboard */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-candy-pink font-bungee text-sm">
              <Keyboard size={18} />
              <span>TECLADO & RATÓN</span>
            </div>
            <ul className="text-xs font-candy space-y-1.5 text-slate-300">
              <li><strong className="text-white">A / D o Flechas:</strong> Mover a los lados</li>
              <li><strong className="text-white">W / Flecha Arriba:</strong> Apuntar hacia arriba</li>
              <li><strong className="text-white">S / Flecha Abajo:</strong> Agacharse (esquivar balas)</li>
              <li><strong className="text-white">Espacio / W:</strong> Saltar (y descender con S+Espacio)</li>
              <li><strong className="text-white">J / Z / Click Izq:</strong> Disparar arma</li>
              <li><strong className="text-white">K / X / Click Der:</strong> Lanzar Manzana Explosiva</li>
              <li><strong className="text-white">Esc / P:</strong> Pausa</li>
            </ul>
          </div>

          {/* Mobile Gamepad */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-candy-green font-bungee text-sm">
              <Smartphone size={18} />
              <span>GAMEPAD TÁCTIL</span>
            </div>
            <ul className="text-xs font-candy space-y-1.5 text-slate-300">
              <li><strong className="text-white">D-Pad Izquierdo:</strong> Movimiento, salto, agacharse y apuntar</li>
              <li><strong className="text-white">Botón Rosa [FUEGO]:</strong> Disparo continuo o ráfaga</li>
              <li><strong className="text-white">Botón Verde [SALTO]:</strong> Salto fluido</li>
              <li><strong className="text-white">Botón Azul [BOMBA]:</strong> Lanzamiento de manzanas explosivas</li>
              <li><strong className="text-white">Gira tu móvil:</strong> Para activar el modo apaisado 16:9</li>
            </ul>
          </div>
        </div>

        {/* Weapons & Items Guide */}
        <h3 className="font-bungee text-sm text-candy-yellow mb-2 tracking-wider flex items-center gap-2">
          <Zap size={16} /> ARSENAL DULCE & ITEMS
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 text-xs font-candy">
          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-white/10 text-center">
            <span className="text-xl">🍬</span>
            <div className="font-bold text-candy-pink mt-1">Pistola Chicle</div>
            <div className="text-[11px] text-slate-400">Munición infinita básica.</div>
          </div>
          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-white/10 text-center">
            <span className="text-xl">☁️</span>
            <div className="font-bold text-slate-100 mt-1">H.M.G. (200)</div>
            <div className="text-[11px] text-slate-400">Ráfaga de nubes de azúcar.</div>
          </div>
          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-white/10 text-center">
            <span className="text-xl">🍌</span>
            <div className="font-bold text-candy-blue mt-1">Shot-Gum (Plátano)</div>
            <div className="text-[11px] text-slate-400">Dispersión de plátanos y caramelos.</div>
          </div>
          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-white/10 text-center">
            <span className="text-xl">🍎</span>
            <div className="font-bold text-candy-yellow mt-1">Manzana Bomba</div>
            <div className="text-[11px] text-slate-400">Granada con gran explosión AoE.</div>
          </div>
        </div>

        {/* Hostages & Boss Lore */}
        <div className="bg-slate-900/60 p-3 rounded-2xl border border-white/15 text-xs font-candy text-slate-300 flex items-center gap-3 mb-4">
          <span className="text-2xl">🐱</span>
          <div>
            <strong className="text-candy-mint">Gatitos Rehenes:</strong> Dispárales o tócalos para liberarlos. Te darán cajas de armas, estrellas doradas curativas o +10,000 puntos.
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 candy-button-pink rounded-2xl font-bungee text-white text-sm tracking-wider active:scale-95 transition-transform"
        >
          ¡ENTENDIDO, A LA BATALLA!
        </button>
      </div>
    </div>
  );
};
export default HowToPlayModal;
