import { imageLoader } from '../engine/ImageLoader.js';

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.bgAmbientParticles = [];
    this.midAmbientParticles = [];
    this.fgAmbientParticles = [];
    this.maxParticles = 220;
    this.ambientTimer = 0;
  }

  // --- AMBIENT PARTICLES: MULTI-PLANE PARALLAX POWDERED SUGAR GLAS ---
  updateAmbient(dt, camera, currentBiome) {
    this.ambientTimer += dt;

    // 1. Background Powdered Sugar Dust (Far depth, slow drift, soft motas)
    while (this.bgAmbientParticles.length < 12) {
      const bx = camera.x * 0.35 + Math.random() * (camera.viewportWidth + 200) - 100;
      const by = Math.random() * (camera.viewportHeight + 40);
      this.bgAmbientParticles.push({
        x: bx,
        y: by,
        baseVx: -8 + (Math.random() - 0.5) * 12,
        baseVy: 6 + Math.random() * 12,
        size: 1.2 + Math.random() * 1.8,
        color: currentBiome === 'BIOME_B' ? 'rgba(254, 205, 211, 0.45)' : 'rgba(255, 255, 255, 0.50)',
        seed: Math.random() * 100,
        life: 5.0 + Math.random() * 3.0,
        maxLife: 8.0
      });
    }

    for (let i = this.bgAmbientParticles.length - 1; i >= 0; i--) {
      const p = this.bgAmbientParticles[i];
      p.life -= dt;
      p.x += (p.baseVx + Math.sin(p.y * 0.03 + p.seed) * 8) * dt;
      p.y += p.baseVy * dt;
      if (p.life <= 0 || p.y > camera.viewportHeight + 40) {
        this.bgAmbientParticles.splice(i, 1);
      }
    }

    // 2. Midground Powdered Sugar Motes & Twinkles (World space depth)
    while (this.midAmbientParticles.length < 14) {
      const mx = camera.x + Math.random() * (camera.viewportWidth + 140) - 70;
      const my = Math.random() * (camera.viewportHeight + 20);
      this.midAmbientParticles.push({
        x: mx,
        y: my,
        baseVx: -15 + (Math.random() - 0.5) * 16,
        baseVy: 10 + Math.random() * 18,
        size: 2.0 + Math.random() * 2.5,
        color: currentBiome === 'BIOME_B' ? 'rgba(251, 113, 133, 0.70)' : (currentBiome === 'BIOME_C' ? 'rgba(233, 213, 255, 0.75)' : 'rgba(255, 255, 255, 0.75)'),
        isDiamond: Math.random() < 0.22,
        seed: Math.random() * 100,
        life: 4.5 + Math.random() * 2.5,
        maxLife: 7.0
      });
    }

    for (let i = this.midAmbientParticles.length - 1; i >= 0; i--) {
      const p = this.midAmbientParticles[i];
      p.life -= dt;
      p.x += (p.baseVx + Math.sin(p.y * 0.04 + p.seed) * 14) * dt;
      p.y += p.baseVy * dt;
      if (p.life <= 0 || p.y > 600 || p.x < camera.x - 120 || p.x > camera.x + camera.viewportWidth + 120) {
        this.midAmbientParticles.splice(i, 1);
      }
    }

    // 3. Foreground Camera Lens Sugar Bokeh (Close to lens, fast parallax, out-of-focus aura)
    while (this.fgAmbientParticles.length < 6) {
      const fx = Math.random() * (camera.viewportWidth + 80) - 40;
      const fy = -20 + Math.random() * (camera.viewportHeight + 40);
      this.fgAmbientParticles.push({
        x: fx,
        y: fy,
        baseVx: -28 + (Math.random() - 0.5) * 22,
        baseVy: 16 + Math.random() * 26,
        size: 5.0 + Math.random() * 4.5,
        color: 'rgba(255, 255, 255, 0.85)',
        seed: Math.random() * 100,
        life: 3.5 + Math.random() * 2.0,
        maxLife: 5.5
      });
    }

    for (let i = this.fgAmbientParticles.length - 1; i >= 0; i--) {
      const p = this.fgAmbientParticles[i];
      p.life -= dt;
      p.x += (p.baseVx + Math.sin(p.y * 0.02 + p.seed) * 20) * dt;
      p.y += p.baseVy * dt;
      if (p.life <= 0 || p.y > camera.viewportHeight + 50 || p.x < -60 || p.x > camera.viewportWidth + 60) {
        this.fgAmbientParticles.splice(i, 1);
      }
    }
  }

  // --- CRUMBLE EFFECT ON PLATFORM IMPACT ---
  emitCrumble(x, y, count = 10, color = '#FDE68A') {
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        type: 'crumble',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle)) * speed - 40,
        gravity: 420,
        drag: 0.94,
        size: 3 + Math.random() * 4,
        color,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8
      });
    }
  }

  // --- BOUNCY EXPLOSION SHARDS WITH GROUND REBOUND ---
  emitBouncyShards(x, y, count = 16) {
    const colors = ['#FF5A9E', '#5CD86E', '#52C4FF', '#FFD633', '#C084FC'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 260;
      this.particles.push({
        type: 'bouncy_shard',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 120,
        gravity: 520,
        rebound: 0.55,
        drag: 0.96,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 16,
        life: 0.9 + Math.random() * 0.5,
        maxLife: 1.4
      });
    }
  }

  // --- INCANDESCENT MOLTEN CARAMEL SPARKS (Explosions with Volumetric Heat) ---
  emitIncandescentCaramelSparks(x, y, count = 16) {
    const fireColors = ['#FFFFFF', '#FEF08A', '#FDE047', '#F59E0B', '#EA580C', '#E11D48'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 260;
      this.particles.push({
        type: 'incandescent_spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        gravity: 420,
        drag: 0.95,
        size: 3.5 + Math.random() * 4,
        color: fireColors[Math.floor(Math.random() * fireColors.length)],
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8
      });
    }
  }

  emitExplosionSprite(x, y, maxScale = 1.35) {
    this.particles.push({
      type: 'explosion_sprite',
      x,
      y,
      scale: 0.2,
      maxScale,
      life: 0.46,
      maxLife: 0.46
    });
    this.emitIncandescentCaramelSparks(x, y, 16);
    this.emitSugarSmoke(x, y, 10, '#FBCFE8');
    this.emitSugarSmoke(x, y - 10, 6, '#FFF1F2');
    this.emitBouncyShards(x, y, 14);
  }

  emitConfetti(x, y, count = 30) {
    const colors = ['#FF77B0', '#70D6FF', '#FFDF6D', '#7AE582', '#C084FC', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 120 + Math.random() * 260;
      this.particles.push({
        type: 'confetti',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 150,
        gravity: 380,
        drag: 0.98,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 6 + Math.random() * 4,
        height: 4 + Math.random() * 3,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1.2 + Math.random() * 0.8,
        maxLife: 2.0
      });
    }
  }

  emitSugarSmoke(x, y, count = 8, color = 'rgba(255, 255, 255, 0.85)') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 60;
      this.particles.push({
        type: 'smoke',
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        gravity: -20,
        drag: 0.94,
        radius: 6 + Math.random() * 8,
        growth: 12,
        color,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7
      });
    }
  }

  emitSodaBubbles(x, y, count = 25) {
    const colors = ['#38BDF8', '#70D6FF', '#99F6E4', '#FFFFFF', '#FF77B0'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.5;
      const speed = 80 + Math.random() * 220;
      this.particles.push({
        type: 'bubble',
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 280,
        drag: 0.97,
        radius: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.6 + Math.random() * 0.5,
        maxLife: 1.1
      });
    }
  }

  emitSyrupSplash(x, y, count = 20, color = '#EF4444') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 200;
      this.particles.push({
        type: 'syrup',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        gravity: 420,
        drag: 0.96,
        radius: 4 + Math.random() * 6,
        color,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0
      });
    }
  }

  emitSparkles(x, y, count = 12, color = '#FFDF6D') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        type: 'sparkle',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 100,
        drag: 0.95,
        size: 8 + Math.random() * 6,
        color,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8
      });
    }
  }

  // --- CANDY WRAPPER & BULLET CASINGS EJECTION (Twisted Wrappers & Popping Shells) ---
  emitCandyWrapperCasing(x, y, facing = 1) {
    const speedX = -facing * (85 + Math.random() * 95);
    const speedY = -160 - Math.random() * 110;
    const colors = ['#F43F5E', '#38BDF8', '#8B5CF6', '#10B981', '#F59E0B'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    this.particles.push({
      type: 'candy_wrapper',
      x: x - facing * 10,
      y: y - 4,
      vx: speedX,
      vy: speedY,
      gravity: 640,
      rebound: 0.58,
      drag: 0.97,
      width: 7,
      height: 3.5,
      rot: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 28,
      color: chosenColor,
      bounces: 0,
      life: 1.3,
      maxLife: 1.3
    });
  }

  emitBulletCasing(x, y, facing = 1) {
    this.emitCandyWrapperCasing(x, y, facing);
  }

  // --- DENSE VOLUMETRIC MUZZLE SMOKE (Cotton-Candy Puffs) ---
  emitDenseMuzzleSmoke(x, y, facing = 1, count = 7) {
    const smokeColors = [
      'rgba(255, 255, 255, 0.95)',
      'rgba(254, 205, 211, 0.92)',
      'rgba(253, 230, 138, 0.88)',
      'rgba(244, 114, 182, 0.82)'
    ];

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * 0.8;
      const speed = 40 + Math.random() * 90;
      const forwardVx = facing * Math.cos(angle) * speed;
      const upwardVy = Math.sin(angle) * speed - 35 - Math.random() * 40;

      this.particles.push({
        type: 'dense_smoke',
        x: x + facing * (4 + i * 2) + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: forwardVx,
        vy: upwardVy,
        gravity: -35, // Rises gently like sweet steam
        drag: 0.90,
        radius: 6 + Math.random() * 6,
        growth: 24, // Expands rapidly
        color: smokeColors[Math.floor(Math.random() * smokeColors.length)],
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8
      });
    }
  }

  // --- FLYING HELMET / HAT POPPING OFF ON HIT OR DEFEAT ---
  emitFlyingHelmet(x, y, facing = 1, type = 'knight') {
    const speedX = -facing * (70 + Math.random() * 85);
    const speedY = -210 - Math.random() * 90;
    this.particles.push({
      type: 'flying_helmet',
      x,
      y: y - 10,
      vx: speedX,
      vy: speedY,
      gravity: 620,
      rebound: 0.52,
      drag: 0.98,
      width: 14,
      height: 12,
      rot: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 24,
      helmetType: type,
      color: type === 'guard' ? '#DC2626' : (type === 'soldier' ? '#475569' : '#F59E0B'),
      bounces: 0,
      life: 1.4,
      maxLife: 1.4
    });
  }

  // --- SKID DUST ON DIRECTION REVERSAL ---
  emitSkidDust(x, y, facing = 1) {
    for (let i = 0; i < 5; i++) {
      const speed = 35 + Math.random() * 65;
      this.particles.push({
        type: 'skid_dust',
        x: x + (Math.random() - 0.5) * 8,
        y: y + 2,
        vx: -facing * speed + (Math.random() - 0.5) * 20,
        vy: -18 - Math.random() * 30,
        gravity: 60,
        drag: 0.92,
        radius: 4.5 + Math.random() * 5,
        growth: 10,
        color: 'rgba(255, 241, 242, 0.90)',
        life: 0.38 + Math.random() * 0.2,
        maxLife: 0.58
      });
    }
    this.emitSparkles(x, y, 2, '#FEF08A');
  }

  // --- FOOTSTEP SUGAR DUST ON RUNNING ---
  emitFootstepSugarDust(x, y, facing = 1) {
    const puffColors = ['rgba(255, 255, 255, 0.85)', 'rgba(254, 205, 211, 0.75)', 'rgba(254, 240, 138, 0.75)'];
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        type: 'skid_dust',
        x: x - facing * (8 + Math.random() * 8),
        y: y + (Math.random() - 0.5) * 4,
        vx: -facing * (18 + Math.random() * 28),
        vy: -10 - Math.random() * 16,
        gravity: 45,
        drag: 0.90,
        radius: 3.2 + Math.random() * 3.5,
        growth: 6,
        color: puffColors[Math.floor(Math.random() * puffColors.length)],
        life: 0.25 + Math.random() * 0.15,
        maxLife: 0.4
      });
    }
  }

  // --- JUMP LAUNCH SUGAR BLAST RING ---
  emitJumpLaunchPuff(x, y) {
    const puffColors = ['rgba(255, 255, 255, 0.95)', 'rgba(254, 205, 211, 0.85)', 'rgba(219, 234, 254, 0.85)'];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI + (i / 5) * Math.PI;
      const speed = 40 + Math.random() * 70;
      this.particles.push({
        type: 'skid_dust',
        x: x + (Math.random() - 0.5) * 14,
        y: y + 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.4,
        gravity: 30,
        drag: 0.91,
        radius: 4.5 + Math.random() * 4,
        growth: 9,
        color: puffColors[i % puffColors.length],
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.55
      });
    }
    this.emitSparkles(x, y, 4, '#FDE047');
  }

  // --- HEAVY LANDING IMPACT RADIAL SHOCKWAVE ---
  emitLandingImpactDust(x, y) {
    for (let dir of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const speed = 50 + Math.random() * 70;
        this.particles.push({
          type: 'skid_dust',
          x: x + dir * (4 + i * 2),
          y: y + 2,
          vx: dir * speed,
          vy: -12 - Math.random() * 22,
          gravity: 50,
          drag: 0.88,
          radius: 5 + Math.random() * 4,
          growth: 12,
          color: 'rgba(255, 255, 255, 0.92)',
          life: 0.32 + Math.random() * 0.18,
          maxLife: 0.5
        });
      }
    }
    this.emitSparkles(x, y, 6, '#FEF08A');
  }

  // --- JUICY GUMMY DEBRIS ON ENEMY DEFEAT ---
  emitGummyDebris(x, y, color = '#EF4444', count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 110 + Math.random() * 240;
      this.particles.push({
        type: 'gummy_debris',
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        gravity: 500,
        rebound: 0.65,
        drag: 0.97,
        size: 5 + Math.random() * 5,
        color,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 18,
        life: 0.9 + Math.random() * 0.4,
        maxLife: 1.3
      });
    }
    this.emitSparkles(x, y, 6, '#FFFFFF');
  }

  // --- HIT IMPACT STARBURST GLINT ---
  emitHitImpactFlash(x, y) {
    this.particles.push({
      type: 'impact_glint',
      x,
      y,
      size: 14,
      life: 0.12,
      maxLife: 0.12
    });
    this.emitSparkles(x, y, 3, '#FEF08A');
  }

  emitCandyShards(x, y, count = 15) {
    const colors = ['#FF5A9E', '#5CD86E', '#52C4FF', '#FFD633', '#C084FC'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 240;
      this.particles.push({
        type: 'shard',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 120,
        gravity: 450,
        drag: 0.97,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 16,
        life: 0.7 + Math.random() * 0.5,
        maxLife: 1.2
      });
    }
  }

  // --- GLASS SUGAR SHATTER SHARDS (Sharp Crystalline Glaze Fragments) ---
  emitGlassCandyShards(x, y, count = 22) {
    const iceColors = ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 280;
      this.particles.push({
        type: 'glass_shard',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 110,
        gravity: 520,
        rebound: 0.65,
        drag: 0.98,
        size: 4 + Math.random() * 6,
        color: iceColors[Math.floor(Math.random() * iceColors.length)],
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 32,
        bounces: 0,
        life: 0.9 + Math.random() * 0.5,
        maxLife: 1.4
      });
    }
    this.emitSparkles(x, y, 12, '#FFFFFF');
  }

  // --- BOILING VISCOUS SYRUP PUDDLE (Melt Liquefaction Death) ---
  emitSyrupBoilPool(x, y, color = '#E11D48') {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        type: 'syrup_bubble',
        x: x + (Math.random() - 0.5) * 32,
        y: y + 2 + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 20,
        vy: -25 - Math.random() * 35,
        gravity: -10,
        drag: 0.92,
        radius: 3 + Math.random() * 5,
        growth: 6,
        color,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0
      });
    }
    this.emitSugarSmoke(x, y - 6, 6, '#FBCFE8');
  }

  // --- FLYING WAFER BITE CHUNKS & BISCUIT DEBRIS (Reactive Environment) ---
  emitWaferBiteChunks(x, y, count = 8) {
    const waferColors = ['#FEF3C7', '#F59E0B', '#B45309', '#FFF1F2', '#FB7185', '#78350F'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const speed = 70 + Math.random() * 180;
      this.particles.push({
        type: 'bouncy_shard',
        x,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 520,
        rebound: 0.55,
        drag: 0.96,
        size: 4 + Math.random() * 5,
        color: waferColors[Math.floor(Math.random() * waferColors.length)],
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 28,
        bounces: 0,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 1.3
      });
    }
    this.emitCrumble(x, y, 6, '#FEF3C7');
    this.emitSparkles(x, y, 3, '#FFFFFF');
  }

  // --- TERRAIN / PLATFORM BULLET IMPACT & CHIPPING ---
  emitTerrainImpact(x, y, surfaceType = 'ground') {
    let color1 = '#4ADE80';
    let color2 = '#FEF08A';
    if (surfaceType === 'wafer' || surfaceType === 'sinking' || surfaceType === 'moving') {
      color1 = '#F59E0B';
      color2 = '#FEF3C7';
    } else if (surfaceType === 'candy_cane') {
      color1 = '#EF4444';
      color2 = '#FFFFFF';
    } else if (surfaceType === 'bounce') {
      color1 = '#FB7185';
      color2 = '#BE123C';
    }

    // Impact sparks and dust
    for (let i = 0; i < 4; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        type: 'bouncy_shard',
        x,
        y: y - 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 480,
        rebound: 0.45,
        drag: 0.95,
        size: 3 + Math.random() * 3,
        color: (i % 2 === 0) ? color1 : color2,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 20,
        bounces: 0,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8
      });
    }
    this.emitSugarSmoke(x, y - 4, 3, color2);
  }

  // --- MEGA CHOCOLATE BARREL EXPLOSION (Staves, Syrup, Cocoa Shockwave) ---
  emitChocolateBarrelExplosion(x, y) {
    this.emitShockwave(x, y, 95, 'rgba(120, 53, 15, 0.85)');
    this.emitExplosionSprite(x, y, 1.25);
    this.emitSyrupSplash(x, y, 26, '#451A03');
    this.emitCandyShards(x, y, 18);
    this.emitGummyDebris(x, y, '#78350F', 16);
    this.emitSugarSmoke(x, y, 10, '#92400E');
    this.emitSparkles(x, y, 14, '#FDE047');

    // Flying wooden/chocolate barrel stave fragments
    for (let i = 0; i < 7; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 110 + Math.random() * 190;
      this.particles.push({
        type: 'bouncy_shard',
        x,
        y: y - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 580,
        rebound: 0.48,
        drag: 0.97,
        size: 7 + Math.random() * 7,
        color: '#451A03',
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 22,
        bounces: 0,
        life: 1.1 + Math.random() * 0.4,
        maxLife: 1.5
      });
    }
  }

  emitShockwave(x, y, maxRadius = 80, color = 'rgba(255, 119, 176, 0.8)') {
    this.particles.push({
      type: 'shockwave',
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      life: 0.35,
      maxLife: 0.35
    });
  }

  update(dt, platforms = []) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.type === 'explosion_sprite') {
        const progress = 1 - p.life / p.maxLife;
        p.scale = 0.3 + progress * (p.maxScale - 0.3);
        continue;
      }

      if (p.type === 'shockwave') {
        const progress = 1 - p.life / p.maxLife;
        p.radius = 5 + progress * (p.maxRadius - 5);
        continue;
      }

      p.vx *= Math.pow(p.drag, dt * 60);
      p.vy *= Math.pow(p.drag, dt * 60);
      p.vy += p.gravity * dt;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Ground rebound collision for bouncy shards, casings, candy wrappers, flying helmets, glass shards, and gummy debris
      if ((p.type === 'bouncy_shard' || p.type === 'gummy_debris' || p.type === 'casing' || p.type === 'candy_wrapper' || p.type === 'flying_helmet' || p.type === 'glass_shard') && p.y >= 455 && p.vy > 0) {
        p.y = 455;
        p.vy = -p.vy * p.rebound;
        p.vx *= 0.65;
        p.bounces = (p.bounces || 0) + 1;
        if (p.bounces > 4) {
          p.vy = 0;
          p.vx = 0;
          p.rotSpeed = 0;
        }
      }

      if (p.rotSpeed) {
        p.rot += p.rotSpeed * dt;
      }
      if (p.growth) {
        p.radius += p.growth * dt;
      }
    }

    if (this.particles.length > this.maxParticles) {
      this.particles.splice(0, this.particles.length - this.maxParticles);
    }
  }

  // --- 1. DRAW BACKGROUND POWDERED SUGAR PARALLAX LAYER ---
  drawAmbientBackground(ctx, camera) {
    for (const p of this.bgAmbientParticles) {
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      const twinkle = Math.sin(p.life * 4 + p.seed) * 0.3 + 0.7;

      ctx.save();
      ctx.globalAlpha = alpha * twinkle * 0.65;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - camera.x * 0.35, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- 2. DRAW FOREGROUND CAMERA LENS BOKEH POWDERED SUGAR LAYER ---
  drawAmbientForeground(ctx, camera, viewportWidth, viewportHeight) {
    for (const p of this.fgAmbientParticles) {
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      const twinkle = Math.sin(p.life * 5 + p.seed) * 0.25 + 0.75;

      ctx.save();
      ctx.globalAlpha = alpha * twinkle * 0.85;

      // Soft Camera Lens Out-Of-Focus Bokeh Flare
      const bokehGrad = ctx.createRadialGradient(p.x, p.y, p.size * 0.15, p.x, p.y, p.size);
      bokehGrad.addColorStop(0, '#FFFFFF');
      bokehGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.75)');
      bokehGrad.addColorStop(0.7, 'rgba(254, 205, 211, 0.35)');
      bokehGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = bokehGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  draw(ctx) {
    // 1. Draw Midground Sugar Particles
    for (const mp of this.midAmbientParticles) {
      const alpha = Math.max(0, Math.min(1, mp.life / mp.maxLife));
      const twinkle = Math.sin(mp.life * 6 + mp.seed) * 0.35 + 0.65;
      ctx.save();
      ctx.globalAlpha = alpha * twinkle * 0.75;

      if (mp.isDiamond) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(mp.x, mp.y - mp.size * 1.5);
        ctx.lineTo(mp.x + mp.size * 0.6, mp.y);
        ctx.lineTo(mp.x, mp.y + mp.size * 1.5);
        ctx.lineTo(mp.x - mp.size * 0.6, mp.y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(mp.x, mp.y, mp.size, 0, Math.PI * 2);
        ctx.fillStyle = mp.color;
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. Draw Dynamic Particles
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'explosion_sprite') {
        // --- VOLUMETRIC EXPANDING COTTON CANDY EXPLOSION CLOUD & INCANDESCENT CARAMEL CORE ---
        const progress = 1 - (p.life / p.maxLife);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.scale, p.scale);

        // 1. Expanding Soft Cotton Candy Pink Aura
        ctx.fillStyle = 'rgba(244, 114, 182, 0.38)';
        ctx.beginPath();
        ctx.arc(0, 0, 58, 0, Math.PI * 2);
        ctx.fill();

        // 2. 7 Multi-lobed Billowing Cumulus Cotton Candy Puffs
        const lobes = 7;
        for (let l = 0; l < lobes; l++) {
          const lAngle = (l * Math.PI * 2) / lobes + progress * 0.6;
          const lDist = 16 + progress * 26;
          const lx = Math.cos(lAngle) * lDist;
          const ly = Math.sin(lAngle) * lDist;
          const lRadius = 18 + (l % 3) * 5;

          // Outer fluffy cotton candy body
          const cloudGrad = ctx.createRadialGradient(lx - 4, ly - 4, 2, lx, ly, lRadius);
          cloudGrad.addColorStop(0, '#FFF1F2');
          cloudGrad.addColorStop(0.35, '#FCE7F3');
          cloudGrad.addColorStop(0.75, '#F472B6');
          cloudGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.arc(lx, ly, lRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Incandescent Molten Sugar / Blazing Caramel Fire Core
        if (progress < 0.75) {
          const coreAlpha = 1 - (progress / 0.75);
          ctx.save();
          ctx.globalAlpha = coreAlpha;

          const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 36);
          coreGrad.addColorStop(0, '#FFFFFF');
          coreGrad.addColorStop(0.25, '#FEF08A');
          coreGrad.addColorStop(0.55, '#F59E0B');
          coreGrad.addColorStop(0.85, '#EA580C');
          coreGrad.addColorStop(1, 'rgba(225, 29, 72, 0)');
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 34, 0, Math.PI * 2);
          ctx.fill();

          // 4. Incandescent 8-pointed Caramel Starburst Glints
          ctx.fillStyle = '#FFFFFF';
          const starS = (1 - progress) * 28;
          for (let st = 0; st < 2; st++) {
            ctx.save();
            ctx.rotate(st * Math.PI * 0.25 + progress * 2.2);
            ctx.beginPath();
            ctx.moveTo(0, -starS);
            ctx.lineTo(starS * 0.22, 0);
            ctx.lineTo(0, starS);
            ctx.lineTo(-starS * 0.22, 0);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(-starS, 0);
            ctx.lineTo(0, starS * 0.22);
            ctx.lineTo(starS, 0);
            ctx.lineTo(0, -starS * 0.22);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
          ctx.restore();
        }

        ctx.restore();
      } else if (p.type === 'incandescent_spark') {
        // Incandescent molten caramel spark with bright glowing core
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-p.size * 0.2, -p.size * 0.2, p.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'flying_helmet') {
        // 3D Flying Knight/Soldier Sugar Helmet with Visor & Plume
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        // Helmet Dome
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, 7, Math.PI, 0, false);
        ctx.lineTo(7, 4);
        ctx.lineTo(-7, 4);
        ctx.closePath();
        ctx.fill();

        // Metallic / Sugar Specular Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(-2, -3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Visor slit
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-5, 0, 10, 2);

        // Feather Plume on top
        ctx.fillStyle = '#EC4899';
        ctx.beginPath();
        ctx.ellipse(0, -9, 3, 5.5, -0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'candy_wrapper' || p.type === 'casing') {
        // 3D Sweet Candy Wrapper & Cylindrical Shell
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        // Twisted Wrapper Flaps / Cellophane Wings on Ends
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        // Left twisted wing
        ctx.moveTo(-p.width / 2, 0);
        ctx.lineTo(-p.width / 2 - 3.5, -p.height * 0.9);
        ctx.lineTo(-p.width / 2 - 3.5, p.height * 0.9);
        ctx.closePath();
        ctx.fill();
        // Right twisted wing
        ctx.beginPath();
        ctx.moveTo(p.width / 2, 0);
        ctx.lineTo(p.width / 2 + 3.5, -p.height * 0.9);
        ctx.lineTo(p.width / 2 + 3.5, p.height * 0.9);
        ctx.closePath();
        ctx.fill();

        // Candy Roll Body
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(-p.width / 2, -p.height / 2, p.width, p.height, 1.5);
        ctx.fill();

        // White Diagonal Swirl Striping
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(-p.width * 0.2, -p.height / 2, 2, p.height);

        // Cylindrical Specular Glint
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-p.width / 2 + 1, -p.height / 2, p.width - 2, 0.9);
      } else if (p.type === 'gummy_debris') {
        // Translucent Bouncy Gummy Bear Chunk with Specular Sheen
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(-p.size / 2, -p.size / 2, p.size, p.size, 2.5);
        ctx.fill();
        // Shiny jelly corner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(-p.size * 0.2, -p.size * 0.2, p.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'dense_smoke') {
        // Multi-layered Puffy Cotton-Candy Smoke Cloud
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        // Soft white inner core
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.2, p.y - p.radius * 0.2, p.radius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();
      } else if (p.type === 'skid_dust' || p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.type === 'impact_glint') {
        ctx.translate(p.x, p.y);
        ctx.fillStyle = '#FFFFFF';
        const s = p.size * (p.life / p.maxLife);
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.25, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.25, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-s, 0);
        ctx.lineTo(0, s * 0.25);
        ctx.lineTo(s, 0);
        ctx.lineTo(0, -s * 0.25);
        ctx.fill();
      } else if (p.type === 'crumble') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.type === 'glass_shard') {
        // Sharp translucent crystalline sugar glass shard
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.3);
        ctx.lineTo(p.size * 0.7, p.size * 0.7);
        ctx.lineTo(0, p.size * 0.3);
        ctx.lineTo(-p.size * 0.7, p.size * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, -p.size * 0.4, p.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'syrup_bubble') {
        // Viscous boiling syrup bubble
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.25, p.y - p.radius * 0.25, p.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'bouncy_shard' || p.type === 'shard') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.8, p.size * 0.8);
        ctx.lineTo(-p.size * 0.8, p.size * 0.5);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'confetti') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      } else if (p.type === 'bubble') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (p.type === 'syrup') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.type === 'sparkle') {
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();
      } else if (p.type === 'shockwave') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4 * alpha;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
    this.ambientParticles = [];
  }
}
