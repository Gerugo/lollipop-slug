import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Destructible {
  constructor(options) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 46;
    this.height = options.height || 58;
    this.hp = options.hp || 45;
    this.maxHp = this.hp;
    this.dead = false;
    this.hurtTimer = 0;
    this.wobble = 0;
    this.wobblePhase = 0;
    this.animTime = Math.random() * 5;
    this.dropType = options.dropType || 'ESTRELLA';
  }

  takeDamage(amount, particles, soundManager, drops, enemies = [], otherDestructibles = [], camera = null) {
    if (this.dead) return;

    this.hp -= amount;
    this.hurtTimer = 0.12;
    this.wobble = 0.35;
    this.wobblePhase = 0;
    soundManager.playEnemyPop();

    if (particles) {
      if (typeof particles.emitHitImpactFlash === 'function') {
        particles.emitHitImpactFlash(this.x + this.width / 2, this.y + this.height / 2);
      }
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 7);
      particles.emitSyrupSplash(this.x + this.width / 2, this.y + this.height / 2, 4, '#451A03');
    }

    if (this.hp <= 0) {
      this.destroy(particles, soundManager, drops, enemies, otherDestructibles, camera);
    }
  }

  destroy(particles, soundManager, drops, enemies = [], otherDestructibles = [], camera = null) {
    if (this.dead) return;
    this.dead = true;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    soundManager.playExplosion();

    if (particles) {
      if (typeof particles.emitChocolateBarrelExplosion === 'function') {
        particles.emitChocolateBarrelExplosion(cx, cy);
      } else {
        particles.emitExplosionSprite(cx, cy, 1.25);
        particles.emitSyrupSplash(cx, cy, 22, '#451A03');
        particles.emitCandyShards(cx, cy, 18);
        particles.emitSugarSmoke(cx, cy, 8, '#78350F');
      }
    }

    if (camera) {
      camera.shake(7, 0.22);
    }

    // --- AoE EXPLOSION & CHAIN REACTION (Damages nearby enemies and explodes adjacent barrels) ---
    if (enemies && enemies.length > 0) {
      for (const e of enemies) {
        if (!e.dead) {
          const ecx = e.x + e.width / 2;
          const ecy = e.y + e.height / 2;
          const dist = Math.hypot(ecx - cx, ecy - cy);
          if (dist < 135) {
            e.takeDamage(48, particles, soundManager, cx, 'EXPLODE');
          }
        }
      }
    }

    if (otherDestructibles && otherDestructibles.length > 0) {
      for (const d of otherDestructibles) {
        if (d !== this && !d.dead) {
          const dcx = d.x + d.width / 2;
          const dcy = d.y + d.height / 2;
          const dist = Math.hypot(dcx - cx, dcy - cy);
          if (dist < 115) {
            // Chain reaction explosion
            d.takeDamage(50, particles, soundManager, drops, enemies, otherDestructibles, camera);
          }
        }
      }
    }

    // Drop reward
    if (drops) {
      drops.push({
        x: cx - 13,
        y: this.y + 10,
        vx: (Math.random() - 0.5) * 70,
        vy: -220,
        type: this.dropType,
        collected: false,
        timer: 0,
        width: 26,
        height: 26
      });
    }
  }

  update(dt) {
    this.animTime += dt;
    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.wobble > 0.001) {
      this.wobblePhase += dt * 34;
      this.wobble *= Math.exp(-dt * 10);
    } else {
      this.wobble = 0;
    }
  }

  draw(ctx) {
    if (this.dead) return;

    ctx.save();
    const cx = this.x + this.width / 2;
    const bottomY = this.y + this.height;

    // Ground Shadow right under barrel base
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, bottomY + 1, 22, 5.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fill();
    ctx.restore();

    const damageRatio = Math.max(0, this.hp / this.maxHp);
    const isCritical = damageRatio < 0.33;

    // Critical unstable shivering
    const critShake = isCritical ? Math.sin(this.animTime * 35) * 2.2 : 0;
    const wobbleX = Math.sin(this.wobblePhase) * this.wobble * 9 + critShake;
    ctx.translate(cx + wobbleX, bottomY + 1);

    if (this.hurtTimer > 0) {
      ctx.filter = 'brightness(2.2)';
    }

    const obsSprite = imageLoader.getImage('bidon') || imageLoader.getImage('barricada');
    const renderW = 46;
    const renderH = 58;

    if (obsSprite && obsSprite.complete && obsSprite.naturalWidth > 0) {
      ctx.drawImage(obsSprite, -renderW / 2, -renderH, renderW, renderH);
    } else {
      // Procedural Volumetric Chocolate Barrel Body
      const bGrad = ctx.createLinearGradient(-renderW / 2, 0, renderW / 2, 0);
      bGrad.addColorStop(0, '#291002');
      bGrad.addColorStop(0.3, '#78350F');
      bGrad.addColorStop(0.7, '#92400E');
      bGrad.addColorStop(1, '#451A03');
      ctx.beginPath();
      ctx.roundRect(-renderW / 2, -renderH, renderW, renderH, 8);
      ctx.fillStyle = bGrad;
      ctx.fill();

      // Golden Caramel Hoops
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-renderW / 2, -renderH + 10, renderW, 4);
      ctx.fillRect(-renderW / 2, -renderH + renderH - 14, renderW, 4);
    }

    // --- PROGRESSIVE DAMAGE VISUAL STATE (Cracks, Leaking Syrup, Glowing Seams) ---
    if (damageRatio < 0.66) {
      ctx.save();
      // Stress Fracture Cracks
      ctx.strokeStyle = isCritical ? '#FEF08A' : '#1C0A00';
      ctx.lineWidth = isCritical ? 2.2 : 1.8;
      ctx.beginPath();
      ctx.moveTo(-renderW * 0.25, -renderH + 8);
      ctx.lineTo(-renderW * 0.1, -renderH + 24);
      ctx.lineTo(-renderW * 0.28, -renderH + 40);

      ctx.moveTo(renderW * 0.15, -renderH + 14);
      ctx.lineTo(renderW * 0.32, -renderH + 28);
      ctx.lineTo(renderW * 0.18, -renderH + 46);
      ctx.stroke();

      // Viscous Chocolate/Syrup Leaking Streaks
      ctx.fillStyle = '#451A03';
      ctx.beginPath();
      ctx.roundRect(-renderW * 0.14, -renderH + 24, 6, 18, 3);
      ctx.roundRect(renderW * 0.22, -renderH + 28, 5, 22, 2.5);
      ctx.fill();

      // Critical Fiery / Boiling Glow inside cracks
      if (isCritical) {
        ctx.fillStyle = '#EA580C';
        ctx.beginPath();
        ctx.arc(-renderW * 0.1, -renderH + 24, 3, 0, Math.PI * 2);
        ctx.arc(renderW * 0.32, -renderH + 28, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
  }
}
