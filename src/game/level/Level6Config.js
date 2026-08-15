export const LEVEL_6_CONFIG = {
  id: 6,
  name: 'Cumbres de Caramelo Helado',
  title: 'NIVEL 6: CUMBRES DE CARAMELO HELADO',
  width: 7400,
  height: 600,
  bossTriggerX: 6350,
  bossArenaLockX: 6300,

  biomes: [
    {
      id: 'FALDAS_NEVADAS',
      startX: 0,
      endX: 2500,
      skyGradient: ['#0F172A', '#1E293B', '#0284C7'],
      groundGradient: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8'],
      frostingColor: '#FFFFFF'
    },
    {
      id: 'GLACIAR_CRISTALINO',
      startX: 2500,
      endX: 5000,
      skyGradient: ['#022C22', '#082F49', '#0369A1'],
      groundGradient: ['#38BDF8', '#0284C7', '#0369A1', '#023F6B'],
      frostingColor: '#BAE6FD'
    },
    {
      id: 'CIMA_CONGELADA',
      startX: 5000,
      endX: 7400,
      skyGradient: ['#0F172A', '#0C4A6E', '#0284C7'],
      groundGradient: ['#BAE6FD', '#7DD3FC', '#38BDF8', '#0284C7'],
      frostingColor: '#FFFFFF'
    }
  ],

  platforms: [
    // BIOMA 1: FALDAS NEVADAS (0 - 2500)
    { x: 0, y: 460, width: 750, height: 140, type: 'ground' },
    { x: 750, y: 460, width: 450, height: 140, type: 'ice' }, // First slippery ice section
    { x: 850, y: 360, width: 140, height: 24, type: 'wafer' },
    { x: 1040, y: 300, width: 130, height: 24, type: 'bounce' },

    { x: 1200, y: 460, width: 650, height: 140, type: 'ground' },
    { x: 1400, y: 350, width: 150, height: 24, type: 'ice' },
    { x: 1600, y: 290, width: 150, height: 24, type: 'wafer' },

    { x: 1850, y: 460, width: 650, height: 140, type: 'ice' },
    { x: 2050, y: 350, width: 160, height: 24, type: 'sinking' },
    { x: 2250, y: 290, width: 160, height: 24, type: 'bounce' },

    // BIOMA 2: GLACIAR DE CARAMELO CRISTALINO (2500 - 5000)
    { x: 2500, y: 460, width: 850, height: 140, type: 'ice' },
    { x: 2750, y: 360, width: 150, height: 24, type: 'wafer' },
    { x: 2980, y: 300, width: 150, height: 24, type: 'ice' },
    { x: 3200, y: 240, width: 140, height: 24, type: 'bounce' },

    { x: 3350, y: 460, width: 700, height: 140, type: 'ground' },
    { x: 3550, y: 360, width: 160, height: 24, type: 'candy_cane' },
    { x: 3750, y: 300, width: 160, height: 24, type: 'wafer' },

    { x: 4050, y: 460, width: 950, height: 140, type: 'ice' },
    { x: 4250, y: 350, width: 150, height: 24, type: 'sinking' },
    { x: 4450, y: 290, width: 150, height: 24, type: 'bounce' },
    { x: 4700, y: 340, width: 160, height: 24, type: 'ice' },

    // BIOMA 3: CIMA CONGELADA / ARENA (5000 - 7400)
    { x: 5000, y: 460, width: 650, height: 140, type: 'ground' },
    { x: 5200, y: 350, width: 160, height: 24, type: 'wafer' },
    { x: 5400, y: 290, width: 160, height: 24, type: 'candy_cane' },

    { x: 5650, y: 460, width: 650, height: 140, type: 'ice' },
    { x: 5850, y: 360, width: 150, height: 24, type: 'bounce' },
    { x: 6050, y: 300, width: 160, height: 24, type: 'wafer' },

    // BOSS ARENA (6300 - 7400)
    { x: 6300, y: 480, width: 1100, height: 120, type: 'ice' },
    { x: 6450, y: 370, width: 170, height: 24, type: 'wafer' },
    { x: 6720, y: 310, width: 180, height: 24, type: 'bounce' },
    { x: 7000, y: 370, width: 170, height: 24, type: 'wafer' }
  ],

  enemies: [
    // Biome 1 Enemies
    { x: 500, y: 410, type: 'PINGUINO' },
    { x: 900, y: 410, type: 'PINGUINO' },
    { x: 1300, y: 400, type: 'YETI' },
    { x: 1500, y: 300, type: 'ACIDO' },
    { x: 1950, y: 410, type: 'PINGUINO' },
    { x: 2150, y: 300, type: 'SNIPER' },

    // Biome 2 Enemies
    { x: 2600, y: 410, type: 'PINGUINO' },
    { x: 2800, y: 310, type: 'YETI' },
    { x: 3100, y: 410, type: 'PINGUINO' },
    { x: 3450, y: 400, type: 'KNIGHT' },
    { x: 3700, y: 250, type: 'MOTH' },
    { x: 4150, y: 410, type: 'PINGUINO' },
    { x: 4400, y: 400, type: 'YETI' },
    { x: 4600, y: 290, type: 'SNIPER' },

    // Biome 3 Enemies
    { x: 5100, y: 410, type: 'PINGUINO' },
    { x: 5350, y: 400, type: 'YETI' },
    { x: 5750, y: 410, type: 'KNIGHT' },
    { x: 5950, y: 310, type: 'PINGUINO' },
    { x: 6150, y: 250, type: 'MOTH' }
  ],

  hostages: [
    { x: 650, y: 410, dropType: 'LANZAHIELOS' },
    { x: 1550, y: 240, dropType: 'HMG' },
    { x: 2300, y: 240, dropType: 'LANZAHIELOS' },
    { x: 3800, y: 250, dropType: 'ROCKET' },
    { x: 4800, y: 290, dropType: 'LANZAHIELOS' },
    { x: 5900, y: 310, dropType: 'GRENADE' }
  ],

  destructibles: [
    { x: 550, y: 402, hp: 45, dropType: 'PLATANO' },
    { x: 1350, y: 402, hp: 45, dropType: 'MANZANA' },
    { x: 2200, y: 402, hp: 45, dropType: 'LANZAHIELOS' },
    { x: 3600, y: 402, hp: 45, dropType: 'ESTRELLA' },
    { x: 4650, y: 402, hp: 45, dropType: 'ROCKET' },
    { x: 5800, y: 402, hp: 45, dropType: 'ESTRELLA' }
  ],

  vehicle: {
    x: 3700,
    y: 380,
    type: 'TANK'
  },

  boss: {
    x: 6750,
    y: 315,
    hp: 1500,
    type: 'BOSS6'
  }
};
