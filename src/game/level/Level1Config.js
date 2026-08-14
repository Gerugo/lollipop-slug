// Level 1 Complete World & Biome Configuration
// Modular, data-driven definition for 6400px world

export const LEVEL_1_CONFIG = {
  id: 'level_1',
  name: 'Mundo Lulipop: Del Bosque a la Fábrica',
  width: 6400,
  height: 540,
  bossTriggerX: 5250,
  bossArenaLockX: 5200,

  // --- BIOMES DEFINITION ---
  biomes: [
    {
      id: 'BIOME_A',
      name: 'El Bosque de Piruletas',
      startX: 0,
      endX: 2000,
      skyGradient: ['#93C5FD', '#BAE6FD', '#FEF08A'],
      groundGradient: ['#4ADE80', '#22C55E', '#16A34A', '#14532D'],
      frostingColor: 'rgba(255, 255, 255, 0.55)',
      particleType: 'sugar_dust'
    },
    {
      id: 'BIOME_B',
      name: 'El Río de Sirope (Zona de Peligro)',
      startX: 2000,
      endX: 3800,
      skyGradient: ['#F472B6', '#FB7185', '#FDE047'],
      groundGradient: ['#FB7185', '#E11D48', '#9F1239', '#4C0519'],
      frostingColor: 'rgba(254, 205, 211, 0.65)',
      particleType: 'syrup_bubbles'
    },
    {
      id: 'BIOME_C',
      name: 'La Fábrica de Caramelos',
      startX: 3800,
      endX: 5300,
      skyGradient: ['#818CF8', '#C084FC', '#F472B6'],
      groundGradient: ['#A855F7', '#7E22CE', '#581C87', '#2E1065'],
      frostingColor: 'rgba(243, 232, 255, 0.6)',
      particleType: 'factory_sparks'
    },
    {
      id: 'BIOME_ARENA',
      name: 'Arena del Gumball Mech Titan',
      startX: 5300,
      endX: 6400,
      skyGradient: ['#38BDF8', '#818CF8', '#EC4899'],
      groundGradient: ['#EC4899', '#BE185D', '#831843', '#500724'],
      frostingColor: 'rgba(255, 228, 230, 0.7)',
      particleType: 'confetti'
    }
  ],

  // --- COLLISION PLATFORMS ---
  platforms: [
    // --- BIOME A: BOSQUE DE PIRULETAS (x: 0 - 2000) ---
    { x: 0, y: 460, width: 900, height: 80, type: 'ground', isOneWay: false },
    { x: 960, y: 460, width: 1040, height: 80, type: 'ground', isOneWay: false },

    { x: 260, y: 370, width: 160, height: 26, type: 'wafer', isOneWay: true },
    { x: 480, y: 290, width: 180, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 720, y: 360, width: 160, height: 26, type: 'wafer', isOneWay: true },
    { x: 1060, y: 350, width: 170, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 1300, y: 280, width: 190, height: 26, type: 'wafer', isOneWay: true },
    { x: 1560, y: 360, width: 160, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 1780, y: 280, width: 180, height: 26, type: 'wafer', isOneWay: true },

    // --- BIOME B: EL RÍO DE SIROPE (x: 2000 - 3800) ---
    { x: 2060, y: 460, width: 700, height: 80, type: 'ground', isOneWay: false },
    // Dangerous Syrup River gap with moving & sinking platforms (x: 2760 to 3000)
    { x: 3000, y: 460, width: 800, height: 80, type: 'ground', isOneWay: false },

    // Dynamic Sinking & Moving Platforms
    { x: 2120, y: 370, width: 160, height: 26, type: 'sinking', isOneWay: true },
    { x: 2340, y: 290, width: 170, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 2560, y: 360, width: 160, height: 26, type: 'sinking', isOneWay: true },
    // Moving Wafer over the bubbling syrup lake
    { x: 2770, y: 370, width: 150, height: 26, type: 'moving', isOneWay: true, minX: 2740, maxX: 2980, speedX: 55 },
    { x: 3080, y: 350, width: 170, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 3320, y: 270, width: 180, height: 26, type: 'sinking', isOneWay: true },
    { x: 3580, y: 360, width: 160, height: 26, type: 'moving', isOneWay: true, minY: 280, maxY: 380, speedY: 45 },

    // --- BIOME C: LA FÁBRICA DE CARAMELOS (x: 3800 - 5200) ---
    { x: 3860, y: 460, width: 1340, height: 80, type: 'ground', isOneWay: false },

    // Bounce Trampolines & High Industrial Walkways
    { x: 3940, y: 440, width: 90, height: 22, type: 'bounce', isOneWay: false }, // Jump launcher!
    { x: 4060, y: 270, width: 190, height: 26, type: 'wafer', isOneWay: true },
    { x: 4300, y: 190, width: 180, height: 26, type: 'candy_cane', isOneWay: true }, // High factory catwalk
    { x: 4540, y: 280, width: 180, height: 26, type: 'wafer', isOneWay: true },
    { x: 4720, y: 440, width: 90, height: 22, type: 'bounce', isOneWay: false }, // Second launcher!
    { x: 4860, y: 260, width: 190, height: 26, type: 'candy_cane', isOneWay: true },

    // --- SAFE PREP ZONE & BOSS ARENA (x: 5200 - 6400) ---
    { x: 5240, y: 460, width: 1160, height: 80, type: 'ground', isOneWay: false },

    { x: 5320, y: 360, width: 160, height: 26, type: 'wafer', isOneWay: true },
    { x: 5560, y: 270, width: 200, height: 26, type: 'candy_cane', isOneWay: true },
    { x: 5820, y: 350, width: 170, height: 26, type: 'wafer', isOneWay: true }
  ],

  // --- ENEMIES CONFIGURATION ---
  enemies: [
    // Biome A (Warmup)
    { x: 380, y: 410, type: 'GUMMY' },
    { x: 540, y: 240, type: 'GUMMY' },
    { x: 680, y: 410, type: 'GUMMY' },
    { x: 780, y: 190, type: 'PEZ' },
    { x: 1120, y: 410, type: 'GUMMY' },
    { x: 1360, y: 230, type: 'GUMMY' },
    { x: 1640, y: 410, type: 'GUMMY' },
    { x: 1840, y: 230, type: 'PEZ' },

    // Biome B (Syrup River Hazards & Balloon Bombers)
    { x: 2180, y: 120, type: 'GLOBO' },
    { x: 2260, y: 410, type: 'GUMMY' },
    { x: 2420, y: 240, type: 'TURRET' },
    { x: 2580, y: 410, type: 'GUMMY' },
    { x: 2720, y: 180, type: 'PEZ' },
    { x: 3120, y: 120, type: 'GLOBO' },
    { x: 3220, y: 410, type: 'GUMMY' },
    { x: 3420, y: 220, type: 'GUMMY' },
    { x: 3660, y: 410, type: 'GUMMY' },
    { x: 3740, y: 190, type: 'PEZ' },

    // Biome C (Candy Factory Heavy Fortifications)
    { x: 3980, y: 410, type: 'GUMMY' },
    { x: 4120, y: 220, type: 'TURRET' },
    { x: 4220, y: 110, type: 'GLOBO' },
    { x: 4360, y: 140, type: 'TURRET' },
    { x: 4440, y: 410, type: 'GUMMY' },
    { x: 4620, y: 230, type: 'GUMMY' },
    { x: 4780, y: 120, type: 'GLOBO' },
    { x: 4940, y: 210, type: 'GUMMY' },
    { x: 5040, y: 410, type: 'GUMMY' }
  ],

  // --- HOSTAGES CONFIGURATION ---
  hostages: [
    { x: 520, y: 240, rewardType: 'HMG' },
    { x: 1340, y: 230, rewardType: 'SHOTGUN' },
    { x: 2380, y: 240, rewardType: 'ROCKET' },
    { x: 3360, y: 220, rewardType: 'GRENADE' },
    { x: 4340, y: 140, rewardType: 'ESTRELLA' }
  ],

  // --- DESTRUCTIBLE BARRICADES ---
  destructibles: [
    { x: 840, y: 396, width: 54, height: 64, hp: 45, dropType: 'HMG' },
    { x: 2020, y: 396, width: 54, height: 64, hp: 45, dropType: 'SHOTGUN' },
    { x: 3780, y: 396, width: 54, height: 64, hp: 50, dropType: 'ROCKET' },
    { x: 5120, y: 396, width: 54, height: 64, hp: 40, dropType: 'ESTRELLA' }
  ],

  // --- VEHICLE SPAWN ---
  vehicle: {
    x: 2480,
    y: 390
  },

  // --- BOSS SPAWN ---
  boss: {
    x: 5880,
    y: 230
  }
};

export default LEVEL_1_CONFIG;
