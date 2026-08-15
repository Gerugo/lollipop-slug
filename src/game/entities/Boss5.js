import { Projectile } from './Weapons.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Boss5 {
  constructor(options = {}) {
    this.x = options.x || 6700;
    this.y = options.y || 160;
    this.width = 140;
    this.height = 160;
    this.hp = options.hp || 1300;
    this.maxHp = this.hp;
    this.dead = false;
    this.name = 'MEDUSA EFERVESCENTE';
    this.title = 'MATRIARCA DE LA GASEOSA CORROSIVA';

    this.vx = 0;
    this.vy = 0;
    this.gravity = 0; // Floats/swims

    this.facing = -1;
    this.hurtTimer = 0;
    this.stateTimer = 0;
    this.attackTimer = 0;
    this.animTime = 0;

    // Phases: 1 (100%-65%), 2 (65%-30%), 3 (30%-0%)
    this.phase = 1;
    this.baseY = options.y || 160;
    this.state = 'FLOAT_SWEEP'; // 'FLOAT_SWEEP', 'DISCHARGE', 'BURBBLE_STORM', 'SUBMERGE_SURGE'

    this.arenaLeft = options.arenaLeft || 6200;
    this.arenaRight = options.arenaRight || 7100;
  }

  takeDamage(amount, particles, soundManager) {
    if (this.dead) return;

    this.hp -= amount;
    this.hurtTimer = 0.12;
    if (soundManager && soundManager.playEnemyHit) soundManager.playEnemyHit();

    if (particles) {
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 5);
      particles.emitSodaBubbles(this.x + this.width / 2, this.y + this.height / 2, 4);
    }

    // Phase transitions
    const hpRatio = this.hp / this.maxHp;
    if (hpRatio <= 0.30 && this.phase < 3) {
      this.phase = 3;
      this.state = 'BURBBLE_STORM';
      this.stateTimer = 0;
      if (particles) particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 25, '#EC4899');
    } else if (hpRatio <= 0.65 && this.phase < 2) {
      this.phase = 2;
      this.state = 'SUBMERGE_SURGE';
      this.stateTimer = 0;
      if (particles) particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 20, '#06B6D4');
    }

    if (this.hp <= 0) {
      this.destroy(particles, soundManager);
    }
  }

  destroy(particles, soundManager) {
    this.dead = true;
    if (soundManager && soundManager.playExplosion) soundManager.playExplosion();

    if (particles) {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      particles.emitExplosionSprite(cx, cy, 2.5);
      particles.emitSyrupSplash(cx, cy, 35, '#06B6D4');
      particles.emitSodaBubbles(cx, cy, 40);
      particles.emitSparkles(cx, cy, 30, '#FDE047');
      particles.emitSugarSmoke(cx, cy, 18, '#EC4899');
    }
  }

  update(dt, player, platforms, enemyProjectiles, enemies, particles, soundManager, camera) {
    if (this.dead) return;

    this.animTime += dt;
    this.stateTimer += dt;
    this.attackTimer += dt;

    if (this.hurtTimer > 0) this.hurtTimer -= dt;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const px = player ? player.x + player.width / 2 : cx;
    const py = player ? player.y + player.height / 2 : cy;

    this.facing = px < cx ? -1 : 1;

    // Smooth sinusoidal floating
    const floatOffset = Math.sin(this.animTime * 2.5) * 40;

    // PHASE 1: FLOAT & DISCHARGE BUBBLES
    if (this.phase === 1) {
      this.y = this.baseY + floatOffset;
      this.x += Math.cos(this.animTime * 1.2) * 80 * dt;

      if (this.attackTimer >= 2.2) {
        this.attackTimer = 0;
        // Fire 3 spreading bubbles
        [-0.3, 0, 0.3].forEach(offset => {
          const angle = Math.atan2(py - cy, px - cx) + offset;
          enemyProjectiles.push(
            new Projectile({
              x: cx,
              y: cy + 30,
              vx: Math.cos(angle) * 220,
              vy: Math.sin(angle) * 220,
              type: 'BUBBLE',
              damage: 1,
              isPlayer: false
            })
          );
        });
        if (soundManager && soundManager.playSodaGrenadeFizz) soundManager.playSodaGrenadeFizz();
        if (particles) particles.emitSodaBubbles(cx, cy + 30, 8);
      }
    }
    // PHASE 2: SUBMERGE, SURGE & ELECTRIC BOLTS
    else if (this.phase === 2) {
      this.y = this.baseY + 30 + floatOffset;
      this.x += (px - cx) * 0.4 * dt;

      if (this.attackTimer >= 2.0) {
        this.attackTimer = 0;
        // 4-way electric discharge
        [-135, -45, 45, 135].forEach(deg => {
          const rad = (deg * Math.PI) / 180;
          enemyProjectiles.push(
            new Projectile({
              x: cx,
              y: cy + 20,
              vx: Math.cos(rad) * 250,
              vy: Math.sin(rad) * 250,
              type: 'EEL_BOLT',
              damage: 1,
              isPlayer: false
            })
          );
        });
        if (soundManager && soundManager.playSodaGrenadeFizz) soundManager.playSodaGrenadeFizz();
        if (particles) particles.emitSparkles(cx, cy + 20, 16, '#FDE047');
      }
    }
    // PHASE 3: CORROSIVE BUBBLE STORM (SPIRAL BARRAGE)
    else if (this.phase === 3) {
      this.y = this.baseY - 20 + Math.sin(this.animTime * 4) * 25;
      this.x += Math.sin(this.animTime * 2.2) * 110 * dt;

      if (this.attackTimer >= 1.4) {
        this.attackTimer = 0;
        // 6-way spiral burst
        const baseAngle = this.animTime * 3;
        for (let i = 0; i < 6; i++) {
          const angle = baseAngle + (i * Math.PI * 2) / 6;
          enemyProjectiles.push(
            new Projectile({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * 230,
              vy: Math.sin(angle) * 230,
              type: 'BUBBLE',
              damage: 1,
              isPlayer: false
            })
          );
        }
        if (soundManager && soundManager.playSodaGrenadeFizz) soundManager.playSodaGrenadeFizz();
        if (particles) {
          particles.emitSodaBubbles(cx, cy, 14);
          particles.emitSparkles(cx, cy, 12, '#EC4899');
        }
      }
    }

    // Keep within arena boundaries
    this.x = Math.max(this.arenaLeft + 50, Math.min(this.arenaRight - this.width - 50, this.x));
  }

  draw(ctx) {
    if (this.dead) return;

    ctx.save();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // Glowing electric bubble aura
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 85, 0, Math.PI * 2);
    const auraGrad = ctx.createRadialGradient(cx, cy - 10, 30, cx, cy - 10, 85);
    auraGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    auraGrad.addColorStop(0.7, this.phase === 3 ? 'rgba(236, 72, 153, 0.2)' : 'rgba(14, 165, 233, 0.15)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.fill();

    ctx.translate(cx, cy);

    if (this.hurtTimer > 0) {
      ctx.filter = 'brightness(2.6) contrast(1.3)';
    }

    // Breathing pulsation
    const pulse = 1 + Math.sin(this.animTime * 4) * 0.05;
    ctx.scale(this.facing * pulse, pulse);

    const bossSprite = imageLoader.getImage('boss5');
    if (bossSprite && bossSprite.complete && bossSprite.naturalWidth > 0) {
      ctx.drawImage(bossSprite, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      // Fallback
      ctx.beginPath();
      ctx.arc(0, -20, 50, Math.PI, 0);
      ctx.fillStyle = '#06B6D4';
      ctx.fill();
    }

    ctx.restore();
  }
}
