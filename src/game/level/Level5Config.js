export const LEVEL_5_CONFIG = {
  id: 5,
  name: 'El Pantano de Gaseosa',
  title: 'NIVEL 5: EL PANTANO DE GASEOSA',
  width: 7200,
  height: 600,
  bossTriggerX: 6200,
  bossArenaLockX: 6150,

  biomes: [
    {
      id: 'AGUAS_POCO_PROFUNDAS',
      startX: 0,
      endX: 2400,
      skyGradient: ['#042F2E', '#064E3B', '#0D9488'],
      groundGradient: ['#0F766E', '#115E59', '#134E4A', '#042F2E'],
      frostingColor: '#5EEAD4'
    },
    {
      id: 'CORRIENTE_BURBUJAS',
      startX: 2400,
      endX: 4800,
      skyGradient: ['#042F2E', '#1E1B4B', '#065F46'],
      groundGradient: ['#134E4A', '#064E3B', '#022C22', '#011714'],
      frostingColor: '#34D399'
    },
    {
      id: 'LAGUNA_ELECTRICA',
      startX: 4800,
      endX: 7200,
      skyGradient: ['#0F172A', '#0369A1', '#064E3B'],
      groundGradient: ['#0C4A6E', '#075985', '#022C22', '#010F18'],
      frostingColor: '#38BDF8'
    }
  ],

  platforms: [
    // BIOMA 1: AGUAS POCO PROFUNDAS (0 - 2400)
    { x: 0, y: 460, width: 700, height: 140, type: 'ground' },
    { x: 700, y: 530, width: 350, height: 70, type: 'soda_tide' }, // Tide hazard
    { x: 740, y: 390, width: 140, height: 24, type: 'wafer' },
    { x: 920, y: 340, width: 130, height: 24, type: 'bounce' }, // Bubble trampoline

    { x: 1050, y: 460, width: 600, height: 140, type: 'ground' },
    { x: 1250, y: 360, width: 150, height: 24, type: 'sinking' },
    { x: 1450, y: 300, width: 160, height: 24, type: 'wafer' },

    { x: 1650, y: 530, width: 400, height: 70, type: 'soda_tide' },
    { x: 1700, y: 410, width: 130, height: 24, type: 'sinking' },
    { x: 1880, y: 360, width: 140, height: 24, type: 'sinking' },

    { x: 2050, y: 460, width: 550, height: 140, type: 'ground' },
    { x: 2200, y: 350, width: 160, height: 24, type: 'candy_cane' },

    // BIOMA 2: CORRIENTE DE BURBUJAS ÁCIDAS (2400 - 4800)
    { x: 2600, y: 530, width: 600, height: 70, type: 'soda_tide' },
    { x: 2650, y: 420, width: 130, height: 24, type: 'bounce' },
    { x: 2820, y: 360, width: 140, height: 24, type: 'sinking' },
    { x: 3000, y: 310, width: 150, height: 24, type: 'bounce' },

    { x: 3200, y: 460, width: 750, height: 140, type: 'ground' },
    { x: 3400, y: 350, width: 160, height: 24, type: 'wafer' },
    { x: 3650, y: 290, width: 180, height: 24, type: 'candy_cane' },

    { x: 3950, y: 530, width: 450, height: 70, type: 'soda_tide' },
    { x: 4000, y: 400, width: 140, height: 24, type: 'sinking' },
    { x: 4200, y: 340, width: 150, height: 24, type: 'bounce' },

    { x: 4400, y: 460, width: 650, height: 140, type: 'ground' },
    { x: 4600, y: 360, width: 160, height: 24, type: 'wafer' },

    // BIOMA 3: LAGUNA ELÉCTRICA / ARENA (4800 - 7200)
    { x: 5050, y: 530, width: 500, height: 70, type: 'soda_tide' },
    { x: 5120, y: 410, width: 140, height: 24, type: 'sinking' },
    { x: 5320, y: 350, width: 150, height: 24, type: 'bounce' },

    { x: 5550, y: 460, width: 650, height: 140, type: 'ground' },
    { x: 5750, y: 360, width: 160, height: 24, type: 'wafer' },
    { x: 5950, y: 300, width: 160, height: 24, type: 'candy_cane' },

    // BOSS ARENA (6150 - 7200)
    { x: 6150, y: 480, width: 1050, height: 120, type: 'ground' },
    { x: 6300, y: 370, width: 170, height: 24, type: 'wafer' },
    { x: 6550, y: 310, width: 180, height: 24, type: 'bounce' },
    { x: 6800, y: 370, width: 170, height: 24, type: 'wafer' }
  ],

  enemies: [
    // Biome 1 Enemies
    { x: 450, y: 410, type: 'RANA' },
    { x: 800, y: 340, type: 'ANGUILA' },
    { x: 1150, y: 410, type: 'RANA' },
    { x: 1350, y: 310, type: 'ACIDO' },
    { x: 1750, y: 360, type: 'ANGUILA' },
    { x: 2150, y: 410, type: 'RANA' },
    { x: 2350, y: 300, type: 'ACIDO' },

    // Biome 2 Enemies
    { x: 2700, y: 370, type: 'ANGUILA' },
    { x: 2900, y: 310, type: 'RANA' },
    { x: 3300, y: 410, type: 'RANA' },
    { x: 3500, y: 300, type: 'LATIGO' },
    { x: 3750, y: 240, type: 'ACIDO' },
    { x: 4100, y: 350, type: 'ANGUILA' },
    { x: 4500, y: 410, type: 'RANA' },
    { x: 4700, y: 310, type: 'ACIDO' },

    // Biome 3 Enemies
    { x: 5200, y: 360, type: 'ANGUILA' },
    { x: 5400, y: 300, type: 'RANA' },
    { x: 5650, y: 410, type: 'LATIGO' },
    { x: 5850, y: 310, type: 'ACIDO' },
    { x: 6000, y: 250, type: 'ANGUILA' }
  ],

  hostages: [
    { x: 600, y: 410, dropType: 'CANON_BURBUJAS' },
    { x: 1500, y: 250, dropType: 'HMG' },
    { x: 2250, y: 300, dropType: 'CANON_BURBUJAS' },
    { x: 3700, y: 240, dropType: 'ROCKET' },
    { x: 4650, y: 310, dropType: 'CANON_BURBUJAS' },
    { x: 5800, y: 310, dropType: 'GRENADE' }
  ],

  destructibles: [
    { x: 500, y: 402, hp: 45, dropType: 'PLATANO' },
    { x: 1200, y: 402, hp: 45, dropType: 'MANZANA' },
    { x: 2100, y: 402, hp: 45, dropType: 'CANON_BURBUJAS' },
    { x: 3450, y: 402, hp: 45, dropType: 'ESTRELLA' },
    { x: 4550, y: 402, hp: 45, dropType: 'ROCKET' },
    { x: 5650, y: 402, hp: 45, dropType: 'ESTRELLA' }
  ],

  vehicle: {
    x: 3500,
    y: 380,
    type: 'TANK'
  },

  boss: {
    x: 6600,
    y: 150,
    hp: 1300,
    type: 'BOSS5'
  }
};
