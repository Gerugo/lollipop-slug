import { Projectile } from './Weapons.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Boss8 {
  constructor(options = {}) {
    this.x = options.x || 7200;
    this.y = options.y || 160;
    this.width = 170;
    this.height = 160;
    this.hp = options.hp || 1900;
    this.maxHp = this.hp;
    this.dead = false;
    this.name = 'DRAGÓN DE CARAMELO FUNDIDO';
    this.title = 'TERROR DE LA CALDERA VOLCÁNICA';

    this.vx = 0;
    this.vy = 0;
    this.gravity = 0;

    this.facing = -1;
    this.hurtTimer = 0;
    this.stateTimer = 0;
    this.attackTimer = 0;
    this.animTime = 0;

    // Phases: 1 (100%-65%), 2 (65%-30%), 3 (30%-0%)
    this.phase = 1;
    this.baseY = options.y || 160;
    this.state = 'FLY'; // 'FLY', 'SWOOP', 'INFERNO'

    this.arenaLeft = options.arenaLeft || 6700;
    this.arenaRight = options.arenaRight || 7750;
  }

  takeDamage(amount, particles, soundManager) {
    if (this.dead) return;

    this.hp -= amount;
    this.hurtTimer = 0.12;
    if (soundManager && soundManager.playEnemyHit) soundManager.playEnemyHit();

    if (particles) {
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 6);
      particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 4, '#EA580C');
      particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 4, '#FDE047');
    }

    const hpRatio = this.hp / this.maxHp;
    if (hpRatio <= 0.30 && this.phase < 3) {
      this.phase = 3;
      this.state = 'INFERNO';
      this.stateTimer = 0;
      if (particles) particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 90, '#EA580C');
    } else if (hpRatio <= 0.65 && this.phase < 2) {
      this.phase = 2;
      this.state = 'SWOOP';
      this.stateTimer = 0;
      if (particles) particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 70, '#F59E0B');
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
      particles.emitExplosionSprite(cx, cy, 2.8);
      particles.emitSyrupSplash(cx, cy, 45, '#EA580C');
      particles.emitCandyShards(cx, cy, 45);
      particles.emitSparkles(cx, cy, 40, '#FDE047');
      particles.emitSugarSmoke(cx, cy, 25, '#78350F');
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

    // PHASE 1: FLYING BARRAGE & FIREBALLS
    if (this.phase === 1) {
      this.y = this.baseY + Math.sin(this.animTime * 2.5) * 35;
      this.x += Math.cos(this.animTime * 1.5) * 110 * dt;

      if (this.attackTimer >= 2.0) {
        this.attackTimer = 0;
        // Fire 2 burning caramel balls towards player
        [-0.15, 0.15].forEach(offset => {
          const angle = Math.atan2(py - cy, px - cx) + offset;
          enemyProjectiles.push(
            new Projectile({
              x: cx + this.facing * 40,
              y: cy,
              vx: Math.cos(angle) * 260,
              vy: Math.sin(angle) * 260,
              type: 'FIRE_BALL',
              damage: 1,
              isPlayer: false
            })
          );
        });
        if (soundManager && soundManager.playExplosion) soundManager.playExplosion();
      }
    }
    // PHASE 2: LOW-ALTITUDE SWOOP & MOLTEN GEYSER VOLLEYS
    else if (this.phase === 2) {
      this.y = 240 + Math.sin(this.animTime * 3.8) * 120;
      this.x += Math.sin(this.animTime * 2) * 150 * dt;

      if (this.attackTimer >= 1.7) {
        this.attackTimer = 0;
        // 3 molten stingers
        [-0.25, 0, 0.25].forEach(offset => {
          const angle = Math.atan2(py - cy, px - cx) + offset;
          enemyProjectiles.push(
            new Projectile({
              x: cx,
              y: cy + 10,
              vx: Math.cos(angle) * 270,
              vy: Math.sin(angle) * 270,
              type: 'FIRE_STINGER',
              damage: 1,
              isPlayer: false
            })
          );
        });
        if (soundManager && soundManager.playSodaGrenadeFizz) soundManager.playSodaGrenadeFizz();
      }
    }
    // PHASE 3: MOLTEN INFERNO & RAINING CARAMEL METEORS
    else if (this.phase === 3) {
      this.y = this.baseY + Math.sin(this.animTime * 4.5) * 50;
      this.x += Math.sin(this.animTime * 2.8) * 140 * dt;

      if (this.attackTimer >= 1.4) {
        this.attackTimer = 0;
        // Rain 3 fireballs from the ceiling
        for (let i = 0; i < 3; i++) {
          const dropX = this.arenaLeft + 80 + Math.random() * (this.arenaRight - this.arenaLeft - 160);
          enemyProjectiles.push(
            new Projectile({
              x: dropX,
              y: 50,
              vx: (Math.random() - 0.5) * 80,
              vy: 300,
              type: 'FIRE_BALL',
              damage: 1,
              isPlayer: false
            })
          );
        }
        // Direct flamethrower cone to player
        enemyProjectiles.push(
          new Projectile({
            x: cx + this.facing * 45,
            y: cy,
            vx: this.facing * 300,
            vy: 30,
            type: 'FLAME_BLAST',
            damage: 1,
            isPlayer: false
          })
        );
        if (soundManager && soundManager.playExplosion) soundManager.playExplosion();
      }
    }

    // Keep within arena bounds
    this.x = Math.max(this.arenaLeft + 30, Math.min(this.arenaRight - this.width - 30, this.x));
  }

  draw(ctx) {
    if (this.dead) return;

    ctx.save();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.translate(cx, cy);

    // 1. GPU-Accelerated Molten Caramel Fiery Glow Aura
    if (this.phase === 3) {
      ctx.save();
      const aura = ctx.createRadialGradient(0, 0, 20, 0, 0, 105);
      aura.addColorStop(0, 'rgba(234, 88, 12, 0.45)');
      aura.addColorStop(0.55, 'rgba(239, 68, 68, 0.25)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 105, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (this.phase === 2) {
      ctx.save();
      const aura = ctx.createRadialGradient(0, 0, 20, 0, 0, 90);
      aura.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 90, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Dynamic Wing Flap & Flight Aerodynamics
    const wingWave = Math.sin(this.animTime * (this.phase === 3 ? 12 : 8)) * 0.08;
    let scaleY = 1 + Math.sin(this.animTime * 8) * 0.04;
    let scaleX = 1 - Math.sin(this.animTime * 8) * 0.04;

    ctx.rotate(wingWave);
    ctx.scale(this.facing * scaleX, scaleY);

    // 3. Dynamic Sprite Selection
    let spriteKey = 'boss8';
    if (this.phase === 3 || this.state === 'INFERNO') {
      spriteKey = 'boss8_rage';
    } else if (this.attackTimer < 0.75 || this.state === 'SWOOP') {
      spriteKey = 'boss8_attack';
    }

    const renderW = 185;
    const renderH = 175;
    const bossSprite = imageLoader.getImage(spriteKey) || imageLoader.getImage('boss8');

    if (bossSprite && bossSprite.complete && bossSprite.naturalWidth > 0) {
      ctx.drawImage(bossSprite, -renderW / 2, -renderH / 2, renderW, renderH);

      // 4. GPU-Accelerated White Hit Flash
      if (this.hurtTimer > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.65;
        ctx.drawImage(bossSprite, -renderW / 2, -renderH / 2, renderW, renderH);
        ctx.restore();
      }
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 0, 65, 50, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#EA580C';
      ctx.fill();
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();
  }
}
