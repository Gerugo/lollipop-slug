// Level 2 Complete World & Biome Configuration
// Modular, data-driven definition for 7200px world

export const LEVEL_2_CONFIG = {
  id: 'level_2',
  name: 'Las Profundidades de Chocolate',
  width: 7200,
  height: 540,
  bossTriggerX: 5950,
  bossArenaLockX: 5900,

  // --- BIOMES DEFINITION ---
  biomes: [
    {
      id: 'BIOME_A',
      name: 'Cavernas de Helado',
      startX: 0,
      endX: 2200,
      skyGradient: ['#1E1B4B', '#312E81', '#818CF8'],
      groundGradient: ['#93C5FD', '#3B82F6', '#1E40AF', '#1E3A5F'],
      frostingColor: 'rgba(186, 230, 253, 0.65)',
      particleType: 'ice_crystals'
    },
    {
      id: 'BIOME_B',
      name: 'Río de Chocolate Fundido',
      startX: 2200,
      endX: 4200,
      skyGradient: ['#78350F', '#92400E', '#F59E0B'],
      groundGradient: ['#92400E', '#78350F', '#451A03', '#1C0A00'],
      frostingColor: 'rgba(217, 119, 6, 0.7)',
      particleType: 'cocoa_steam'
    },
    {
      id: 'BIOME_C',
      name: 'Minas de Cristal de Azúcar',
      startX: 4200,
      endX: 5800,
      skyGradient: ['#701A75', '#86198F', '#E879F9'],
      groundGradient: ['#C026D3', '#A21CAF', '#701A75', '#3B0764'],
      frostingColor: 'rgba(240, 171, 252, 0.6)',
      particleType: 'crystal_shards'
    },
    {
      id: 'BIOME_ARENA',
      name: 'Núcleo del Volcán de Caramelo',
      startX: 5800,
      endX: 7200,
      skyGradient: ['#7F1D1D', '#DC2626', '#F97316'],
      groundGradient: ['#EF4444', '#B91C1C', '#7F1D1D', '#450A0A'],
      frostingColor: 'rgba(252, 165, 165, 0.7)',
      particleType: 'lava_sparks'
    }
  ],

  // --- COLLISION PLATFORMS ---
  platforms: [
    // --- BIOME A: CAVERNAS DE HELADO (x: 0 - 2200) ---
    { x: 0, y: 460, width: 800, height: 80, type: 'ground', isOneWay: false },
    { x: 920, y: 460, width: 1280, height: 80, type: 'ground', isOneWay: false },

    { x: 200, y: 350, width: 160, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 440, y: 280, width: 180, height: 26, type: 'wafer', isOneWay: true },
    { x: 680, y: 360, width: 160, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 1000, y: 350, width: 170, height: 26, type: 'moving', isOneWay: true, minY: 250, maxY: 380, speedY: 60 },
    { x: 1280, y: 280, width: 190, height: 26, type: 'sinking', isOneWay: true },
    { x: 1540, y: 360, width: 160, height: 26, type: 'wafer', isOneWay: true },
    { x: 1760, y: 280, width: 180, height: 26, type: 'sinking', isOneWay: true },
    { x: 1980, y: 180, width: 150, height: 26, type: 'candy_cane', isOneWay: true },

    // --- BIOME B: RÍO DE CHOCOLATE (x: 2200 - 4200) ---
    { x: 2280, y: 460, width: 600, height: 80, type: 'ground', isOneWay: false },
    // Dangerous Chocolate River gap (x: 2880 to 3200)
    { x: 3200, y: 460, width: 600, height: 80, type: 'ground', isOneWay: false },
    // Another gap (x: 3800 to 4200)

    { x: 2320, y: 370, width: 160, height: 26, type: 'wafer', isOneWay: true },
    { x: 2540, y: 290, width: 170, height: 26, type: 'bounce', isOneWay: false },
    { x: 2760, y: 180, width: 160, height: 26, type: 'sinking', isOneWay: true },
    // Moving platforms over the river
    { x: 2880, y: 370, width: 150, height: 26, type: 'moving', isOneWay: true, minX: 2850, maxX: 3180, speedX: 70 },
    { x: 3320, y: 350, width: 170, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 3560, y: 270, width: 180, height: 26, type: 'sinking', isOneWay: true },
    { x: 3820, y: 360, width: 160, height: 26, type: 'moving', isOneWay: true, minX: 3800, maxX: 4180, speedX: 65, minY: 280, maxY: 380, speedY: 45 }, // Diagonal!

    // --- BIOME C: MINAS DE CRISTAL (x: 4200 - 5800) ---
    { x: 4260, y: 460, width: 1540, height: 80, type: 'ground', isOneWay: false },

    { x: 4340, y: 440, width: 90, height: 22, type: 'bounce', isOneWay: false },
    { x: 4460, y: 270, width: 190, height: 26, type: 'wafer', isOneWay: true },
    { x: 4700, y: 190, width: 180, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 4940, y: 280, width: 180, height: 26, type: 'sinking', isOneWay: true },
    { x: 5120, y: 440, width: 90, height: 22, type: 'bounce', isOneWay: false },
    { x: 5260, y: 260, width: 190, height: 26, type: 'moving', isOneWay: true, minX: 5240, maxX: 5500, speedX: 80 },
    { x: 5540, y: 350, width: 160, height: 26, type: 'wafer', isOneWay: true },

    // --- BOSS ARENA (x: 5800 - 7200) ---
    { x: 5880, y: 460, width: 1320, height: 80, type: 'ground', isOneWay: false },

    { x: 5960, y: 360, width: 160, height: 26, type: 'wafer', isOneWay: true },
    { x: 6200, y: 270, width: 200, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 6460, y: 350, width: 170, height: 26, type: 'wafer', isOneWay: true }
  ],

  // --- ENEMIES CONFIGURATION (35 Total) ---
  enemies: [
    // Biome A (Ice Caverns)
    { x: 380, y: 410, type: 'GUMMY' },
    { x: 540, y: 230, type: 'GUMMY' },
    { x: 740, y: 310, type: 'GUMMY' },
    { x: 860, y: 190, type: 'PEZ' },
    { x: 1120, y: 410, type: 'GUMMY' },
    { x: 1360, y: 230, type: 'GUMMY' },
    { x: 1640, y: 410, type: 'GUMMY' },
    { x: 1820, y: 230, type: 'GUMMY' },
    { x: 2020, y: 130, type: 'GUMMY' },
    { x: 2140, y: 230, type: 'PEZ' },

    // Biome B (Chocolate River)
    { x: 2380, y: 410, type: 'GUMMY' },
    { x: 2480, y: 120, type: 'GLOBO' },
    { x: 2620, y: 240, type: 'TURRET' },
    { x: 2780, y: 410, type: 'GUMMY' },
    { x: 2940, y: 180, type: 'PEZ' },
    { x: 3340, y: 410, type: 'GUMMY' },
    { x: 3460, y: 120, type: 'GLOBO' },
    { x: 3620, y: 220, type: 'GUMMY' },
    { x: 3880, y: 410, type: 'GUMMY' },
    { x: 4020, y: 190, type: 'PEZ' },
    { x: 4140, y: 280, type: 'GUMMY' },
    { x: 4180, y: 120, type: 'PEZ' },

    // Biome C (Crystal Mines)
    { x: 4380, y: 410, type: 'GUMMY' },
    { x: 4520, y: 220, type: 'TURRET' },
    { x: 4620, y: 110, type: 'GLOBO' },
    { x: 4760, y: 140, type: 'TURRET' },
    { x: 4840, y: 410, type: 'GUMMY' },
    { x: 5020, y: 230, type: 'GUMMY' },
    { x: 5180, y: 120, type: 'GLOBO' },
    { x: 5340, y: 210, type: 'TURRET' },
    { x: 5440, y: 410, type: 'GUMMY' },
    { x: 5580, y: 300, type: 'GUMMY' },
    { x: 5660, y: 140, type: 'GLOBO' },
    { x: 5740, y: 410, type: 'GUMMY' }
  ],

  // --- HOSTAGES CONFIGURATION ---
  hostages: [
    { x: 520, y: 230, rewardType: 'ROCKET' },
    { x: 1340, y: 230, rewardType: 'SHOTGUN' },
    { x: 2580, y: 240, rewardType: 'HMG' },
    { x: 3660, y: 220, rewardType: 'GRENADE' },
    { x: 4740, y: 140, rewardType: 'ESTRELLA' }
  ],

  // --- DESTRUCTIBLE BARRICADES ---
  destructibles: [
    { x: 840, y: 396, width: 54, height: 64, hp: 55, dropType: 'HMG' },
    { x: 2240, y: 396, width: 54, height: 64, hp: 55, dropType: 'SHOTGUN' },
    { x: 4180, y: 396, width: 54, height: 64, hp: 60, dropType: 'ROCKET' },
    { x: 5420, y: 396, width: 54, height: 64, hp: 60, dropType: 'ESTRELLA' }
  ],

  // --- VEHICLE SPAWN ---
  vehicle: {
    x: 2800,
    y: 390
  },

  // --- BOSS SPAWN ---
  boss: {
    x: 6680,
    y: 230
  }
};

export default LEVEL_2_CONFIG;
