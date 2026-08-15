import { Projectile } from './Weapons.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Boss9 {
  constructor(options = {}) {
    this.x = options.x || 7400;
    this.y = options.y || 310;
    this.width = 160;
    this.height = 175;
    this.hp = options.hp || 2200;
    this.maxHp = this.hp;
    this.dead = false;
    this.name = 'CABALLERO NEGRO DE REGALIZ';
    this.title = 'CAMPEÓN DE LA CIUDADELA PROHIBIDA';

    this.vx = 0;
    this.vy = 0;
    this.gravity = 950;
    this.isGrounded = false;

    this.facing = -1;
    this.hurtTimer = 0;
    this.stateTimer = 0;
    this.attackTimer = 0;
    this.animTime = 0;

    // Phases: 1 (100%-65%), 2 (65%-30%), 3 (30%-0%)
    this.phase = 1;
    this.state = 'IDLE'; // 'IDLE', 'SLAM', 'CHARGE', 'DARK_FURY'

    this.arenaLeft = options.arenaLeft || 6900;
    this.arenaRight = options.arenaRight || 7950;
  }

  takeDamage(amount, particles, soundManager) {
    if (this.dead) return;

    this.hp -= amount;
    this.hurtTimer = 0.12;
    if (soundManager && soundManager.playEnemyHit) soundManager.playEnemyHit();

    if (particles) {
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 6);
      particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 4, '#9333EA');
      particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 4, '#E11D48');
    }

    const hpRatio = this.hp / this.maxHp;
    if (hpRatio <= 0.30 && this.phase < 3) {
      this.phase = 3;
      this.state = 'DARK_FURY';
      this.stateTimer = 0;
      if (particles) particles.emitShockwave(this.x + this.width / 2, this.y + this.height, 90, '#E11D48');
    } else if (hpRatio <= 0.65 && this.phase < 2) {
      this.phase = 2;
      this.state = 'CHARGE';
      this.stateTimer = 0;
      if (particles) particles.emitShockwave(this.x + this.width / 2, this.y + this.height, 70, '#9333EA');
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
      particles.emitExplosionSprite(cx, cy, 3.0);
      particles.emitSyrupSplash(cx, cy, 50, '#E11D48');
      particles.emitCandyShards(cx, cy, 50);
      particles.emitSparkles(cx, cy, 45, '#9333EA');
      particles.emitSugarSmoke(cx, cy, 30, '#18181B');
    }
  }

  update(dt, player, enemyProjectiles, particles, soundManager, enemies) {
    if (this.dead) return;

    this.animTime += dt;
    this.stateTimer += dt;
    this.attackTimer += dt;

    if (this.hurtTimer > 0) this.hurtTimer -= dt;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const px = player ? player.x + player.width / 2 : cx;
    const py = player ? player.y + player.height / 2 : cy;

    if (this.state !== 'CHARGE') {
      this.facing = px < cx ? -1 : 1;
    }

    // PHASE 1: DARK SWORD CLEAVE & SEISMIC JUMP
    if (this.phase === 1) {
      if (this.attackTimer >= 2.4) {
        this.attackTimer = 0;
        this.vy = -360;
        this.state = 'SLAM';
      }

      if (this.state === 'SLAM' && this.isGrounded && this.vy >= 0) {
        this.state = 'IDLE';
        if (soundManager && soundManager.playExplosion) soundManager.playExplosion();
        if (particles) {
          particles.emitShockwave(cx, this.y + this.height, 85, '#E11D48');
          particles.emitSugarSmoke(cx, this.y + this.height, 12, '#9333EA');
        }

        // Sword cleave projectile
        enemyProjectiles.push(
          new Projectile({
            x: cx + this.facing * 50,
            y: cy - 20,
            vx: this.facing * 300,
            vy: 0,
            type: 'DARK_SLASH',
            damage: 1,
            isPlayer: false
          })
        );
      }
    }
    // PHASE 2: OBSIDIAN GREATSWORD CHARGE & PLASMA ORBS
    else if (this.phase === 2) {
      if (this.state === 'CHARGE') {
        this.vx = this.facing * 310;
        if (particles && Math.random() < 0.4) {
          particles.emitSugarSmoke(cx, this.y + this.height, 3, '#E11D48');
        }

        if (this.x <= this.arenaLeft + 30) {
          this.facing = 1;
          this.vx = 310;
        } else if (this.x + this.width >= this.arenaRight - 30) {
          this.facing = -1;
          this.vx = -310;
        }

        if (this.attackTimer >= 1.8) {
          this.attackTimer = 0;
          // 2 plasma orbs
          [-15, 15].forEach(offsetY => {
            enemyProjectiles.push(
              new Projectile({
                x: cx,
                y: cy + offsetY,
                vx: this.facing * 260,
                vy: offsetY * 2,
                type: 'PLASMA_ORB',
                damage: 1,
                isPlayer: false
              })
            );
          });
          if (soundManager && soundManager.playSodaGrenadeFizz) soundManager.playSodaGrenadeFizz();
        }
      }
    }
    // PHASE 3: RAINING SPECTRAL SWORDS & TRIPLE DARK SLASH
    else if (this.phase === 3) {
      this.vx = Math.sin(this.animTime * 3.5) * 130;

      if (this.attackTimer >= 1.5) {
        this.attackTimer = 0;
        // Rain 3 swords from ceiling
        for (let i = 0; i < 3; i++) {
          const dropX = this.arenaLeft + 80 + Math.random() * (this.arenaRight - this.arenaLeft - 160);
          enemyProjectiles.push(
            new Projectile({
              x: dropX,
              y: 40,
              vx: 0,
              vy: 340,
              type: 'LANCE_THRUST',
              damage: 1,
              isPlayer: false
            })
          );
        }

        // 3-way dark slash
        [-0.25, 0, 0.25].forEach(offset => {
          const angle = Math.atan2(py - cy, px - cx) + offset;
          enemyProjectiles.push(
            new Projectile({
              x: cx + this.facing * 40,
              y: cy - 20,
              vx: Math.cos(angle) * 310,
              vy: Math.sin(angle) * 310,
              type: 'DARK_SLASH',
              damage: 1,
              isPlayer: false
            })
          );
        });
        if (soundManager && soundManager.playExplosion) soundManager.playExplosion();
      }
    }

    // Keep within arena bounds
    this.x = Math.max(this.arenaLeft + 20, Math.min(this.arenaRight - this.width - 20, this.x));
  }

  draw(ctx) {
    if (this.dead) return;

    ctx.save();
    const cx = this.x + this.width / 2;
    const bottomY = this.y + this.height;

    // Ground Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, bottomY + 2, 55, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.fill();
    ctx.restore();

    ctx.translate(cx, bottomY + 1);

    if (this.hurtTimer > 0) {
      ctx.filter = 'brightness(2.6) drop-shadow(0 0 10px rgba(255, 255, 255, 0.95)) contrast(1.2)';
    }

    ctx.scale(this.facing, 1);

    const bossSprite = imageLoader.getImage('boss9');
    if (bossSprite && bossSprite.complete && bossSprite.naturalWidth > 0) {
      ctx.drawImage(bossSprite, -this.width / 2, -this.height, this.width, this.height);
    } else {
      ctx.beginPath();
      ctx.roundRect(-this.width / 2, -this.height, this.width, this.height, 16);
      ctx.fillStyle = '#18181B';
      ctx.fill();
    }

    ctx.restore();
  }
}
