export const LEVEL_10_CONFIG = {
  id: 10,
  name: 'El Trono del Rey Amargo',
  title: 'NIVEL FINAL: EL TRONO DEL REY AMARGO',
  width: 8500,
  height: 600,
  bossTriggerX: 7350,
  bossArenaLockX: 7300,

  biomes: [
    {
      id: 'ANTECAMARA_IMPERIAL',
      startX: 0,
      endX: 2800,
      skyGradient: ['#1E1B4B', '#4C0519', '#701A75'],
      groundGradient: ['#78350F', '#451A03', '#1C1917'],
      frostingColor: '#F59E0B'
    },
    {
      id: 'SANCTUM_CRISTAL_CARAMELO',
      startX: 2800,
      endX: 5600,
      skyGradient: ['#312E81', '#581C87', '#9333EA'],
      groundGradient: ['#D97706', '#B45309', '#78350F'],
      frostingColor: '#FDE047'
    },
    {
      id: 'TRONO_REY_AMARGO',
      startX: 5600,
      endX: 8500,
      skyGradient: ['#09090B', '#3B0764', '#4C0519'],
      groundGradient: ['#27272A', '#18181B', '#09090B'],
      frostingColor: '#F59E0B'
    }
  ],

  platforms: [
    // BIOMA 1: ANTECÁMARA IMPERIAL (0 - 2800)
    { x: 0, y: 460, width: 850, height: 140, type: 'ground' },
    { x: 850, y: 460, width: 400, height: 140, type: 'spikes' },
    { x: 930, y: 340, width: 150, height: 24, type: 'wafer' },
    { x: 1140, y: 260, width: 140, height: 24, type: 'bounce' },

    { x: 1280, y: 460, width: 700, height: 140, type: 'ground' },
    { x: 1540, y: 350, width: 160, height: 24, type: 'candy_cane' },
    { x: 1780, y: 280, width: 150, height: 24, type: 'elastic' },

    { x: 1980, y: 460, width: 820, height: 140, type: 'ground' },
    { x: 2240, y: 360, width: 160, height: 24, type: 'sinking' },
    { x: 2500, y: 290, width: 160, height: 24, type: 'bounce' },

    // BIOMA 2: SANCTUM DE CRISTAL DE CARAMELO (2800 - 5600)
    { x: 2800, y: 460, width: 900, height: 140, type: 'ground' },
    { x: 3050, y: 350, width: 160, height: 24, type: 'elastic' },
    { x: 3300, y: 280, width: 160, height: 24, type: 'wafer' },
    { x: 3550, y: 210, width: 150, height: 24, type: 'bounce' },

    { x: 3700, y: 460, width: 450, height: 140, type: 'spikes' },
    { x: 3900, y: 330, width: 160, height: 24, type: 'wafer' },

    { x: 4150, y: 460, width: 850, height: 140, type: 'ground' },
    { x: 4400, y: 360, width: 160, height: 24, type: 'candy_cane' },
    { x: 4650, y: 290, width: 160, height: 24, type: 'elastic' },

    { x: 5000, y: 460, width: 600, height: 140, type: 'ground' },
    { x: 5200, y: 350, width: 160, height: 24, type: 'sinking' },
    { x: 5420, y: 290, width: 160, height: 24, type: 'bounce' },

    // BIOMA 3: TRONO DEL REY AMARGO / GRAN ARENA (5600 - 8500)
    { x: 5600, y: 460, width: 750, height: 140, type: 'ground' },
    { x: 5850, y: 350, width: 160, height: 24, type: 'wafer' },
    { x: 6100, y: 280, width: 160, height: 24, type: 'candy_cane' },

    { x: 6350, y: 460, width: 450, height: 140, type: 'spikes' },
    { x: 6550, y: 340, width: 160, height: 24, type: 'bounce' },
    { x: 6800, y: 280, width: 160, height: 24, type: 'wafer' },
    { x: 7050, y: 340, width: 160, height: 24, type: 'elastic' },

    // BOSS ARENA (7300 - 8500)
    { x: 7300, y: 480, width: 1200, height: 120, type: 'ground' },
    { x: 7480, y: 370, width: 180, height: 24, type: 'wafer' },
    { x: 7780, y: 310, width: 180, height: 24, type: 'bounce' },
    { x: 8080, y: 370, width: 180, height: 24, type: 'wafer' }
  ],

  enemies: [
    // Biome 1 Enemies
    { x: 650, y: 270, type: 'HECHICERO_DULCE' },
    { x: 1050, y: 400, type: 'GUARDIA_REAL' },
    { x: 1450, y: 260, type: 'GARGOYLA' },
    { x: 1700, y: 300, type: 'SNIPER' },
    { x: 2150, y: 400, type: 'GUARDIA_REAL' },
    { x: 2400, y: 240, type: 'HECHICERO_DULCE' },

    // Biome 2 Enemies
    { x: 2950, y: 400, type: 'GUARDIA_REAL' },
    { x: 3200, y: 230, type: 'HECHICERO_DULCE' },
    { x: 3500, y: 400, type: 'KNIGHT' },
    { x: 3950, y: 400, type: 'GUARDIA_REAL' },
    { x: 4250, y: 240, type: 'GARGOYLA' },
    { x: 4550, y: 400, type: 'HECHICERO_DULCE' },
    { x: 4900, y: 400, type: 'KNIGHT' },
    { x: 5250, y: 240, type: 'HECHICERO_DULCE' },

    // Biome 3 Enemies
    { x: 5700, y: 400, type: 'GUARDIA_REAL' },
    { x: 5950, y: 230, type: 'HECHICERO_DULCE' },
    { x: 6450, y: 400, type: 'GUARDIA_REAL' },
    { x: 6700, y: 240, type: 'GARGOYLA' },
    { x: 6950, y: 400, type: 'HECHICERO_DULCE' },
    { x: 7150, y: 400, type: 'GUARDIA_REAL' }
  ],

  hostages: [
    { x: 750, y: 410, dropType: 'CANON_COSMICO' },
    { x: 1650, y: 230, dropType: 'CANON_PLASMA' },
    { x: 2600, y: 240, dropType: 'CANON_COSMICO' },
    { x: 4300, y: 240, dropType: 'LANZALLAMAS' },
    { x: 5350, y: 240, dropType: 'CANON_COSMICO' },
    { x: 6700, y: 310, dropType: 'GRENADE' }
  ],

  destructibles: [
    { x: 700, y: 402, hp: 45, dropType: 'PLATANO' },
    { x: 1550, y: 402, hp: 45, dropType: 'MANZANA' },
    { x: 2500, y: 402, hp: 45, dropType: 'CANON_COSMICO' },
    { x: 4100, y: 402, hp: 45, dropType: 'ESTRELLA' },
    { x: 5200, y: 402, hp: 45, dropType: 'ROCKET' },
    { x: 6600, y: 402, hp: 45, dropType: 'ESTRELLA' }
  ],

  vehicle: {
    x: 4200,
    y: 380,
    type: 'TANK'
  },

  boss: {
    x: 7850,
    y: 295,
    hp: 3000,
    type: 'BOSS10'
  }
};
