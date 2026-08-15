export const LEVEL_8_CONFIG = {
  id: 8,
  name: 'El Río de Lava de Caramelo Líquido',
  title: 'NIVEL 8: EL RÍO DE LAVA DE CARAMELO LÍQUIDO',
  width: 7800,
  height: 600,
  bossTriggerX: 6750,
  bossArenaLockX: 6700,

  biomes: [
    {
      id: 'MARGEN_VOLCANICO',
      startX: 0,
      endX: 2600,
      skyGradient: ['#1C1917', '#451A03', '#9A3412'],
      groundGradient: ['#44403C', '#292524', '#1C1917', '#0C0A09'],
      frostingColor: '#F59E0B'
    },
    {
      id: 'RAPIDOS_CARAMELO_HIRVIENTE',
      startX: 2600,
      endX: 5200,
      skyGradient: ['#292524', '#7C2D12', '#C2410C'],
      groundGradient: ['#EA580C', '#C2410C', '#9A3412', '#4A1204'],
      frostingColor: '#FDE047'
    },
    {
      id: 'CALDERA_DRAGON',
      startX: 5200,
      endX: 7800,
      skyGradient: ['#1C1917', '#7F1D1D', '#B91C1C'],
      groundGradient: ['#292524', '#1C1917', '#0C0A09', '#050505'],
      frostingColor: '#EF4444'
    }
  ],

  platforms: [
    // BIOMA 1: MARGEN VOLCÁNICO (0 - 2600)
    { x: 0, y: 460, width: 800, height: 140, type: 'ground' },
    { x: 800, y: 520, width: 450, height: 80, type: 'lava_caramel' }, // First lava hazard
    { x: 860, y: 380, width: 140, height: 24, type: 'wafer' },
    { x: 1060, y: 310, width: 140, height: 24, type: 'bounce' },

    { x: 1250, y: 460, width: 650, height: 140, type: 'ground' },
    { x: 1450, y: 350, width: 160, height: 24, type: 'candy_cane' },
    { x: 1680, y: 280, width: 150, height: 24, type: 'wafer' },

    { x: 1900, y: 460, width: 700, height: 140, type: 'ground' },
    { x: 2150, y: 360, width: 160, height: 24, type: 'sinking' },
    { x: 2400, y: 290, width: 160, height: 24, type: 'bounce' },

    // BIOMA 2: RÁPIDOS DE CARAMELO HIRVIENTE (2600 - 5200)
    { x: 2600, y: 520, width: 1000, height: 80, type: 'lava_caramel' },
    { x: 2700, y: 400, width: 160, height: 24, type: 'moving', speedX: 70, minX: 2650, maxX: 2950 },
    { x: 3000, y: 330, width: 160, height: 24, type: 'wafer' },
    { x: 3250, y: 260, width: 150, height: 24, type: 'bounce' },
    { x: 3450, y: 380, width: 160, height: 24, type: 'moving', speedX: -70, minX: 3350, maxX: 3600 },

    { x: 3600, y: 460, width: 750, height: 140, type: 'ground' },
    { x: 3850, y: 360, width: 160, height: 24, type: 'candy_cane' },
    { x: 4100, y: 290, width: 160, height: 24, type: 'wafer' },

    { x: 4350, y: 520, width: 850, height: 80, type: 'lava_caramel' },
    { x: 4500, y: 380, width: 160, height: 24, type: 'sinking' },
    { x: 4750, y: 300, width: 160, height: 24, type: 'bounce' },
    { x: 5000, y: 370, width: 170, height: 24, type: 'wafer' },

    // BIOMA 3: CALDERA DEL DRAGÓN / ARENA (5200 - 7800)
    { x: 5200, y: 460, width: 700, height: 140, type: 'ground' },
    { x: 5450, y: 350, width: 160, height: 24, type: 'wafer' },
    { x: 5700, y: 280, width: 160, height: 24, type: 'candy_cane' },

    { x: 5900, y: 520, width: 600, height: 80, type: 'lava_caramel' },
    { x: 6050, y: 380, width: 160, height: 24, type: 'bounce' },
    { x: 6300, y: 300, width: 160, height: 24, type: 'wafer' },

    // BOSS ARENA (6700 - 7800)
    { x: 6700, y: 480, width: 1100, height: 120, type: 'ground' },
    { x: 6850, y: 370, width: 180, height: 24, type: 'wafer' },
    { x: 7150, y: 310, width: 180, height: 24, type: 'bounce' },
    { x: 7450, y: 370, width: 180, height: 24, type: 'wafer' }
  ],

  enemies: [
    // Biome 1 Enemies
    { x: 550, y: 410, type: 'SALAMANDRA' },
    { x: 950, y: 270, type: 'AVISPA_FUEGO' },
    { x: 1350, y: 400, type: 'SALAMANDRA' },
    { x: 1600, y: 300, type: 'SNIPER' },
    { x: 2050, y: 410, type: 'SALAMANDRA' },
    { x: 2300, y: 240, type: 'AVISPA_FUEGO' },

    // Biome 2 Enemies
    { x: 2800, y: 250, type: 'AVISPA_FUEGO' },
    { x: 3100, y: 290, type: 'SALAMANDRA' },
    { x: 3700, y: 410, type: 'KNIGHT' },
    { x: 3950, y: 250, type: 'AVISPA_FUEGO' },
    { x: 4400, y: 300, type: 'SALAMANDRA' },
    { x: 4650, y: 250, type: 'AVISPA_FUEGO' },
    { x: 4900, y: 330, type: 'SALAMANDRA' },

    // Biome 3 Enemies
    { x: 5350, y: 410, type: 'SALAMANDRA' },
    { x: 5600, y: 240, type: 'AVISPA_FUEGO' },
    { x: 6000, y: 410, type: 'KNIGHT' },
    { x: 6200, y: 260, type: 'AVISPA_FUEGO' },
    { x: 6450, y: 260, type: 'SALAMANDRA' }
  ],

  hostages: [
    { x: 700, y: 410, dropType: 'LANZALLAMAS' },
    { x: 1600, y: 230, dropType: 'HMG' },
    { x: 2450, y: 240, dropType: 'LANZALLAMAS' },
    { x: 4000, y: 240, dropType: 'ROCKET' },
    { x: 5050, y: 320, dropType: 'LANZALLAMAS' },
    { x: 6200, y: 330, dropType: 'GRENADE' }
  ],

  destructibles: [
    { x: 600, y: 402, hp: 45, dropType: 'PLATANO' },
    { x: 1450, y: 402, hp: 45, dropType: 'MANZANA' },
    { x: 2350, y: 402, hp: 45, dropType: 'LANZALLAMAS' },
    { x: 3800, y: 402, hp: 45, dropType: 'ESTRELLA' },
    { x: 4900, y: 402, hp: 45, dropType: 'ROCKET' },
    { x: 6150, y: 402, hp: 45, dropType: 'ESTRELLA' }
  ],

  vehicle: {
    x: 3900,
    y: 380,
    type: 'TANK'
  },

  boss: {
    x: 7150,
    y: 160,
    hp: 1900,
    type: 'BOSS8'
  }
};
