import { imageLoader } from '../engine/ImageLoader.js';

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.ambientParticles = [];
    this.maxParticles = 600;
    this.ambientTimer = 0;
  }

  // --- AMBIENT PARTICLES (Sugar Dust & Sparks) ---
  updateAmbient(dt, camera, currentBiome) {
    this.ambientTimer += dt;
    if (this.ambientTimer >= 0.08 && this.ambientParticles.length < 50) {
      this.ambientTimer = 0;
      const screenX = camera.x + Math.random() * (camera.viewportWidth + 100);
      const screenY = Math.random() * camera.viewportHeight;

      let color = 'rgba(255, 255, 255, 0.7)';
      let size = 2 + Math.random() * 3;
      let vy = 15 + Math.random() * 25;

      if (currentBiome === 'BIOME_B') {
        color = 'rgba(251, 113, 133, 0.65)'; // Syrup pink dew
        size = 3 + Math.random() * 4;
      } else if (currentBiome === 'BIOME_C') {
        color = 'rgba(216, 180, 254, 0.7)'; // Factory neon glow
        size = 2 + Math.random() * 3;
      }

      this.ambientParticles.push({
        x: screenX,
        y: screenY,
        vx: 15 + Math.sin(screenY * 0.05) * 20,
        vy: vy,
        size,
        color,
        life: 4.0,
        maxLife: 4.0
      });
    }

    for (let i = this.ambientParticles.length - 1; i >= 0; i--) {
      const p = this.ambientParticles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0 || p.x > camera.x + camera.viewportWidth + 150) {
        this.ambientParticles.splice(i, 1);
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

  emitExplosionSprite(x, y, maxScale = 1.25) {
    this.particles.push({
      type: 'explosion_sprite',
      x,
      y,
      scale: 0.3,
      maxScale,
      life: 0.38,
      maxLife: 0.38
    });
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

  // --- BULLET CASINGS EJECTION (Popping & Bouncing Brass Shells) ---
  emitBulletCasing(x, y, facing = 1) {
    const angle = (Math.random() - 0.5) * 0.4;
    const speedX = -facing * (70 + Math.random() * 80);
    const speedY = -140 - Math.random() * 90;
    this.particles.push({
      type: 'casing',
      x: x - facing * 8,
      y: y - 4,
      vx: speedX,
      vy: speedY,
      gravity: 620,
      rebound: 0.52,
      drag: 0.98,
      width: 5,
      height: 2.5,
      rot: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 26,
      color: '#FBBF24',
      bounces: 0,
      life: 1.1,
      maxLife: 1.1
    });
  }

  // --- SKID DUST ON DIRECTION REVERSAL ---
  emitSkidDust(x, y, facing = 1) {
    for (let i = 0; i < 4; i++) {
      const speed = 25 + Math.random() * 50;
      this.particles.push({
        type: 'skid_dust',
        x: x + (Math.random() - 0.5) * 8,
        y: y + 2,
        vx: -facing * speed + (Math.random() - 0.5) * 20,
        vy: -15 - Math.random() * 25,
        gravity: 60,
        drag: 0.92,
        radius: 4 + Math.random() * 5,
        growth: 8,
        color: 'rgba(255, 241, 242, 0.85)',
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.55
      });
    }
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

      // Ground rebound collision for bouncy shards, casings, and gummy debris
      if ((p.type === 'bouncy_shard' || p.type === 'gummy_debris' || p.type === 'casing') && p.y >= 455 && p.vy > 0) {
        p.y = 455;
        p.vy = -p.vy * p.rebound;
        p.vx *= 0.65;
        p.bounces = (p.bounces || 0) + 1;
        if (p.bounces > 3) {
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

  draw(ctx) {
    // 1. Draw Ambient Particles
    for (const ap of this.ambientParticles) {
      const alpha = Math.max(0, Math.min(1, ap.life / ap.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha * 0.75;
      ctx.beginPath();
      ctx.arc(ap.x, ap.y, ap.size, 0, Math.PI * 2);
      ctx.fillStyle = ap.color;
      ctx.fill();
      ctx.restore();
    }

    // 2. Draw Dynamic Particles
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'explosion_sprite') {
        const expImg = imageLoader.getImage('explosion');
        ctx.translate(p.x, p.y);
        ctx.scale(p.scale, p.scale);

        if (expImg && expImg.complete && expImg.naturalWidth > 0) {
          const w = 100;
          const h = 100;
          ctx.drawImage(expImg, -w / 2, -h / 2, w, h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, 40, 0, Math.PI * 2);
          ctx.fillStyle = '#EF4444';
          ctx.fill();
        }
      } else if (p.type === 'casing') {
        // Brass/Golden Bullet Casing
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(-p.width / 2 + 1, -p.height / 2, p.width - 2, 1);
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
