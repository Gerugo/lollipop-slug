import { Projectile } from './Weapons.js';
import { Enemy } from './Enemy.js';
import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Boss4 {
  constructor(x = 6000, y = 220) {
    this.x = x;
    this.y = y;
    this.width = 220;
    this.height = 200;
    this.name = 'LICORICE VIPER';
    this.maxHp = 1100;
    this.hp = 1100;
    this.phase = 1; // 1: 1100-700, 2: 700-350, 3: <350 OVERDRIVE
    this.dead = false;
    this.isDefeated = false;
    this.defeatTimer = 0;
    this.vx = 0;
    this.vy = 0;
    this.facing = -1;
    this.isGrounded = false;
    this.gravity = 700;
    this.baseY = 220;

    // AI & Attack Timers
    this.animTime = 0;
    this.attackTimer = 2.2;
    this.attackCooldown = 2.6;
    this.attackPattern = 0;
    this.isTelegraphing = false;
    this.telegraphTimer = 0;
    this.hurtTimer = 0;
    this.invulnerableTimer = 0;
    this.rageMode = false;

    // Phase 3 Burrowing State
    this.isBurrowed = false;
    this.burrowTimer = 0;
    this.emergeX = 0;
    this.emergeY = 220;
    this.isWarningEmerge = false;

    // Acid pools created in arena
    this.acidPools = [];
  }

  takeDamage(amount, particles, soundManager, camera = null) {
    if (this.dead || this.isDefeated || this.invulnerableTimer > 0 || this.isBurrowed) return;

    this.hp -= amount;
    this.hurtTimer = 0.08;
    soundManager.playEnemyPop();

    if (particles) {
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 4);
      particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 5, '#84CC16');
    }

    // Phase Transitions
    if (this.phase === 1 && this.hp <= this.maxHp * 0.65) {
      this.phase = 2;
      this.attackCooldown = 2.0;
      this.invulnerableTimer = 0.8;
      soundManager.playBossAlarm();
      if (camera) camera.shake(20, 0.8);
      if (particles) {
        particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 280, '#84CC16');
        particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 25, '#15803D');
      }
    } else if (this.phase === 2 && this.hp <= this.maxHp * 0.32) {
      this.phase = 3;
      this.rageMode = true;
      this.attackCooldown = 1.4;
      this.invulnerableTimer = 1.0;
      soundManager.playBossAlarm();
      if (camera) camera.shake(28, 1.2);
      if (particles) {
        particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 340, '#A3E635');
        particles.emitExplosionSprite(this.x + this.width / 2, this.y + this.height / 2, 1.9);
      }
    }

    if (this.hp <= 0 && !this.dead) {
      this.hp = 0;
      this.dead = true;
      this.isDefeated = true;
      this.defeatTimer = 4.0;
      this.isBurrowed = false;
      soundManager.playExplosion();
    }
  }

  update(dt, player, platforms, enemyProjectiles, enemies, particles, soundManager, camera) {
    this.animTime += dt;
    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;

    // Defeat sequence
    if (this.isDefeated) {
      this.defeatTimer -= dt;
      this.vx = 0;
      this.vy = 0;
      if (Math.random() < 0.25 && particles) {
        const rx = this.x + Math.random() * this.width;
        const ry = this.y + Math.random() * this.height;
        particles.emitSparkles(rx, ry, 10, '#A3E635');
        particles.emitSugarSmoke(rx, ry, 8, '#4ADE80');
      }
      return;
    }

    const cx = this.x + this.width / 2;
    const playerCx = player ? player.x + player.width / 2 : cx;
    const dirToPlayer = playerCx < cx ? -1 : 1;

    // --- PHASE 3 BURROW MECHANIC ---
    if (this.isBurrowed) {
      this.burrowTimer -= dt;
      if (this.burrowTimer <= 1.0 && !this.isWarningEmerge) {
        this.isWarningEmerge = true;
        this.emergeX = Math.max(5800, Math.min(6600, playerCx + (Math.random() - 0.5) * 80));
        if (camera) camera.shake(14, 0.9);
      }

      if (this.isWarningEmerge && particles && Math.random() < 0.4) {
        particles.emitSugarSmoke(this.emergeX, 460, 4, '#15803D');
        particles.emitCandyShards(this.emergeX, 460, 3);
      }

      if (this.burrowTimer <= 0) {
        // Emerge strike!
        this.isBurrowed = false;
        this.isWarningEmerge = false;
        this.x = this.emergeX - this.width / 2;
        this.y = 180;
        this.vy = -380;
        soundManager.playExplosion();
        if (camera) camera.shake(25, 0.8);
        if (particles) {
          particles.emitShockwave(this.emergeX, 460, 260, '#A3E635');
          particles.emitSugarSmoke(this.emergeX, 460, 20, '#15803D');
          particles.emitCandyShards(this.emergeX, 460, 16);
        }
        // Burst spikes on emerge
        this.attackSpikeRing(enemyProjectiles, particles);
      }
      return;
    }

    this.facing = dirToPlayer;

    // Coiled slithering locomotion
    const slither = Math.sin(this.animTime * 3) * 60;
    this.vx = slither;

    // Apply gravity
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.isGrounded = false;
    Physics.resolvePlatforms(this, platforms);

    // AI Attack Cycle
    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      this.attackTimer = this.attackCooldown;
      this.executeNextAttack(player, enemyProjectiles, enemies, particles, soundManager, camera);
    }
  }

  executeNextAttack(player, enemyProjectiles, enemies, particles, soundManager, camera) {
    this.attackPattern = (this.attackPattern + 1) % 4;

    if (this.phase === 1) {
      if (this.attackPattern % 2 === 0) {
        this.attackVenomSpread(enemyProjectiles, particles, soundManager);
      } else {
        this.attackTailLunge(player, particles, soundManager, camera);
      }
    } else if (this.phase === 2) {
      if (this.attackPattern === 0) {
        this.attackVenomSpread(enemyProjectiles, particles, soundManager);
      } else if (this.attackPattern === 1) {
        this.attackAcidGlobes(enemyProjectiles, particles, soundManager);
      } else if (this.attackPattern === 2) {
        this.attackSpikeRing(enemyProjectiles, particles);
      } else {
        this.attackSummonMinions(enemies, particles);
      }
    } else if (this.phase === 3) {
      // Phase 3 Overdrive: Burrow underground strike or venom storm
      if (this.attackPattern % 2 === 0) {
        this.startBurrow(player, camera);
      } else {
        this.attackAcidRain(enemyProjectiles, particles, soundManager);
      }
    }
  }

  // Attack 1: Triple Venom Spread
  attackVenomSpread(enemyProjectiles, particles, soundManager) {
    soundManager.playEnemyPop();
    const muzzleX = this.x + (this.facing === -1 ? 20 : this.width - 20);
    const muzzleY = this.y + 70;

    const baseAngle = this.facing === -1 ? Math.PI : 0;
    const angles = [baseAngle - 0.28, baseAngle, baseAngle + 0.28];

    for (const angle of angles) {
      enemyProjectiles.push(
        new Projectile({
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(angle) * 320,
          vy: Math.sin(angle) * 320,
          type: 'ACID_DROP',
          damage: 1,
          isPlayer: false
        })
      );
    }

    if (particles) {
      particles.emitSugarSmoke(muzzleX, muzzleY, 10, '#84CC16');
      particles.emitSparkles(muzzleX, muzzleY, 8, '#A3E635');
    }
  }

  // Attack 2: Tail Lunge Slap
  attackTailLunge(player, particles, soundManager, camera) {
    this.vx = this.facing * 380;
    this.vy = -180;
    if (camera) camera.shake(12, 0.4);
    if (particles) {
      particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height, 12, '#15803D');
    }
  }

  // Attack 3: High Arc Acid Globes
  attackAcidGlobes(enemyProjectiles, particles, soundManager) {
    soundManager.playShotgun();
    const muzzleX = this.x + this.width / 2;
    const muzzleY = this.y + 40;

    for (let i = -1; i <= 1; i++) {
      enemyProjectiles.push(
        new Projectile({
          x: muzzleX,
          y: muzzleY,
          vx: this.facing * (180 + i * 70),
          vy: -320 - Math.random() * 80,
          type: 'ACID_DROP',
          damage: 1,
          isPlayer: false
        })
      );
    }
    if (particles) {
      particles.emitShockwave(muzzleX, muzzleY, 80, '#84CC16');
    }
  }

  // Attack 4: Radial Licorice Spike Burst
  attackSpikeRing(enemyProjectiles, particles) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const count = 8;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      enemyProjectiles.push(
        new Projectile({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * 280,
          vy: Math.sin(angle) * 280,
          type: 'ENEMY_BULLET',
          damage: 1,
          isPlayer: false,
          color: '#84CC16'
        })
      );
    }
    if (particles) particles.emitCandyShards(cx, cy, 14);
  }

  // Attack 5: Summon Acido Minions
  attackSummonMinions(enemies, particles) {
    if (enemies.filter(e => !e.dead).length > 6) return;

    enemies.push(new Enemy({ x: this.x - 100, y: 160, type: 'ACIDO' }));
    enemies.push(new Enemy({ x: this.x + this.width + 50, y: 160, type: 'ACIDO' }));

    if (particles) {
      particles.emitSugarSmoke(this.x, 160, 10, '#84CC16');
      particles.emitSugarSmoke(this.x + this.width, 160, 10, '#84CC16');
    }
  }

  // Attack 6: Phase 3 Burrow Underground
  startBurrow(player, camera) {
    this.isBurrowed = true;
    this.burrowTimer = 2.4;
    this.isWarningEmerge = false;
    if (camera) camera.shake(16, 0.7);
  }

  // Attack 7: Phase 3 Toxic Acid Rain
  attackAcidRain(enemyProjectiles, particles, soundManager) {
    soundManager.playBossAlarm();
    for (let i = 0; i < 6; i++) {
      const rx = 5800 + Math.random() * 850;
      enemyProjectiles.push(
        new Projectile({
          x: rx,
          y: -40 - i * 35,
          vx: (Math.random() - 0.5) * 30,
          vy: 240 + Math.random() * 60,
          type: 'ACID_DROP',
          damage: 1,
          isPlayer: false
        })
      );
    }
    if (particles) {
      particles.emitShockwave(this.x + this.width / 2, this.y + 40, 140, '#A3E635');
    }
  }

  draw(ctx) {
    if (this.isBurrowed) {
      // Draw bubbling ground warning if emerging soon
      if (this.isWarningEmerge) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(this.emergeX, 460, 40, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(132, 204, 22, 0.45)';
        ctx.fill();
        ctx.strokeStyle = '#A3E635';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 16px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ ¡PELIGRO!', this.emergeX, 430);
        ctx.restore();
      }
      return;
    }

    ctx.save();
    const cx = this.x + this.width / 2;
    const bottomY = this.y + this.height;

    // 1. Ground Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, bottomY + 2, 70, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fill();
    ctx.restore();

    // 2. Boss Sprite Anchor
    ctx.translate(cx, bottomY + 1);
    if (this.hurtTimer > 0) // ctx.filter removed for mobile performance
    ctx.scale(this.facing, 1);

    const viperSprite = imageLoader.getImage('boss4');
    const renderW = 220;
    const renderH = 200;

    if (viperSprite && viperSprite.complete && viperSprite.naturalWidth > 0) {
      ctx.drawImage(viperSprite, -renderW / 2, -renderH, renderW, renderH);
    } else {
      ctx.beginPath();
      ctx.ellipse(0, -renderH / 2, 80, 70, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1E1B4B';
      ctx.fill();
      ctx.strokeStyle = '#84CC16';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    ctx.restore();
  }
}
