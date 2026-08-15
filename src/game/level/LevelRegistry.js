import { Level1 } from './Level1.js';
import { Level2 } from './Level2.js';
import { Level3 } from './Level3.js';
import { Level4 } from './Level4.js';
import { Level5 } from './Level5.js';
import { Level6 } from './Level6.js';
import { Level7 } from './Level7.js';
import { Level8 } from './Level8.js';
import { Level9 } from './Level9.js';
import { Level10 } from './Level10.js';

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
  },
  {
    id: 6,
    LevelClass: Level6,
    title: 'Nivel 6',
    name: 'Cumbres Caramelo Helado',
    emoji: '❄️',
    desc: 'Hielo resbaladizo, pingüinos, yetis & Gólem de Hielo',
    color: 'from-sky-800/40 to-slate-950/60',
    borderColor: 'border-sky-400/50',
    activeBorder: 'border-sky-300 ring-2 ring-sky-400/60 shadow-sky-500/30',
    badge: 'bg-sky-500 text-sky-950',
    previewKey: 'cielo6'
  },
  {
    id: 7,
    LevelClass: Level7,
    title: 'Nivel 7',
    name: 'Laberinto Gominola Elástica',
    emoji: '🐛',
    desc: 'Trampolines ultra elásticos, murciélagos, slimes & Ciempiés Gigante',
    color: 'from-rose-800/40 to-purple-950/60',
    borderColor: 'border-rose-400/50',
    activeBorder: 'border-rose-300 ring-2 ring-rose-400/60 shadow-rose-500/30',
    badge: 'bg-rose-500 text-rose-950',
    previewKey: 'cielo7'
  },
  {
    id: 8,
    LevelClass: Level8,
    title: 'Nivel 8',
    name: 'Río Lava Caramelo Líquido',
    emoji: '🌋',
    desc: 'Lava ardiente, plataformas móviles, salamandras & Dragón Ígneo',
    color: 'from-orange-800/40 to-stone-950/60',
    borderColor: 'border-orange-500/50',
    activeBorder: 'border-orange-400 ring-2 ring-orange-500/60 shadow-orange-500/30',
    badge: 'bg-orange-500 text-orange-950',
    previewKey: 'cielo8'
  },
  {
    id: 9,
    LevelClass: Level9,
    title: 'Nivel 9',
    name: 'Ciudadela Caramelo Prohibido',
    emoji: '🏰',
    desc: 'Trampas de picos, gárgolas, guardias reales & Caballero Negro',
    color: 'from-purple-900/40 to-zinc-950/60',
    borderColor: 'border-purple-500/50',
    activeBorder: 'border-purple-400 ring-2 ring-purple-500/60 shadow-purple-500/30',
    badge: 'bg-purple-500 text-purple-950',
    previewKey: 'cielo9'
  },
  {
    id: 10,
    LevelClass: Level10,
    title: 'Nivel 10 - FINAL',
    name: 'El Trono del Rey Amargo',
    emoji: '👑',
    desc: 'La Gran Batalla Final: hechiceros, rayos cósmicos & El Rey Amargo',
    color: 'from-amber-600/50 via-rose-900/60 to-zinc-950/80',
    borderColor: 'border-amber-400/70',
    activeBorder: 'border-amber-300 ring-4 ring-amber-400/80 shadow-amber-500/50',
    badge: 'bg-amber-400 text-amber-950 font-black',
    previewKey: 'cielo10'
  }
];

export const getLevelEntry = (id) => {
  return LEVEL_REGISTRY.find((l) => l.id === id) || LEVEL_REGISTRY[0];
};
