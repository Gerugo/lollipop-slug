// Level 4 Complete World & Biome Configuration
// "El Bosque de Regaliz Amargo" - 6800px Bitter Licorice Forest

export const LEVEL_4_CONFIG = {
  id: 'level_4',
  name: 'El Bosque de Regaliz Amargo',
  width: 6800,
  height: 540,
  bossTriggerX: 5300,
  bossArenaLockX: 5250,

  // --- BIOMES DEFINITION ---
  biomes: [
    {
      id: 'BIOME_A',
      name: 'Raíces de Regaliz',
      startX: 0,
      endX: 2200,
      skyGradient: ['#0A0A0F', '#181824', '#2E1065'],
      groundGradient: ['#1C1917', '#292524', '#44403C', '#0C0A09'],
      frostingColor: 'rgba(163, 230, 53, 0.65)',
      particleType: 'acid_sparks'
    },
    {
      id: 'BIOME_B',
      name: 'Charcas de Jarabe Ácido',
      startX: 2200,
      endX: 4600,
      skyGradient: ['#064E3B', '#047857', '#065F46'],
      groundGradient: ['#84CC16', '#65A30D', '#4D7C0F', '#1E3A1E'],
      frostingColor: 'rgba(236, 252, 203, 0.75)',
      particleType: 'acid_bubbles'
    },
    {
      id: 'BIOME_ARENA',
      name: 'La Guarida de la Víbora',
      startX: 4600,
      endX: 6800,
      skyGradient: ['#1E1B4B', '#3B0764', '#047857'],
      groundGradient: ['#14532D', '#166534', '#15803D', '#052E16'],
      frostingColor: 'rgba(190, 242, 100, 0.85)',
      particleType: 'toxic_confetti'
    }
  ],

  // --- COLLISION PLATFORMS ---
  platforms: [
    // --- BIOME A: RAÍCES DE REGALIZ (x: 0 - 2200) ---
    { x: 0, y: 460, width: 900, height: 80, type: 'ground', isOneWay: false },
    { x: 1000, y: 460, width: 1200, height: 80, type: 'ground', isOneWay: false },

    { x: 220, y: 350, width: 170, height: 26, type: 'sticky', isOneWay: true },
    { x: 460, y: 260, width: 180, height: 26, type: 'wafer', isOneWay: true },
    { x: 720, y: 330, width: 160, height: 26, type: 'sticky', isOneWay: true },
    { x: 1060, y: 350, width: 180, height: 26, type: 'elastic', isOneWay: true },
    { x: 1320, y: 270, width: 190, height: 26, type: 'moving', isOneWay: true, minY: 250, maxY: 380, speedY: 50 },
    { x: 1600, y: 340, width: 170, height: 26, type: 'sticky', isOneWay: true },
    { x: 1860, y: 260, width: 180, height: 26, type: 'elastic', isOneWay: true },

    // --- BIOME B: CHARCAS DE JARABE ÁCIDO (x: 2200 - 4600) ---
    { x: 2200, y: 460, width: 600, height: 80, type: 'ground', isOneWay: false },
    { x: 2800, y: 476, width: 160, height: 64, type: 'acid_pool', isOneWay: false },
    { x: 2960, y: 460, width: 650, height: 80, type: 'ground', isOneWay: false },
    { x: 3610, y: 476, width: 180, height: 64, type: 'acid_pool', isOneWay: false },
    { x: 3790, y: 460, width: 810, height: 80, type: 'ground', isOneWay: false },

    { x: 2320, y: 340, width: 180, height: 26, type: 'wafer', isOneWay: true },
    { x: 2580, y: 260, width: 190, height: 26, type: 'elastic', isOneWay: true },
    { x: 2840, y: 350, width: 170, height: 26, type: 'sinking', isOneWay: true },
    { x: 3080, y: 270, width: 180, height: 26, type: 'moving', isOneWay: true, minX: 3060, maxX: 3300, speedX: 60 },
    { x: 3340, y: 340, width: 180, height: 26, type: 'sticky', isOneWay: true },
    { x: 3620, y: 260, width: 190, height: 26, type: 'elastic', isOneWay: true },
    { x: 3900, y: 340, width: 180, height: 26, type: 'wafer', isOneWay: true },
    { x: 4180, y: 260, width: 180, height: 26, type: 'moving', isOneWay: true, minY: 240, maxY: 370, speedY: 55 },
    { x: 4420, y: 340, width: 170, height: 26, type: 'sticky', isOneWay: true },

    // --- BIOME ARENA: GUARIDA DE LA VÍBORA (x: 4600 - 6800) ---
    { x: 4600, y: 460, width: 2200, height: 80, type: 'ground', isOneWay: false },
    { x: 4760, y: 350, width: 170, height: 26, type: 'wafer', isOneWay: true },
    { x: 5020, y: 270, width: 180, height: 26, type: 'elastic', isOneWay: true },

    // Boss Arena Battle Tier Platforms
    { x: 5350, y: 330, width: 200, height: 26, type: 'elastic', isOneWay: true },
    { x: 5650, y: 240, width: 220, height: 26, type: 'wafer', isOneWay: true },
    { x: 5970, y: 330, width: 200, height: 26, type: 'elastic', isOneWay: true },
    { x: 6280, y: 250, width: 220, height: 26, type: 'wafer', isOneWay: true }
  ],

  // --- ENEMIES CONFIGURATION ---
  enemies: [
    // Biome A (x: 0 - 2200)
    { x: 480, y: 410, type: 'LATIGO' },
    { x: 740, y: 280, type: 'ACIDO' },
    { x: 920, y: 410, type: 'ROLLER' },
    { x: 1220, y: 410, type: 'LATIGO' },
    { x: 1440, y: 270, type: 'SNIPER' },
    { x: 1680, y: 410, type: 'KNIGHT' },
    { x: 1950, y: 410, type: 'LATIGO' },

    // Biome B (x: 2200 - 4600)
    { x: 2360, y: 410, type: 'ROLLER' },
    { x: 2540, y: 270, type: 'ACIDO' },
    { x: 2750, y: 410, type: 'LATIGO' },
    { x: 3020, y: 410, type: 'KNIGHT' },
    { x: 3240, y: 270, type: 'ACIDO' },
    { x: 3480, y: 410, type: 'TURRET' },
    { x: 3720, y: 410, type: 'LATIGO' },
    { x: 3980, y: 280, type: 'SNIPER' },
    { x: 4220, y: 410, type: 'ROLLER' },
    { x: 4460, y: 410, type: 'KNIGHT' },

    // Arena Pre-Approach (x: 4600 - 5200)
    { x: 4720, y: 410, type: 'LATIGO' },
    { x: 4940, y: 280, type: 'ACIDO' },
    { x: 5120, y: 410, type: 'ROLLER' }
  ],

  // --- HOSTAGES CONFIGURATION ---
  hostages: [
    { x: 620, y: 410, rewardType: 'LATIGO_DULCE' },
    { x: 1540, y: 410, rewardType: 'HMG' },
    { x: 2700, y: 410, rewardType: 'LATIGO_DULCE' },
    { x: 3820, y: 410, rewardType: 'ROCKET' },
    { x: 4860, y: 410, rewardType: 'ESTRELLA' }
  ],

  // --- DESTRUCTIBLES ---
  destructibles: [
    { x: 380, y: 410, type: 'CAJA', dropType: 'LATIGO_DULCE' },
    { x: 1120, y: 410, type: 'BARRICADA', dropType: 'MANZANA' },
    { x: 2480, y: 410, type: 'CAJA', dropType: 'PLATANO' },
    { x: 3560, y: 410, type: 'BARRICADA', dropType: 'ESTRELLA' },
    { x: 4680, y: 410, type: 'CAJA', dropType: 'CANDY_BONUS' }
  ],

  // --- SLUG VEHICLE ---
  vehicle: {
    x: 2380,
    y: 390
  },

  // --- BOSS CONFIGURATION ---
  boss: {
    x: 5850,
    y: 220,
    type: 'BOSS4'
  }
};
