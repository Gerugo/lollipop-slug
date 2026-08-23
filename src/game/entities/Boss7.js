import { Projectile } from './Weapons.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Boss7 {
  constructor(options = {}) {
    this.x = options.x || 7000;
    this.y = options.y || 180;
    this.width = 160;
    this.height = 140;
    this.hp = options.hp || 1700;
    this.maxHp = this.hp;
    this.dead = false;
    this.name = 'CIEMPIÉS DE GOMINOLA GIGANTE';
    this.title = 'COLOSO DEL LABERINTO ELÁSTICO';

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
    this.baseY = options.y || 180;
    this.state = 'WALL_CRAWL'; // 'WALL_CRAWL', 'ELASTIC_BOUNCE', 'FRENZY'

    this.arenaLeft = options.arenaLeft || 6500;
    this.arenaRight = options.arenaRight || 7550;
  }

  takeDamage(amount, particles, soundManager) {
    if (this.dead) return;

    this.hp -= amount;
    this.hurtTimer = 0.12;
    if (soundManager && soundManager.playEnemyHit) soundManager.playEnemyHit();

    if (particles) {
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 6);
      particles.emitSyrupSplash(this.x + this.width / 2, this.y + this.height / 2, 8, '#E11D48');
    }

    const hpRatio = this.hp / this.maxHp;
    if (hpRatio <= 0.30 && this.phase < 3) {
      this.phase = 3;
      this.state = 'FRENZY';
      this.stateTimer = 0;
      if (particles) particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 90, '#FB7185');
    } else if (hpRatio <= 0.65 && this.phase < 2) {
      this.phase = 2;
      this.state = 'ELASTIC_BOUNCE';
      this.stateTimer = 0;
      if (particles) particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 70, '#10B981');
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
      particles.emitSyrupSplash(cx, cy, 40, '#E11D48');
      particles.emitCandyShards(cx, cy, 40);
      particles.emitSparkles(cx, cy, 35, '#FB7185');
      particles.emitSugarSmoke(cx, cy, 20, '#9333EA');
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

    // PHASE 1: CEILING CRAWL & ACID DRIPS
    if (this.phase === 1) {
      this.y = this.baseY + Math.sin(this.animTime * 3) * 35;
      this.x += Math.cos(this.animTime * 1.5) * 110 * dt;

      if (this.attackTimer >= 2.0) {
        this.attackTimer = 0;
        // Drop 2 acid droplets downwards
        [-20, 20].forEach(offX => {
          enemyProjectiles.push(
            new Projectile({
              x: cx + offX,
              y: cy + 30,
              vx: (Math.random() - 0.5) * 60,
              vy: 240,
              type: 'JELLY_SPLASH',
              damage: 1,
              isPlayer: false
            })
          );
        });
        // Sonic screech
        enemyProjectiles.push(
          new Projectile({
            x: cx + this.facing * 40,
            y: cy,
            vx: this.facing * 260,
            vy: 40,
            type: 'SONIC_WAVE',
            damage: 1,
            isPlayer: false
          })
        );
        if (soundManager && soundManager.playSodaGrenadeFizz) soundManager.playSodaGrenadeFizz();
      }
    }
    // PHASE 2: ELASTIC TRAMPOLINE BOUNCING
    else if (this.phase === 2) {
      this.y = 260 + Math.sin(this.animTime * 4.5) * 140;
      this.x += Math.sin(this.animTime * 2.5) * 160 * dt;

      if (this.attackTimer >= 1.8) {
        this.attackTimer = 0;
        [-0.25, 0, 0.25].forEach(offset => {
          const angle = Math.atan2(py - cy, px - cx) + offset;
          enemyProjectiles.push(
            new Projectile({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * 260,
              vy: Math.sin(angle) * 260,
              type: 'SONIC_WAVE',
              damage: 1,
              isPlayer: false
            })
          );
        });
        if (soundManager && soundManager.playSodaGrenadeFizz) soundManager.playSodaGrenadeFizz();
        if (particles) particles.emitSparkles(cx, cy, 12, '#10B981');
      }
    }
    // PHASE 3: GUMMY FRENZY (8-WAY BURST)
    else if (this.phase === 3) {
      this.y = this.baseY + 40 + Math.sin(this.animTime * 5) * 60;
      this.x += Math.sin(this.animTime * 3) * 140 * dt;

      if (this.attackTimer >= 1.5) {
        this.attackTimer = 0;
        const baseAngle = this.animTime * 2;
        for (let i = 0; i < 8; i++) {
          const angle = baseAngle + (i * Math.PI * 2) / 8;
          enemyProjectiles.push(
            new Projectile({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * 250,
              vy: Math.sin(angle) * 250,
              type: 'JELLY_SPLASH',
              damage: 1,
              isPlayer: false
            })
          );
        }
        if (soundManager && soundManager.playSodaGrenadeFizz) soundManager.playSodaGrenadeFizz();
        if (particles) particles.emitSparkles(cx, cy, 20, '#FB7185');
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

    // 1. GPU-Accelerated Gelatinous Glow Aura
    if (this.phase === 3) {
      ctx.save();
      const aura = ctx.createRadialGradient(0, 0, 20, 0, 0, 95);
      aura.addColorStop(0, 'rgba(251, 113, 133, 0.45)');
      aura.addColorStop(0.6, 'rgba(225, 29, 72, 0.25)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 95, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (this.phase === 2) {
      ctx.save();
      const aura = ctx.createRadialGradient(0, 0, 20, 0, 0, 85);
      aura.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 85, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Dynamic Gummy Undulation & Squash-and-Stretch
    const wave = Math.sin(this.animTime * (this.phase === 3 ? 10 : 6)) * 0.12;
    let scaleY = 1 + Math.sin(this.animTime * 5) * 0.04;
    let scaleX = 1 - Math.sin(this.animTime * 5) * 0.04;

    ctx.rotate(wave);
    ctx.scale(this.facing * scaleX, scaleY);

    // 3. Dynamic Sprite Selection
    let spriteKey = 'boss7';
    if (this.phase === 3 || this.state === 'FRENZY') {
      spriteKey = 'boss7_rage';
    } else if (this.attackTimer < 0.75 || this.state === 'ELASTIC_BOUNCE') {
      spriteKey = 'boss7_attack';
    }

    const renderW = 180;
    const renderH = 175;
    const bossSprite = imageLoader.getImage(spriteKey) || imageLoader.getImage('boss7');

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
      ctx.ellipse(0, 0, 60, 45, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#E11D48';
      ctx.fill();
      ctx.strokeStyle = '#FB7185';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();
  }
}
