export const LEVEL_7_CONFIG = {
  id: 7,
  name: 'El Laberinto de Gominola Elástica',
  title: 'NIVEL 7: EL LABERINTO DE GOMINOLA ELÁSTICA',
  width: 7600,
  height: 600,
  bossTriggerX: 6550,
  bossArenaLockX: 6500,

  biomes: [
    {
      id: 'CAVERNA_GELATINA_ROJA',
      startX: 0,
      endX: 2600,
      skyGradient: ['#3B0764', '#831843', '#BE123C'],
      groundGradient: ['#E11D48', '#BE123C', '#881337', '#4C0519'],
      frostingColor: '#FDA4AF'
    },
    {
      id: 'GALERIAS_GOMINOLA_VERDE',
      startX: 2600,
      endX: 5200,
      skyGradient: ['#022C22', '#064E3B', '#15803D'],
      groundGradient: ['#65A30D', '#4D7C0F', '#365314', '#14300A'],
      frostingColor: '#D9F99D'
    },
    {
      id: 'NIDO_CIEMPIES',
      startX: 5200,
      endX: 7600,
      skyGradient: ['#2E1065', '#581C87', '#9333EA'],
      groundGradient: ['#7E22CE', '#6B21A8', '#3B0764', '#1E0336'],
      frostingColor: '#E9D5FF'
    }
  ],

  platforms: [
    // BIOMA 1: CAVERNA DE GELATINA ROJA (0 - 2600)
    { x: 0, y: 460, width: 800, height: 140, type: 'ground' },
    { x: 800, y: 460, width: 400, height: 140, type: 'elastic' }, // Ultra bounce trampoline
    { x: 920, y: 320, width: 150, height: 24, type: 'wafer' },
    { x: 1100, y: 240, width: 140, height: 24, type: 'bounce' },

    { x: 1200, y: 460, width: 650, height: 140, type: 'ground' },
    { x: 1450, y: 350, width: 160, height: 24, type: 'elastic' },
    { x: 1680, y: 280, width: 150, height: 24, type: 'wafer' },

    { x: 1850, y: 460, width: 750, height: 140, type: 'ground' },
    { x: 2100, y: 360, width: 160, height: 24, type: 'sinking' },
    { x: 2350, y: 290, width: 160, height: 24, type: 'elastic' },

    // BIOMA 2: GALERÍAS GOMINOLA VERDE (2600 - 5200)
    { x: 2600, y: 460, width: 900, height: 140, type: 'ground' },
    { x: 2850, y: 350, width: 160, height: 24, type: 'elastic' },
    { x: 3100, y: 280, width: 160, height: 24, type: 'wafer' },
    { x: 3350, y: 210, width: 150, height: 24, type: 'bounce' },

    { x: 3500, y: 460, width: 700, height: 140, type: 'ground' },
    { x: 3750, y: 360, width: 160, height: 24, type: 'candy_cane' },
    { x: 4000, y: 290, width: 160, height: 24, type: 'elastic' },

    { x: 4200, y: 460, width: 1000, height: 140, type: 'ground' },
    { x: 4450, y: 360, width: 160, height: 24, type: 'sinking' },
    { x: 4700, y: 290, width: 160, height: 24, type: 'elastic' },
    { x: 4950, y: 340, width: 170, height: 24, type: 'wafer' },

    // BIOMA 3: NIDO CIEMPIÉS / ARENA (5200 - 7600)
    { x: 5200, y: 460, width: 700, height: 140, type: 'ground' },
    { x: 5450, y: 350, width: 160, height: 24, type: 'wafer' },
    { x: 5700, y: 280, width: 160, height: 24, type: 'elastic' },

    { x: 5900, y: 460, width: 600, height: 140, type: 'ground' },
    { x: 6150, y: 360, width: 160, height: 24, type: 'bounce' },
    { x: 6350, y: 290, width: 160, height: 24, type: 'candy_cane' },

    // BOSS ARENA (6500 - 7600)
    { x: 6500, y: 480, width: 1100, height: 120, type: 'ground' },
    { x: 6650, y: 370, width: 180, height: 24, type: 'elastic' },
    { x: 6950, y: 310, width: 180, height: 24, type: 'wafer' },
    { x: 7250, y: 370, width: 180, height: 24, type: 'elastic' }
  ],

  enemies: [
    // Biome 1 Enemies
    { x: 500, y: 410, type: 'MURCIELAGO' },
    { x: 950, y: 410, type: 'SLIME' },
    { x: 1350, y: 400, type: 'MURCIELAGO' },
    { x: 1600, y: 300, type: 'ACIDO' },
    { x: 2000, y: 410, type: 'SLIME' },
    { x: 2250, y: 300, type: 'RANA' },

    // Biome 2 Enemies
    { x: 2700, y: 410, type: 'SLIME' },
    { x: 2950, y: 310, type: 'MURCIELAGO' },
    { x: 3250, y: 410, type: 'LATIGO' },
    { x: 3600, y: 400, type: 'SLIME' },
    { x: 3850, y: 250, type: 'MURCIELAGO' },
    { x: 4300, y: 410, type: 'SLIME' },
    { x: 4550, y: 400, type: 'LATIGO' },
    { x: 4800, y: 290, type: 'SNIPER' },

    // Biome 3 Enemies
    { x: 5300, y: 410, type: 'MURCIELAGO' },
    { x: 5550, y: 400, type: 'SLIME' },
    { x: 5950, y: 410, type: 'MURCIELAGO' },
    { x: 6150, y: 310, type: 'SLIME' },
    { x: 6350, y: 250, type: 'KNIGHT' }
  ],

  hostages: [
    { x: 700, y: 410, dropType: 'RAYO_LASER' },
    { x: 1600, y: 230, dropType: 'HMG' },
    { x: 2400, y: 240, dropType: 'RAYO_LASER' },
    { x: 3900, y: 250, dropType: 'ROCKET' },
    { x: 4900, y: 290, dropType: 'RAYO_LASER' },
    { x: 6050, y: 310, dropType: 'GRENADE' }
  ],

  destructibles: [
    { x: 600, y: 402, hp: 45, dropType: 'PLATANO' },
    { x: 1400, y: 402, hp: 45, dropType: 'MANZANA' },
    { x: 2300, y: 402, hp: 45, dropType: 'RAYO_LASER' },
    { x: 3700, y: 402, hp: 45, dropType: 'ESTRELLA' },
    { x: 4800, y: 402, hp: 45, dropType: 'ROCKET' },
    { x: 6000, y: 402, hp: 45, dropType: 'ESTRELLA' }
  ],

  vehicle: {
    x: 3800,
    y: 380,
    type: 'TANK'
  },

  boss: {
    x: 6950,
    y: 180,
    hp: 1700,
    type: 'BOSS7'
  }
};
