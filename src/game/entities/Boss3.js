import { Projectile } from './Weapons.js';
import { Enemy } from './Enemy.js';
import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Boss3 {
  constructor(x = 6900, y = 180) {
    this.x = x;
    this.y = y;
    this.width = 190;
    this.height = 220;
    this.name = 'SUGAR QUEEN EMPRESS';
    this.maxHp = 900;
    this.hp = 900;
    this.phase = 1; // 1: 100%-65%, 2: 65%-30%, 3: <30% OVERDRIVE
    this.dead = false;
    this.isDefeated = false;
    this.defeatTimer = 0;
    this.vx = 0;
    this.vy = 0;
    this.facing = -1;
    this.isGrounded = false;
    this.gravity = 0; // Queen floats in the air
    this.baseHoverY = 190;

    // AI & Attack Timers
    this.animTime = 0;
    this.attackTimer = 2.0;
    this.attackCooldown = 2.4;
    this.attackPattern = 0;
    this.isTelegraphing = false;
    this.telegraphTimer = 0;
    this.hurtTimer = 0;
    this.invulnerableTimer = 0;
    this.rageMode = false;

    // Phase 2 Beam Sweep state
    this.laserActive = false;
    this.laserTimer = 0;
    this.laserY = 0;

    // Phase 3 Teleport state
    this.isTeleporting = false;
    this.teleportTimer = 0;

    // Scepter Orbs floating orbit
    this.orbAngle = 0;
  }

  takeDamage(amount, particles, soundManager, camera = null) {
    if (this.dead || this.isDefeated || this.invulnerableTimer > 0) return;

    this.hp -= amount;
    this.hurtTimer = 0.08;
    soundManager.playEnemyPop();

    if (particles) {
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 4);
      particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 5, '#F472B6');
    }

    // Phase Transitions
    if (this.phase === 1 && this.hp <= this.maxHp * 0.65) {
      this.phase = 2;
      this.attackCooldown = 1.8;
      this.invulnerableTimer = 0.8;
      soundManager.playBossAlarm();
      if (particles) {
        particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 260, '#E879F9');
        particles.emitConfetti(this.x + this.width / 2, this.y + this.height / 2, 35);
      }
    } else if (this.phase === 2 && this.hp <= this.maxHp * 0.30) {
      this.phase = 3;
      this.rageMode = true;
      this.attackCooldown = 1.2;
      this.invulnerableTimer = 1.0;
      soundManager.playBossAlarm();
      if (particles) {
        particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 320, '#F43F5E');
        particles.emitExplosionSprite(this.x + this.width / 2, this.y + this.height / 2, 1.8);
      }
    }

    if (this.hp <= 0 && !this.isDefeated) {
      this.hp = 0;
      this.startDefeatSequence(soundManager, particles);
    }
  }

  startDefeatSequence(soundManager, particles) {
    this.isDefeated = true;
    this.defeatTimer = 3.2;
    this.laserActive = false;
    this.isTelegraphing = false;
    soundManager.playExplosion();
    if (particles) {
      particles.emitExplosionSprite(this.x + this.width / 2, this.y + this.height / 2, 2.0);
      particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 300, '#FBBF24');
    }
  }

  update(dt, player, platforms, enemyProjectiles, enemies, particles, soundManager, camera) {
    this.animTime += dt;
    this.orbAngle += dt * 3.5;

    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;

    // Defeat sequence fireworks
    if (this.isDefeated) {
      this.defeatTimer -= dt;
      this.y += 20 * dt;

      if (Math.random() < 0.25 && particles) {
        const rx = this.x + Math.random() * this.width;
        const ry = this.y + Math.random() * this.height;
        particles.emitExplosionSprite(rx, ry, 0.8 + Math.random() * 0.6);
        particles.emitConfetti(rx, ry, 12);
        soundManager.playExplosion();
        if (camera) camera.shake(12, 0.3);
      }

      if (this.defeatTimer <= 0) {
        this.dead = true;
        if (particles) {
          particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 380, '#FEF08A');
          particles.emitExplosionSprite(this.x + this.width / 2, this.y + this.height / 2, 2.5);
          particles.emitConfetti(this.x + this.width / 2, this.y + this.height / 2, 80);
        }
      }
      return;
    }

    if (!player) return;

    this.facing = player.x < this.x + this.width / 2 ? -1 : 1;

    // Floating sinusoidal flight motion
    const hoverAmp = this.phase === 3 ? 32 : 20;
    const hoverSpeed = this.phase === 3 ? 3.5 : 2.0;
    this.y = this.baseHoverY + Math.sin(this.animTime * hoverSpeed) * hoverAmp;

    // Horizontal patrol around player
    const targetX = player.x + (this.facing === -1 ? 260 : -260);
    this.x += (targetX - this.x) * Math.min(1, dt * (this.phase === 3 ? 2.5 : 1.2));

    // Attack State Machine
    if (this.isTelegraphing) {
      this.telegraphTimer -= dt;
      if (this.telegraphTimer <= 0) {
        this.isTelegraphing = false;
        this.fireAttack(this.attackPattern, player, enemyProjectiles, enemies, particles, soundManager, camera);
      }
    } else {
      this.attackTimer += dt;
      if (this.attackTimer >= this.attackCooldown) {
        this.attackTimer = 0;
        this.selectNextAttack();
        this.startAttackTelegraph(this.attackPattern, soundManager, camera);
      }
    }

    // Laser Beam Sweep logic
    if (this.laserActive) {
      this.laserTimer -= dt;
      this.laserY += 120 * dt; // sweeps downward
      if (this.laserTimer <= 0) {
        this.laserActive = false;
      } else if (player && !player.isDead) {
        // Laser hit detection
        if (player.y + player.height > this.laserY - 18 && player.y < this.laserY + 18) {
          player.takeDamage(1, this.x + this.width / 2, particles, soundManager, camera);
        }
      }
    }
  }

  selectNextAttack() {
    if (this.phase === 1) {
      // 0: Candy Scissors, 1: Rose Spray
      this.attackPattern = Math.random() < 0.5 ? 0 : 1;
    } else if (this.phase === 2) {
      // 0: Candy Scissors, 1: Rose Spray, 2: Beam Sweep, 3: Crystal Summon
      const roll = Math.random();
      if (roll < 0.3) this.attackPattern = 0;
      else if (roll < 0.6) this.attackPattern = 1;
      else if (roll < 0.85) this.attackPattern = 2; // Beam Sweep
      else this.attackPattern = 3; // Crystal Summon
    } else {
      // Phase 3 Overdrive: 2: Beam Sweep, 4: Candy Storm, 5: Teleport Strike
      const roll = Math.random();
      if (roll < 0.35) this.attackPattern = 4; // Candy Storm
      else if (roll < 0.7) this.attackPattern = 5; // Teleport Strike
      else this.attackPattern = 2; // Beam Sweep
    }
  }

  startAttackTelegraph(pattern, soundManager, camera) {
    this.isTelegraphing = true;
    this.telegraphTimer = this.phase === 3 ? 0.45 : 0.65;

    if (pattern === 2) {
      soundManager.playBossAlarm();
      if (camera) camera.shake(10, 0.4);
    }
  }

  fireAttack(pattern, player, enemyProjectiles, enemies, particles, soundManager, camera) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // Pattern 0: Candy Scissors (2 crossed diagonal projectile streams)
    if (pattern === 0) {
      soundManager.playEnemyPop();
      const angles = [-0.4, 0.4, -0.8, 0.8];
      for (const ang of angles) {
        const dir = this.facing;
        enemyProjectiles.push(
          new Projectile({
            x: cx + dir * 30,
            y: cy,
            vx: Math.cos(ang) * dir * 280,
            vy: Math.sin(ang) * 280,
            type: 'GUMBALL',
            damage: 1,
            isPlayer: false,
            color: '#EC4899'
          })
        );
      }
      if (particles) particles.emitConfetti(cx, cy, 14);
    }

    // Pattern 1: Rose Spray (5 spread down-forward)
    else if (pattern === 1) {
      soundManager.playEnemyPop();
      for (let i = -2; i <= 2; i++) {
        const spreadAngle = (i * 0.18) + (this.facing === -1 ? Math.PI : 0);
        enemyProjectiles.push(
          new Projectile({
            x: cx,
            y: cy + 10,
            vx: Math.cos(spreadAngle) * 320,
            vy: Math.sin(spreadAngle) * 320 + 40,
            type: 'ENEMY_BULLET',
            damage: 1,
            isPlayer: false,
            color: '#F472B6'
          })
        );
      }
      if (particles) particles.emitSugarSmoke(cx, cy, 8, '#FBCFE8');
    }

    // Pattern 2: Beam Sweep (Horizontal sweeping laser)
    else if (pattern === 2) {
      this.laserActive = true;
      this.laserTimer = 1.3;
      this.laserY = 180;
      soundManager.playExplosion();
      if (camera) camera.shake(16, 0.8);
      if (particles) particles.emitShockwave(cx, cy, 220, '#F43F5E');
    }

    // Pattern 3: Crystal Summon (Summons 2 SNIPER helpers in arena)
    else if (pattern === 3) {
      soundManager.playBossAlarm();
      if (enemies.length < 6) {
        const spawnX1 = cx - 220;
        const spawnX2 = cx + 220;
        enemies.push(new Enemy({ x: spawnX1, y: 350, type: 'SNIPER' }));
        enemies.push(new Enemy({ x: spawnX2, y: 350, type: 'SNIPER' }));
        if (particles) {
          particles.emitSparkles(spawnX1, 350, 12, '#38BDF8');
          particles.emitSparkles(spawnX2, 350, 12, '#38BDF8');
        }
      }
    }

    // Pattern 4: Candy Storm (8 sugar meteors falling from sky)
    else if (pattern === 4) {
      soundManager.playBossAlarm();
      if (camera) camera.shake(14, 0.6);
      for (let i = 0; i < 8; i++) {
        const rx = (player.x - 300) + (i * 85) + (Math.random() - 0.5) * 40;
        enemyProjectiles.push(
          new Projectile({
            x: rx,
            y: -20 - (i * 25),
            vx: (Math.random() - 0.5) * 40,
            vy: 340,
            type: 'GUMBALL',
            damage: 1,
            isPlayer: false,
            color: ['#F43F5E', '#F59E0B', '#A855F7', '#38BDF8'][i % 4]
          })
        );
      }
      if (particles) particles.emitConfetti(cx, cy, 25);
    }

    // Pattern 5: Teleport Strike (Teleports above player with shockwave slam)
    else if (pattern === 5) {
      if (particles) {
        particles.emitShockwave(cx, cy, 180, '#F472B6');
        particles.emitConfetti(cx, cy, 20);
      }
      // Reappear above player
      this.x = player.x + (this.facing === -1 ? 140 : -140);
      this.baseHoverY = 160;
      soundManager.playExplosion();
      if (camera) camera.shake(18, 0.5);

      // Radial burst on arrival
      for (let i = 0; i < 8; i++) {
        const rad = (i / 8) * Math.PI * 2;
        enemyProjectiles.push(
          new Projectile({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: Math.cos(rad) * 260,
            vy: Math.sin(rad) * 260,
            type: 'ENEMY_BULLET',
            damage: 1,
            isPlayer: false,
            color: '#EC4899'
          })
        );
      }
    }
  }

  draw(ctx) {
    if (this.dead) return;

    ctx.save();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // Ground Aura Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, 470, 40 + Math.sin(this.animTime * 4) * 8, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.phase === 3 ? 'rgba(244, 63, 94, 0.25)' : 'rgba(168, 85, 247, 0.20)';
    ctx.fill();
    ctx.restore();

    // Draw Laser Beam Sweep if active
    if (this.laserActive) {
      ctx.save();
      const beamGrad = ctx.createLinearGradient(0, this.laserY - 14, 0, this.laserY + 14);
      beamGrad.addColorStop(0, 'rgba(244, 63, 94, 0)');
      beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      beamGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(cx - 1200, this.laserY - 14, 2400, 28);

      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 1200, this.laserY);
      ctx.lineTo(cx + 1200, this.laserY);
      ctx.stroke();
      ctx.restore();
    }

    // Orbiting Sugar Scepter Orbs
    for (let i = 0; i < 3; i++) {
      const angle = this.orbAngle + (i * (Math.PI * 2 / 3));
      const orbX = cx + Math.cos(angle) * 75;
      const orbY = cy + Math.sin(angle) * 35;

      ctx.save();
      ctx.beginPath();
      ctx.arc(orbX, orbY, 9, 0, Math.PI * 2);
      ctx.fillStyle = ['#F472B6', '#FEF08A', '#38BDF8'][i];
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Telegraph Glow Aura
    if (this.isTelegraphing) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 95 + Math.sin(this.animTime * 20) * 12, 0, Math.PI * 2);
      ctx.strokeStyle = this.phase === 3 ? '#F43F5E' : '#E879F9';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    // Boss Sprite Drawing
    ctx.translate(cx, cy);
    if (this.hurtTimer > 0) // ctx.filter removed for mobile performance
    ctx.scale(this.facing, 1);

    const bossSprite = imageLoader.getImage('boss3');
    const renderW = 200;
    const renderH = 230;

    if (bossSprite && bossSprite.complete && bossSprite.naturalWidth > 0) {
      ctx.drawImage(bossSprite, -renderW / 2, -renderH / 2, renderW, renderH);
    } else {
      ctx.beginPath();
      ctx.roundRect(-50, -60, 100, 120, 20);
      ctx.fillStyle = '#E879F9';
      ctx.fill();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    ctx.restore();
  }
}
