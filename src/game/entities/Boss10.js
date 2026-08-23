import { Projectile } from './Weapons.js';
import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Boss10 {
  constructor(options = {}) {
    this.x = options.x || 7850;
    this.y = options.y || 300;
    this.width = 180;
    this.height = 185;
    this.hp = options.hp || 3000;
    this.maxHp = this.hp;
    this.dead = false;
    this.name = 'REY AMARGO';
    this.title = 'SOBERANO SUPREMO DEL AZÚCAR CORRUPTO';

    this.vx = 0;
    this.vy = 0;
    this.gravity = 950;
    this.isGrounded = false;

    this.facing = -1;
    this.hurtTimer = 0;
    this.stateTimer = 0;
    this.attackTimer = 0;
    this.animTime = 0;

    // Phases: 1 (3000-2000), 2 (2000-1000), 3 (1000-0)
    this.phase = 1;
    this.state = 'IDLE'; // 'IDLE', 'THRONE_SLAM', 'MECHA_CHARGE', 'COSMIC_ASCENSION'

    this.arenaLeft = options.arenaLeft || 7300;
    this.arenaRight = options.arenaRight || 8450;
  }

  takeDamage(amount, particles, soundManager) {
    if (this.dead) return;

    this.hp -= amount;
    this.hurtTimer = 0.12;
    if (soundManager && soundManager.playEnemyHit) soundManager.playEnemyHit();

    if (particles) {
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 8);
      particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 6, '#F59E0B');
      particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 4, '#E11D48');
    }

    const hpRatio = this.hp / this.maxHp;
    if (hpRatio <= 0.33 && this.phase < 3) {
      this.phase = 3;
      this.state = 'COSMIC_ASCENSION';
      this.stateTimer = 0;
      this.gravity = 0;
      if (particles) particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 120, '#FDE047');
    } else if (hpRatio <= 0.66 && this.phase < 2) {
      this.phase = 2;
      this.state = 'MECHA_CHARGE';
      this.stateTimer = 0;
      if (particles) particles.emitShockwave(this.x + this.width / 2, this.y + this.height, 90, '#E11D48');
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
      particles.emitExplosionSprite(cx, cy, 3.8);
      particles.emitSyrupSplash(cx, cy, 60, '#F59E0B');
      particles.emitCandyShards(cx, cy, 70);
      particles.emitSparkles(cx, cy, 60, '#FDE047');
      particles.emitSugarSmoke(cx, cy, 40, '#E11D48');
      particles.emitShockwave(cx, cy, 140, '#EC4899');
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

    if (this.state !== 'MECHA_CHARGE') {
      this.facing = px < cx ? -1 : 1;
    }

    // PHASE 1: THE BITTER KING IN HIS GOLDEN MECHA THRONE
    if (this.phase === 1) {
      if (this.attackTimer >= 2.2) {
        this.attackTimer = 0;
        this.vy = -380;
        this.state = 'THRONE_SLAM';
      }

      if (this.state === 'THRONE_SLAM' && this.isGrounded && this.vy >= 0) {
        this.state = 'IDLE';
        if (soundManager && soundManager.playExplosion) soundManager.playExplosion();
        if (particles) {
          particles.emitShockwave(cx, this.y + this.height, 90, '#F59E0B');
          particles.emitSugarSmoke(cx, this.y + this.height, 12, '#E11D48');
        }

        // 2 Royal Beams
        [-15, 15].forEach(offsetY => {
          enemyProjectiles.push(
            new Projectile({
              x: cx + this.facing * 50,
              y: cy + offsetY,
              vx: this.facing * 320,
              vy: 0,
              type: 'ROYAL_BEAM',
              damage: 1,
              isPlayer: false
            })
          );
        });

        // 2 Magic Runes
        [-0.2, 0.2].forEach(offset => {
          const angle = Math.atan2(py - cy, px - cx) + offset;
          enemyProjectiles.push(
            new Projectile({
              x: cx,
              y: cy - 20,
              vx: Math.cos(angle) * 260,
              vy: Math.sin(angle) * 260,
              type: 'RUNE_BLAST',
              damage: 1,
              isPlayer: false
            })
          );
        });
      }
    }
    // PHASE 2: MECHA COLOSSUS CHARGE & PLASMA VOLLEYS
    else if (this.phase === 2) {
      if (this.state === 'MECHA_CHARGE') {
        this.vx = this.facing * 340;
        if (particles && Math.random() < 0.45) {
          particles.emitSugarSmoke(cx, this.y + this.height, 3, '#F59E0B');
          particles.emitSparkles(cx, this.y + this.height, 2, '#E11D48');
        }

        if (this.x <= this.arenaLeft + 30) {
          this.facing = 1;
          this.vx = 340;
          if (soundManager && soundManager.playExplosion) soundManager.playExplosion();
        } else if (this.x + this.width >= this.arenaRight - 30) {
          this.facing = -1;
          this.vx = -340;
          if (soundManager && soundManager.playExplosion) soundManager.playExplosion();
        }

        if (this.attackTimer >= 1.7) {
          this.attackTimer = 0;
          [-0.25, 0, 0.25].forEach(offset => {
            const angle = Math.atan2(py - cy, px - cx) + offset;
            enemyProjectiles.push(
              new Projectile({
                x: cx,
                y: cy - 10,
                vx: Math.cos(angle) * 290,
                vy: Math.sin(angle) * 290,
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
    // PHASE 3: COSMIC BITTER CELESTIAL FRENZY (FINAL STAGE)
    else if (this.phase === 3) {
      this.y = 200 + Math.sin(this.animTime * 3.5) * 60;
      this.x += Math.sin(this.animTime * 2.2) * 160 * dt;

      if (particles && Math.random() < 0.6) {
        particles.emitSparkles(cx + (Math.random() - 0.5) * 80, cy + (Math.random() - 0.5) * 80, 2, '#FDE047');
      }

      if (this.attackTimer >= 1.4) {
        this.attackTimer = 0;
        // Rain 3 cosmic meteors from above
        for (let i = 0; i < 3; i++) {
          const dropX = this.arenaLeft + 80 + Math.random() * (this.arenaRight - this.arenaLeft - 160);
          enemyProjectiles.push(
            new Projectile({
              x: dropX,
              y: 40,
              vx: 0,
              vy: 350,
              type: 'COSMIC_BURST',
              damage: 1,
              isPlayer: false
            })
          );
        }

        // 4-way royal beam barrage
        [-40, -15, 15, 40].forEach(deg => {
          const rad = (deg * Math.PI) / 180 + (this.facing === -1 ? Math.PI : 0);
          enemyProjectiles.push(
            new Projectile({
              x: cx,
              y: cy,
              vx: Math.cos(rad) * 320,
              vy: Math.sin(rad) * 320,
              type: 'ROYAL_BEAM',
              damage: 1,
              isPlayer: false
            })
          );
        });
        if (soundManager && soundManager.playExplosion) soundManager.playExplosion();
      }
    }

    // Apply gravity & physics for grounded phases
    if (platforms && this.phase < 3) {
      this.vy += this.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.isGrounded = false;
      Physics.resolvePlatforms(this, platforms);
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
    ctx.ellipse(cx, bottomY + 2, 60, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fill();
    ctx.restore();

    ctx.translate(cx, this.phase === 3 ? cy : bottomY + 1);

    if (this.hurtTimer > 0) {
      // ctx.filter removed for mobile performance
    }

    let rot = 0;
    if (this.phase === 3) {
      rot = Math.sin(this.animTime * 4) * 0.08;
    }

    ctx.rotate(rot);
    ctx.scale(this.facing, 1);

    const bossSprite = imageLoader.getImage('boss10');
    if (bossSprite && bossSprite.complete && bossSprite.naturalWidth > 0) {
      if (this.phase === 3) {
        ctx.drawImage(bossSprite, -this.width / 2, -this.height / 2, this.width, this.height);
      } else {
        ctx.drawImage(bossSprite, -this.width / 2, -this.height, this.width, this.height);
      }
    } else {
      ctx.beginPath();
      ctx.roundRect(-this.width / 2, -this.height, this.width, this.height, 16);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
    }

    ctx.restore();
  }
}
