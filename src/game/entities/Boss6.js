import { Projectile } from './Weapons.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Boss6 {
  constructor(options = {}) {
    this.x = options.x || 6800;
    this.y = options.y || 320;
    this.width = 150;
    this.height = 165;
    this.hp = options.hp || 1500;
    this.maxHp = this.hp;
    this.dead = false;
    this.name = 'GÓLEM DE CARAMELO HELADO';
    this.title = 'TITÁN DE LA VENTISCA DULCE';

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
    this.state = 'IDLE'; // 'IDLE', 'SLAM', 'ROLL_CHARGE', 'BLIZZARD'

    this.arenaLeft = options.arenaLeft || 6400;
    this.arenaRight = options.arenaRight || 7350;
  }

  takeDamage(amount, particles, soundManager) {
    if (this.dead) return;

    this.hp -= amount;
    this.hurtTimer = 0.12;
    if (soundManager && soundManager.playEnemyHit) soundManager.playEnemyHit();

    if (particles) {
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 6);
      particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 4, '#38BDF8');
    }

    const hpRatio = this.hp / this.maxHp;
    if (hpRatio <= 0.30 && this.phase < 3) {
      this.phase = 3;
      this.state = 'BLIZZARD';
      this.stateTimer = 0;
      if (particles) particles.emitShockwave(this.x + this.width / 2, this.y + this.height, 90, '#BAE6FD');
    } else if (hpRatio <= 0.65 && this.phase < 2) {
      this.phase = 2;
      this.state = 'ROLL_CHARGE';
      this.stateTimer = 0;
      if (particles) particles.emitShockwave(this.x + this.width / 2, this.y + this.height, 70, '#38BDF8');
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
      particles.emitSyrupSplash(cx, cy, 35, '#0284C7');
      particles.emitCandyShards(cx, cy, 40);
      particles.emitSparkles(cx, cy, 35, '#BAE6FD');
      particles.emitSugarSmoke(cx, cy, 20, '#F0F9FF');
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

    if (this.state !== 'ROLL_CHARGE') {
      this.facing = px < cx ? -1 : 1;
    }

    // PHASE 1: GLACIAL SLAM & ICICLE DROP
    if (this.phase === 1) {
      if (this.attackTimer >= 2.6) {
        this.attackTimer = 0;
        this.vy = -340;
        this.state = 'SLAM';
      }

      if (this.state === 'SLAM' && this.isGrounded && this.vy >= 0) {
        this.state = 'IDLE';
        if (soundManager && soundManager.playExplosion) soundManager.playExplosion();
        if (particles) {
          particles.emitShockwave(cx, this.y + this.height, 80, '#38BDF8');
          particles.emitSugarSmoke(cx, this.y + this.height, 10, '#BAE6FD');
        }

        // Spawn 3 falling icicles from sky
        for (let i = 0; i < 3; i++) {
          const dropX = this.arenaLeft + 80 + Math.random() * (this.arenaRight - this.arenaLeft - 160);
          enemyProjectiles.push(
            new Projectile({
              x: dropX,
              y: 40,
              vx: 0,
              vy: 320,
              type: 'ICICLE',
              damage: 1,
              isPlayer: false
            })
          );
        }

        // Breath frost shards
        [-0.2, 0, 0.2].forEach(offset => {
          const angle = Math.atan2(py - cy, px - cx) + offset;
          enemyProjectiles.push(
            new Projectile({
              x: cx + this.facing * 50,
              y: cy - 20,
              vx: Math.cos(angle) * 260,
              vy: Math.sin(angle) * 260,
              type: 'ICE_SHARD',
              damage: 1,
              isPlayer: false
            })
          );
        });
      }
    }
    // PHASE 2: GIANT ROLLING SNOWBALL CHARGE
    else if (this.phase === 2) {
      if (this.state === 'ROLL_CHARGE') {
        this.vx = this.facing * 280;
        if (particles && Math.random() < 0.4) {
          particles.emitSugarSmoke(cx, this.y + this.height, 2, '#F0F9FF');
          particles.emitSparkles(cx, this.y + this.height, 2, '#38BDF8');
        }

        if (this.x <= this.arenaLeft + 20) {
          this.facing = 1;
          this.vx = 280;
          if (soundManager && soundManager.playEnemyPop) soundManager.playEnemyPop();
        } else if (this.x + this.width >= this.arenaRight - 20) {
          this.facing = -1;
          this.vx = -280;
          if (soundManager && soundManager.playEnemyPop) soundManager.playEnemyPop();
        }

        if (this.attackTimer >= 2.0) {
          this.attackTimer = 0;
          // Launch snowball burst
          [-1, 1].forEach(dir => {
            enemyProjectiles.push(
              new Projectile({
                x: cx,
                y: cy,
                vx: dir * 210,
                vy: -120,
                type: 'SNOWBALL',
                damage: 1,
                isPlayer: false
              })
            );
          });
        }
      }
    }
    // PHASE 3: POLAR BLIZZARD FRENZY
    else if (this.phase === 3) {
      this.vx = Math.sin(this.animTime * 3) * 120;

      if (particles && Math.random() < 0.6) {
        particles.emitSparkles(this.arenaLeft + Math.random() * (this.arenaRight - this.arenaLeft), 60 + Math.random() * 300, 1, '#BAE6FD');
      }

      if (this.attackTimer >= 1.5) {
        this.attackTimer = 0;
        // 5-way ice shard burst
        [-50, -25, 0, 25, 50].forEach(deg => {
          const rad = (deg * Math.PI) / 180 + (this.facing === -1 ? Math.PI : 0);
          enemyProjectiles.push(
            new Projectile({
              x: cx,
              y: cy - 20,
              vx: Math.cos(rad) * 280,
              vy: Math.sin(rad) * 280,
              type: 'ICE_SHARD',
              damage: 1,
              isPlayer: false
            })
          );
        });
        if (soundManager && soundManager.playSodaGrenadeFizz) soundManager.playSodaGrenadeFizz();
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
    ctx.ellipse(cx, bottomY + 2, 50, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.fill();
    ctx.restore();

    ctx.translate(cx, bottomY + 1);

    if (this.hurtTimer > 0) {
      ctx.filter = 'brightness(2.6) contrast(1.3)';
    }

    let rot = 0;
    if (this.state === 'ROLL_CHARGE') {
      rot = this.animTime * this.facing * 8;
    }

    ctx.rotate(rot);
    ctx.scale(this.facing, 1);

    const bossSprite = imageLoader.getImage('boss6');
    if (bossSprite && bossSprite.complete && bossSprite.naturalWidth > 0) {
      ctx.drawImage(bossSprite, -this.width / 2, -this.height, this.width, this.height);
    } else {
      // Fallback
      ctx.beginPath();
      ctx.roundRect(-this.width / 2, -this.height, this.width, this.height, 16);
      ctx.fillStyle = '#0284C7';
      ctx.fill();
    }

    ctx.restore();
  }
}
