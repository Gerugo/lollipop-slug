import { Level1 } from './Level1.js';
import { Level2 } from './Level2.js';
import { Level3 } from './Level3.js';
import { Level4 } from './Level4.js';
import { Level5 } from './Level5.js';

export const LEVEL_REGISTRY = [
  {
    id: 1,
    LevelClass: Level1,
    title: 'Nivel 1',
    name: 'Bosque de Piruletas',
    emoji: '🌳',
    desc: 'Colinas de azúcar & Gumball Mech Titan',
    color: 'from-emerald-600/40 to-green-900/60',
    borderColor: 'border-emerald-400/50',
    activeBorder: 'border-emerald-300 ring-2 ring-emerald-400/60 shadow-emerald-500/30',
    badge: 'bg-emerald-500 text-emerald-950',
    previewKey: 'colinas'
  },
  {
    id: 2,
    LevelClass: Level2,
    title: 'Nivel 2',
    name: 'Profundidades Chocolate',
    emoji: '🍫',
    desc: 'Caverna helada & Volcán Titan',
    color: 'from-amber-700/40 to-orange-950/60',
    borderColor: 'border-amber-400/50',
    activeBorder: 'border-amber-300 ring-2 ring-amber-400/60 shadow-amber-500/30',
    badge: 'bg-amber-500 text-amber-950',
    previewKey: 'caverna'
  },
  {
    id: 3,
    LevelClass: Level3,
    title: 'Nivel 3',
    name: 'Fábrica de los Sueños',
    emoji: '🏭',
    desc: 'Espacio, nubes de algodón & Reina de Azúcar',
    color: 'from-fuchsia-700/40 to-purple-950/60',
    borderColor: 'border-fuchsia-400/50',
    activeBorder: 'border-fuchsia-300 ring-2 ring-fuchsia-400/60 shadow-fuchsia-500/30',
    badge: 'bg-fuchsia-500 text-fuchsia-950',
    previewKey: 'fabrica'
  },
  {
    id: 4,
    LevelClass: Level4,
    title: 'Nivel 4',
    name: 'Bosque Regaliz Amargo',
    emoji: '🐍',
    desc: 'Terreno pegajoso, charcos ácidos & Víbora Tejedora',
    color: 'from-lime-800/40 to-emerald-950/60',
    borderColor: 'border-lime-400/50',
    activeBorder: 'border-lime-300 ring-2 ring-lime-400/60 shadow-lime-500/30',
    badge: 'bg-lime-500 text-lime-950',
    previewKey: 'regaliz'
  },
  {
    id: 5,
    LevelClass: Level5,
    title: 'Nivel 5',
    name: 'Pantano de Gaseosa',
    emoji: '🐸',
    desc: 'Marea corrosiva, ranas saltarinas & Medusa Efervescente',
    color: 'from-cyan-800/40 to-teal-950/60',
    borderColor: 'border-cyan-400/50',
    activeBorder: 'border-cyan-300 ring-2 ring-cyan-400/60 shadow-cyan-500/30',
    badge: 'bg-cyan-500 text-cyan-950',
    previewKey: 'cielo5'
  }
];

export const getLevelEntry = (id) => {
  return LEVEL_REGISTRY.find((l) => l.id === id) || LEVEL_REGISTRY[0];
};
