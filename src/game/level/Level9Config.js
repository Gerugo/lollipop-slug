export const LEVEL_9_CONFIG = {
  id: 9,
  name: 'La Ciudadela de Caramelo Prohibido',
  title: 'NIVEL 9: LA CIUDADELA DE CARAMELO PROHIBIDO',
  width: 8000,
  height: 600,
  bossTriggerX: 6950,
  bossArenaLockX: 6900,

  biomes: [
    {
      id: 'MURALLAS_EXTERIORES',
      startX: 0,
      endX: 2700,
      skyGradient: ['#09090B', '#18181B', '#4C0519'],
      groundGradient: ['#27272A', '#18181B', '#09090B'],
      frostingColor: '#E11D48'
    },
    {
      id: 'PATIOS_GUARDIA_REAL',
      startX: 2700,
      endX: 5400,
      skyGradient: ['#18181B', '#3B0764', '#701A75'],
      groundGradient: ['#3F3F46', '#27272A', '#18181B'],
      frostingColor: '#C084FC'
    },
    {
      id: 'TRONO_EXTERIOR',
      startX: 5400,
      endX: 8000,
      skyGradient: ['#09090B', '#4C0519', '#881337'],
      groundGradient: ['#27272A', '#18181B', '#09090B'],
      frostingColor: '#FB7185'
    }
  ],

  platforms: [
    // BIOMA 1: MURALLAS EXTERIORES (0 - 2700)
    { x: 0, y: 460, width: 850, height: 140, type: 'ground' },
    { x: 850, y: 460, width: 400, height: 140, type: 'spikes' }, // First spikes trap
    { x: 920, y: 340, width: 140, height: 24, type: 'wafer' },
    { x: 1120, y: 260, width: 140, height: 24, type: 'bounce' },

    { x: 1250, y: 460, width: 650, height: 140, type: 'ground' },
    { x: 1500, y: 350, width: 160, height: 24, type: 'candy_cane' },
    { x: 1750, y: 280, width: 150, height: 24, type: 'elastic' },

    { x: 1900, y: 460, width: 800, height: 140, type: 'ground' },
    { x: 2150, y: 360, width: 160, height: 24, type: 'sinking' },
    { x: 2420, y: 290, width: 160, height: 24, type: 'bounce' },

    // BIOMA 2: PATIOS Y SALONES DE LA GUARDIA (2700 - 5400)
    { x: 2700, y: 460, width: 850, height: 140, type: 'ground' },
    { x: 2950, y: 350, width: 160, height: 24, type: 'elastic' },
    { x: 3200, y: 280, width: 160, height: 24, type: 'wafer' },
    { x: 3450, y: 210, width: 150, height: 24, type: 'bounce' },

    { x: 3550, y: 460, width: 450, height: 140, type: 'spikes' },
    { x: 3750, y: 330, width: 160, height: 24, type: 'wafer' },

    { x: 4000, y: 460, width: 750, height: 140, type: 'ground' },
    { x: 4250, y: 360, width: 160, height: 24, type: 'candy_cane' },
    { x: 4500, y: 290, width: 160, height: 24, type: 'elastic' },

    { x: 4750, y: 460, width: 650, height: 140, type: 'ground' },
    { x: 4950, y: 350, width: 160, height: 24, type: 'sinking' },
    { x: 5180, y: 290, width: 160, height: 24, type: 'bounce' },

    // BIOMA 3: TRONO EXTERIOR / ARENA (5400 - 8000)
    { x: 5400, y: 460, width: 700, height: 140, type: 'ground' },
    { x: 5650, y: 350, width: 160, height: 24, type: 'wafer' },
    { x: 5900, y: 280, width: 160, height: 24, type: 'candy_cane' },

    { x: 6100, y: 460, width: 400, height: 140, type: 'spikes' },
    { x: 6250, y: 340, width: 160, height: 24, type: 'bounce' },
    { x: 6500, y: 280, width: 160, height: 24, type: 'wafer' },

    // BOSS ARENA (6900 - 8000)
    { x: 6900, y: 480, width: 1100, height: 120, type: 'ground' },
    { x: 7050, y: 370, width: 180, height: 24, type: 'wafer' },
    { x: 7350, y: 310, width: 180, height: 24, type: 'bounce' },
    { x: 7650, y: 370, width: 180, height: 24, type: 'wafer' }
  ],

  enemies: [
    // Biome 1 Enemies
    { x: 600, y: 270, type: 'GARGOYLA' },
    { x: 1000, y: 400, type: 'GUARDIA_REAL' },
    { x: 1400, y: 260, type: 'GARGOYLA' },
    { x: 1650, y: 300, type: 'SNIPER' },
    { x: 2100, y: 400, type: 'GUARDIA_REAL' },
    { x: 2350, y: 240, type: 'GARGOYLA' },

    // Biome 2 Enemies
    { x: 2850, y: 400, type: 'GUARDIA_REAL' },
    { x: 3100, y: 230, type: 'GARGOYLA' },
    { x: 3400, y: 400, type: 'KNIGHT' },
    { x: 3850, y: 400, type: 'GUARDIA_REAL' },
    { x: 4150, y: 240, type: 'GARGOYLA' },
    { x: 4450, y: 400, type: 'GUARDIA_REAL' },
    { x: 4800, y: 400, type: 'KNIGHT' },
    { x: 5050, y: 240, type: 'GARGOYLA' },

    // Biome 3 Enemies
    { x: 5500, y: 400, type: 'GUARDIA_REAL' },
    { x: 5750, y: 230, type: 'GARGOYLA' },
    { x: 6200, y: 400, type: 'GUARDIA_REAL' },
    { x: 6400, y: 240, type: 'GARGOYLA' },
    { x: 6650, y: 400, type: 'GUARDIA_REAL' }
  ],

  hostages: [
    { x: 700, y: 410, dropType: 'CANON_PLASMA' },
    { x: 1600, y: 230, dropType: 'HMG' },
    { x: 2500, y: 240, dropType: 'CANON_PLASMA' },
    { x: 4100, y: 240, dropType: 'ROCKET' },
    { x: 5200, y: 240, dropType: 'CANON_PLASMA' },
    { x: 6350, y: 310, dropType: 'GRENADE' }
  ],

  destructibles: [
    { x: 650, y: 402, hp: 45, dropType: 'PLATANO' },
    { x: 1500, y: 402, hp: 45, dropType: 'MANZANA' },
    { x: 2400, y: 402, hp: 45, dropType: 'CANON_PLASMA' },
    { x: 3900, y: 402, hp: 45, dropType: 'ESTRELLA' },
    { x: 5000, y: 402, hp: 45, dropType: 'ROCKET' },
    { x: 6200, y: 402, hp: 45, dropType: 'ESTRELLA' }
  ],

  vehicle: {
    x: 4000,
    y: 380,
    type: 'TANK'
  },

  boss: {
    x: 7400,
    y: 305,
    hp: 2200,
    type: 'BOSS9'
  }
};
