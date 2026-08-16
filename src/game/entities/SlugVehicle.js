import { Projectile } from './Weapons.js';
import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class SlugVehicle {
  constructor(x = 1450, y = 380) {
    this.x = x;
    this.y = y;
    this.prevY = y;
    this.width = 96;
    this.height = 68;

    this.vx = 0;
    this.vy = 0;
    this.speed = 260;
    this.jumpForce = -480;
    this.gravity = 1100;
    this.isGrounded = false;
    this.facing = 1;

    // Vehicle State
    this.isOccupied = false;
    this.armor = 5;
    this.maxArmor = 5;
    this.isDestroyed = false;
    this.fireTimer = 0;
    this.fireRate = 0.22;
    this.hurtTimer = 0;
    this.recoilX = 0;
    this.animTime = 0;
    this.treadAnim = 0;
    this.ejectTimer = 0;
  }

  takeDamage(amount, fromX = 0, particles, soundManager, camera) {
    if (!this.isOccupied || this.isDestroyed) return;

    this.armor -= amount;
    this.hurtTimer = 0.12;
    soundManager.playBossHurt();
    if (camera) camera.shake(8, 0.3);

    if (particles) {
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 10);
      particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 6, '#EF4444');
    }

    if (this.armor <= 0) {
      this.armor = 0;
      this.explode(particles, soundManager, camera);
    }
  }

  explode(particles, soundManager, camera) {
    this.isDestroyed = true;
    soundManager.playExplosion();
    if (camera) camera.shake(20, 0.8);

    if (particles) {
      particles.emitExplosionSprite(this.x + this.width / 2, this.y + this.height / 2, 1.4);
      particles.emitShockwave(this.x + this.width / 2, this.y + this.height / 2, 100, '#EF4444');
      particles.emitSyrupSplash(this.x + this.width / 2, this.y + this.height / 2, 25, '#EF4444');
      particles.emitConfetti(this.x + this.width / 2, this.y + this.height / 2, 35);
    }
  }

  mount(player) {
    this.isOccupied = true;
    player.x = this.x + this.width / 2 - player.width / 2;
    player.y = this.y;
    player.vx = 0;
    player.vy = 0;
    this.facing = player.facing;
  }

  dismount(player) {
    this.isOccupied = false;
    player.x = this.x + (this.facing === 1 ? -10 : this.width + 10);
    player.y = this.y - player.height + 10;
    player.vy = -300;
    player.isGrounded = false;
    player.invulnerableTimer = 1.5;
  }

  update(dt, player, input, platforms, projectiles, enemies, particles, soundManager, camera) {
    this.animTime += dt;
    this.prevY = this.y;

    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.fireTimer > 0) this.fireTimer -= dt;
    if (this.recoilX !== 0) this.recoilX *= Math.exp(-dt * 18);

    // If destroyed, handle expulsion of player
    if (this.isDestroyed) {
      if (this.isOccupied && player) {
        this.isOccupied = false;
        player.x = this.x + this.width / 2 - player.width / 2;
        player.y = this.y - 40;
        player.vy = -500;
        player.isGrounded = false;
        player.invulnerableTimer = 2.5;
      }
      return;
    }

    // 1. ENTRY / EXIT INTERACTION
    if (!this.isOccupied && player && !player.isDead) {
      const dist = Math.hypot(player.x + player.width / 2 - (this.x + this.width / 2), player.y + player.height / 2 - (this.y + this.height / 2));
      if (dist < 80 && input.isJustPressed('vehicle')) {
        this.mount(player);
        soundManager.playWeaponPickup('HMG');
        if (particles) {
          particles.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 16, '#FDE047');
        }
      }
    } else if (this.isOccupied && player) {
      if (input.isJustPressed('vehicle')) {
        this.dismount(player);
        return;
      }
    }

    // 2. MOUNTED TANK CONTROLS & PHYSICS
    if (this.isOccupied && player) {
      const moveLeft = input.isDown('left');
      const moveRight = input.isDown('right');
      const jumpPressed = input.isJustPressed('jump');
      const isShooting = input.isDown('shoot');

      if (moveLeft) {
        this.vx = -this.speed;
        this.facing = -1;
        this.treadAnim -= dt * 18;
      } else if (moveRight) {
        this.vx = this.speed;
        this.facing = 1;
        this.treadAnim += dt * 18;
      } else {
        this.vx *= Math.pow(0.01, dt);
        if (Math.abs(this.vx) < 10) this.vx = 0;
      }

      if (jumpPressed && this.isGrounded) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        soundManager.playJump();
        if (camera) camera.shake(6, 0.2);
        if (particles) {
          particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height, 6, '#FFFFFF');
        }
      }

      // Cannon Shooting
      if (isShooting && this.fireTimer <= 0) {
        this.fireCannon(projectiles, particles, soundManager, camera);
      }

      // Keep player synced with tank
      player.x = this.x + this.width / 2 - player.width / 2;
      player.y = this.y + 10;
      player.facing = this.facing;
    } else {
      this.vx *= Math.pow(0.01, dt);
      if (Math.abs(this.vx) < 10) this.vx = 0;
    }

    // 3. GRAVITY & PLATFORMS
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.isGrounded = false;
    Physics.resolvePlatforms(this, platforms);

    // 4. HYDRAULIC JUMP SQUASH CRUSH ON ENEMIES
    if (this.vy > 100 && enemies) {
      for (const enemy of enemies) {
        if (!enemy.dead && Physics.checkAABB(this, enemy)) {
          enemy.takeDamage(100, particles, soundManager, this.x);
          if (camera) camera.shake(10, 0.3);
          this.vy = -260; // Hydraulic bounce
          if (particles) {
            particles.emitSyrupSplash(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 20, '#EF4444');
          }
        }
      }
    }
  }

  fireCannon(projectiles, particles, soundManager, camera) {
    this.fireTimer = this.fireRate;
    this.recoilX = -8 * this.facing;
    soundManager.playRocketLaunch();
    if (camera) camera.shake(12, 0.35);

    const cannonX = this.x + (this.facing === 1 ? this.width : 0);
    const cannonY = this.y + 24;

    // Heavy Ice Cream Cannon Shell
    projectiles.push(
      new Projectile({
        x: cannonX,
        y: cannonY,
        vx: this.facing * 750,
        vy: -20,
        type: 'ROCKET',
        damage: 85,
        isPlayer: true
      })
    );

    if (particles) {
      particles.emitSugarSmoke(cannonX, cannonY, 8, '#FDE68A');
      particles.emitSodaBubbles(cannonX, cannonY, 6);
    }
  }

  draw(ctx) {
    if (this.isDestroyed) return;

    ctx.save();
    const cx = this.x + this.width / 2;
    const bottomY = this.y + this.height;

    // 1. Soft Ground Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, bottomY + 3, 44, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fill();
    ctx.restore();

    // 2. Transform with Bottom-Center Pivot
    ctx.translate(cx + this.recoilX, bottomY);

    if (this.hurtTimer > 0) {
      ctx.filter = 'brightness(2.2)';
    }

    const renderW = 100;
    const renderH = 74;

    // Draw Tank Body flipped according to facing direction (tanque.png points left in asset)
    ctx.save();
    ctx.scale(-this.facing, 1);

    const tankSprite = imageLoader.getImage('tanque');

    if (tankSprite && tankSprite.complete && tankSprite.naturalWidth > 0) {
      // Draw Tank Sprite anchored at bottom-center: (-renderW / 2, -renderH)
      ctx.drawImage(tankSprite, -renderW / 2, -renderH, renderW, renderH);
    } else {
      // Procedural Tank Fallback
      ctx.beginPath();
      ctx.roundRect(-45, -renderH + 18, 90, 48, 12);
      ctx.fillStyle = '#0284C7';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Turret Barrel
      ctx.fillStyle = '#FF77B0';
      ctx.fillRect(-15 - 38, -renderH + 28, 38, 14);
    }
    ctx.restore();

    // 3. Floating "IN / [E] ENTRAR" Badge when unoccupied (never mirrored)
    if (!this.isOccupied) {
      const bob = Math.sin(this.animTime * 6) * 4;
      ctx.save();
      ctx.translate(0, -renderH - 12 + bob);

      ctx.beginPath();
      ctx.roundRect(-24, -12, 48, 22, 8);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IN [E]', 0, 3);
      ctx.restore();
    }

    ctx.restore();
  }
}
