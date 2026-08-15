// Level 3 Complete World & Biome Configuration
// "La Fábrica de los Sueños Rotos" - 7800px Cosmic Candy Factory

export const LEVEL_3_CONFIG = {
  id: 'level_3',
  name: 'La Fábrica de los Sueños Rotos',
  width: 7800,
  height: 540,
  bossTriggerX: 6200,
  bossArenaLockX: 6150,

  // --- BIOMES DEFINITION ---
  biomes: [
    {
      id: 'BIOME_A',
      name: 'Tuberías de Caramelo',
      startX: 0,
      endX: 2000,
      skyGradient: ['#1E1B4B', '#2E1065', '#78350F'],
      groundGradient: ['#F59E0B', '#D97706', '#B45309', '#451A03'],
      frostingColor: 'rgba(254, 240, 138, 0.75)',
      particleType: 'factory_sparks'
    },
    {
      id: 'BIOME_B',
      name: 'Nubes de Algodón de Azúcar',
      startX: 2000,
      endX: 4000,
      skyGradient: ['#3B0764', '#701A75', '#EC4899'],
      groundGradient: ['#F472B6', '#DB2777', '#9D174D', '#500724'],
      frostingColor: 'rgba(251, 207, 232, 0.75)',
      particleType: 'sugar_dust'
    },
    {
      id: 'BIOME_C',
      name: 'Sala de Empaquetado Neón',
      startX: 4000,
      endX: 5800,
      skyGradient: ['#0F172A', '#1E293B', '#0284C7'],
      groundGradient: ['#38BDF8', '#0284C7', '#0369A1', '#082F49'],
      frostingColor: 'rgba(186, 230, 253, 0.75)',
      particleType: 'crystal_shards'
    },
    {
      id: 'BIOME_ARENA',
      name: 'El Trono de la Reina de Azúcar',
      startX: 5800,
      endX: 7800,
      skyGradient: ['#2E1065', '#581C87', '#C026D3'],
      groundGradient: ['#E879F9', '#C026D3', '#86198F', '#3B0764'],
      frostingColor: 'rgba(250, 232, 255, 0.85)',
      particleType: 'confetti'
    }
  ],

  // --- COLLISION PLATFORMS ---
  platforms: [
    // --- BIOME A: TUBERÍAS DE CARAMELO (x: 0 - 2000) ---
    { x: 0, y: 460, width: 850, height: 80, type: 'ground', isOneWay: false },
    { x: 950, y: 460, width: 1050, height: 80, type: 'ground', isOneWay: false },

    { x: 220, y: 350, width: 160, height: 26, type: 'wafer', isOneWay: true },
    { x: 440, y: 260, width: 180, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 680, y: 340, width: 160, height: 26, type: 'wafer', isOneWay: true },
    { x: 1020, y: 360, width: 170, height: 26, type: 'moving', isOneWay: true, minY: 260, maxY: 380, speedY: 55 },
    { x: 1260, y: 280, width: 180, height: 26, type: 'sinking', isOneWay: true },
    { x: 1520, y: 350, width: 160, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 1760, y: 270, width: 170, height: 26, type: 'wafer', isOneWay: true },

    // --- BIOME B: NUBES DE ALGODÓN (x: 2000 - 4000) ---
    { x: 2080, y: 460, width: 620, height: 80, type: 'ground', isOneWay: false },
    // Cotton cloud sky leap (gap x: 2700 - 3050)
    { x: 3050, y: 460, width: 650, height: 80, type: 'ground', isOneWay: false },
    // Gap x: 3700 - 4050

    { x: 2160, y: 360, width: 160, height: 26, type: 'wafer', isOneWay: true },
    { x: 2380, y: 270, width: 180, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 2580, y: 440, width: 90, height: 22, type: 'bounce', isOneWay: false },
    // Floating cloud path over the gap
    { x: 2720, y: 330, width: 160, height: 26, type: 'moving', isOneWay: true, minX: 2700, maxX: 3000, speedX: 75 },
    { x: 3150, y: 360, width: 170, height: 26, type: 'sinking', isOneWay: true },
    { x: 3400, y: 270, width: 180, height: 26, type: 'wafer', isOneWay: true },
    { x: 3720, y: 340, width: 160, height: 26, type: 'moving', isOneWay: true, minX: 3700, maxX: 4020, speedX: 70, minY: 260, maxY: 370, speedY: 45 },

    // --- BIOME C: SALA DE EMPAQUETADO (x: 4000 - 5800) ---
    { x: 4120, y: 460, width: 1680, height: 80, type: 'ground', isOneWay: false },

    { x: 4220, y: 360, width: 170, height: 26, type: 'wafer', isOneWay: true },
    { x: 4440, y: 270, width: 190, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 4680, y: 190, width: 180, height: 26, type: 'sinking', isOneWay: true },
    { x: 4920, y: 440, width: 90, height: 22, type: 'bounce', isOneWay: false },
    { x: 5080, y: 280, width: 180, height: 26, type: 'moving', isOneWay: true, minX: 5060, maxX: 5350, speedX: 80 },
    { x: 5380, y: 360, width: 170, height: 26, type: 'wafer', isOneWay: true },
    { x: 5620, y: 270, width: 180, height: 26, type: 'candy_cane', isOneWay: true },

    // --- BOSS ARENA (x: 5800 - 7800) ---
    { x: 5880, y: 460, width: 1920, height: 80, type: 'ground', isOneWay: false },

    { x: 6020, y: 360, width: 170, height: 26, type: 'wafer', isOneWay: true },
    { x: 6280, y: 260, width: 220, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 6580, y: 350, width: 180, height: 26, type: 'wafer', isOneWay: true },
    { x: 6860, y: 260, width: 200, height: 26, type: 'sinking', isOneWay: true }
  ],

  // --- ENEMIES CONFIGURATION (38 Total - Featuring ROLLER, SNIPER, MOTH, KNIGHT) ---
  enemies: [
    // Biome A (Tuberías de Caramelo)
    { x: 360, y: 410, type: 'ROLLER' },
    { x: 480, y: 210, type: 'SNIPER' },
    { x: 620, y: 150, type: 'MOTH' },
    { x: 740, y: 400, type: 'KNIGHT' },
    { x: 1040, y: 410, type: 'ROLLER' },
    { x: 1200, y: 160, type: 'MOTH' },
    { x: 1320, y: 230, type: 'SNIPER' },
    { x: 1480, y: 400, type: 'KNIGHT' },
    { x: 1660, y: 410, type: 'ROLLER' },
    { x: 1820, y: 220, type: 'TURRET' },
    { x: 1940, y: 150, type: 'MOTH' },

    // Biome B (Nubes de Algodón)
    { x: 2180, y: 410, type: 'ROLLER' },
    { x: 2280, y: 140, type: 'MOTH' },
    { x: 2420, y: 220, type: 'SNIPER' },
    { x: 2540, y: 400, type: 'KNIGHT' },
    { x: 2800, y: 160, type: 'MOTH' },
    { x: 3160, y: 410, type: 'ROLLER' },
    { x: 3300, y: 140, type: 'MOTH' },
    { x: 3440, y: 220, type: 'SNIPER' },
    { x: 3580, y: 400, type: 'KNIGHT' },
    { x: 3820, y: 150, type: 'MOTH' },
    { x: 3960, y: 290, type: 'TURRET' },

    // Biome C (Sala de Empaquetado)
    { x: 4200, y: 410, type: 'ROLLER' },
    { x: 4320, y: 150, type: 'MOTH' },
    { x: 4480, y: 220, type: 'SNIPER' },
    { x: 4620, y: 400, type: 'KNIGHT' },
    { x: 4760, y: 140, type: 'SNIPER' },
    { x: 4880, y: 410, type: 'ROLLER' },
    { x: 5040, y: 150, type: 'MOTH' },
    { x: 5200, y: 230, type: 'TURRET' },
    { x: 5360, y: 400, type: 'KNIGHT' },
    { x: 5480, y: 410, type: 'ROLLER' },
    { x: 5620, y: 220, type: 'SNIPER' },
    { x: 5740, y: 400, type: 'KNIGHT' }
  ],

  // --- HOSTAGES CONFIGURATION (5 Gatitos) ---
  hostages: [
    { x: 460, y: 210, rewardType: 'ROCKET' },
    { x: 1300, y: 230, rewardType: 'SHOTGUN' },
    { x: 2400, y: 220, rewardType: 'HMG' },
    { x: 3420, y: 220, rewardType: 'GRENADE' },
    { x: 4700, y: 140, rewardType: 'ESTRELLA' }
  ],

  // --- DESTRUCTIBLE BARRICADES ---
  destructibles: [
    { x: 880, y: 396, width: 54, height: 64, hp: 65, dropType: 'HMG' },
    { x: 2040, y: 396, width: 54, height: 64, hp: 65, dropType: 'SHOTGUN' },
    { x: 4080, y: 396, width: 54, height: 64, hp: 70, dropType: 'ROCKET' },
    { x: 5800, y: 396, width: 54, height: 64, hp: 70, dropType: 'ESTRELLA' }
  ],

  // --- VEHICLE SPAWN ---
  vehicle: {
    x: 2700,
    y: 390
  },

  // --- BOSS SPAWN ---
  boss: {
    x: 7050,
    y: 190
  }
};

export default LEVEL_3_CONFIG;
