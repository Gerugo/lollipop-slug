import { WEAPON_TYPES, Projectile, Grenade } from './Weapons.js';
import { Physics } from '../engine/Physics.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Player {
  constructor(x = 100, y = 300) {
    this.x = x;
    this.y = y;
    this.prevY = y;
    this.width = 44;
    this.height = 56;
    this.normalHeight = 56;
    this.crouchHeight = 34;

    this.vx = 0;
    this.vy = 0;
    this.speed = 270;
    this.jumpForce = -530;
    this.gravity = 1100;
    this.isGrounded = false;
    this.facing = 1; // 1 = right, -1 = left (always reinforced by input)

    // Aim and State
    this.aimUp = false;
    this.isCrouching = false;
    this.isDropping = false;
    this.dropTimer = 0;

    // Health and Lives
    this.maxHp = 3;
    this.hp = 3;
    this.lives = 3;
    this.invulnerableTimer = 0;
    this.invulnerableDuration = 1.5;
    this.isDead = false;

    // Arsenal & Ammo
    this.currentWeapon = WEAPON_TYPES.PISTOL;
    this.ammo = Infinity;
    this.fireTimer = 0;
    this.grenades = 10;
    this.grenadeTimer = 0;

    // Procedural Animation Variables
    this.animTime = 0;
    this.walkTimer = 0;
    this.stepArc = 0;
    this.rotation = 0;
    this.recoilX = 0;
    this.shootShake = 0;
    this.landSquashTimer = 0;
    this.isVictorious = false;
  }

  reset(x = 100, y = 300) {
    this.x = x;
    this.y = y;
    this.prevY = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.hp = this.maxHp;
    this.isDead = false;
    this.isGrounded = false;
    this.isDropping = false;
    this.dropTimer = 0;
    this.invulnerableTimer = 2.0;
    this.currentWeapon = WEAPON_TYPES.PISTOL;
    this.ammo = Infinity;
    this.grenades = 10;
    this.isVictorious = false;
    this.recoilX = 0;
    this.shootShake = 0;
    this.landSquashTimer = 0;
  }

  equipWeapon(weaponType) {
    this.currentWeapon = weaponType;
    this.ammo = weaponType.ammo;
    this.fireTimer = 0;
  }

  addGrenades(count = 5) {
    this.grenades += count;
  }

  takeDamage(amount = 1, fromX = 0, particles, soundManager, camera) {
    if (this.invulnerableTimer > 0 || this.isDead) return;

    this.hp -= amount;
    this.invulnerableTimer = this.invulnerableDuration;
    soundManager.playHurt();
    if (camera) camera.shake(9, 0.35);

    if (particles) {
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 12);
      particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height / 2, 6, 'rgba(255, 119, 176, 0.8)');
    }

    const knockDir = this.x < fromX ? -1 : 1;
    this.vx = knockDir * 200;
    this.vy = -240;
    this.isGrounded = false;

    if (this.hp <= 0) {
      this.die(particles, soundManager);
    }
  }

  die(particles, soundManager) {
    this.isDead = true;
    this.lives--;
    soundManager.playExplosion();
    if (particles) {
      particles.emitConfetti(this.x + this.width / 2, this.y + this.height / 2, 40);
      particles.emitCandyShards(this.x + this.width / 2, this.y + this.height / 2, 25);
    }
  }

  update(dt, input, platforms, projectiles, grenades, particles, soundManager) {
    this.animTime += dt;
    this.prevY = this.y;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }
    if (this.fireTimer > 0) {
      this.fireTimer -= dt;
    }
    if (this.grenadeTimer > 0) {
      this.grenadeTimer -= dt;
    }
    if (this.recoilX !== 0) {
      this.recoilX *= Math.exp(-dt * 18);
    }
    if (this.shootShake > 0) {
      this.shootShake = Math.max(0, this.shootShake - dt);
    }
    if (this.landSquashTimer > 0) {
      this.landSquashTimer = Math.max(0, this.landSquashTimer - dt);
    }

    // Drop through timer
    if (this.dropTimer > 0) {
      this.dropTimer -= dt;
      if (this.dropTimer <= 0) {
        this.isDropping = false;
      }
    }

    if (this.isDead) return;

    if (this.isVictorious) {
      this.vx = 0;
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      Physics.resolvePlatforms(this, platforms);
      return;
    }

    // 1. INPUT MOVEMENT & EXPLICIT FACING SYNC
    const moveLeft = input.isDown('left');
    const moveRight = input.isDown('right');
    const moveUp = input.isDown('up');
    const moveDown = input.isDown('down') || input.isDown('crouch');
    const jumpPressed = input.isJustPressed('jump');

    // Always update facing immediately based on horizontal input
    if (moveLeft && !moveRight) {
      this.facing = -1;
    } else if (moveRight && !moveLeft) {
      this.facing = 1;
    }

    // 2. CROUCH & AIM
    if (this.isGrounded && moveDown && !moveLeft && !moveRight) {
      this.isCrouching = true;
      this.height = this.crouchHeight;
    } else {
      this.isCrouching = false;
      this.height = this.normalHeight;
    }

    this.aimUp = moveUp;

    // 3. HORIZONTAL VELOCITY & STRIDE
    if (!this.isCrouching) {
      if (moveLeft) {
        this.vx = -this.speed;
        this.walkTimer += dt;
      } else if (moveRight) {
        this.vx = this.speed;
        this.walkTimer += dt;
      } else {
        this.vx *= Math.pow(0.01, dt);
        if (Math.abs(this.vx) < 10) {
          this.vx = 0;
          this.walkTimer = 0;
        }
      }
    } else {
      this.vx = 0;
      this.walkTimer = 0;
    }

    // Incline tilt & Stride arc
    const isRunning = Math.abs(this.vx) > 15 && this.isGrounded;
    this.rotation = isRunning ? (this.vx / this.speed) * 0.08 : 0;
    this.stepArc = isRunning ? Math.abs(Math.sin(this.walkTimer * 14)) * 3 : 0;

    // 4. PLATFORM DROP-THROUGH [DOWN + JUMP]
    if (moveDown && jumpPressed) {
      this.isDropping = true;
      this.dropTimer = 0.25;
      this.vy = 180;
      this.isGrounded = false;
    } 
    // 5. REGULAR JUMP
    else if (jumpPressed && this.isGrounded) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      soundManager.playJump();
      if (particles) {
        particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height, 4, '#FFFFFF');
      }
    }

    // 6. GRAVITY & PLATFORMS
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const wasGrounded = this.isGrounded;
    this.isGrounded = false;
    Physics.resolvePlatforms(this, platforms, this.isDropping);

    // Landing Impact Squash Trigger
    if (!wasGrounded && this.isGrounded) {
      this.landSquashTimer = 0.15;
      if (particles) {
        particles.emitSugarSmoke(this.x + this.width / 2, this.y + this.height, 3, '#FFE4E6');
      }
    }

    if (this.y > 600) {
      this.die(particles, soundManager);
    }

    // 7. SHOOTING
    const isShooting = this.currentWeapon.id === 'HMG' ? input.isDown('shoot') : input.isJustPressed('shoot');
    if (isShooting && this.fireTimer <= 0) {
      this.shoot(projectiles, particles, soundManager);
    }

    // 8. GRENADES
    if (input.isJustPressed('grenade') && this.grenades > 0 && this.grenadeTimer <= 0) {
      this.throwGrenade(grenades, particles, soundManager);
    }
  }

  shoot(projectiles, particles, soundManager) {
    this.fireTimer = this.currentWeapon.fireRate;
    this.recoilX = -4 * this.facing;
    this.shootShake = 0.06;

    const bulletSpeed = 680;
    let bulletVx = 0;
    let bulletVy = 0;
    let bulletX = this.x + this.width / 2;
    let bulletY = this.y + (this.isCrouching ? 28 : 20);

    if (this.aimUp) {
      if (this.vx !== 0) {
        // Diagonal shot while running
        bulletVx = this.facing * bulletSpeed * 0.707;
        bulletVy = -bulletSpeed * 0.707;
        bulletX += this.facing * 18;
        bulletY -= 14;
      } else {
        // Pure vertical upward shot
        bulletVx = 0;
        bulletVy = -bulletSpeed;
        bulletX += this.facing * 4;
        bulletY -= 20;
      }
    } else {
      // Horizontal shot strictly in facing direction
      bulletVx = this.facing * bulletSpeed;
      bulletVy = 0;
      bulletX += this.facing * 22;
    }

    const shotAngle = Math.atan2(bulletVy, bulletVx);

    if (this.currentWeapon.id === 'PISTOL') {
      soundManager.playPistol();
      projectiles.push(
        new Projectile({
          x: bulletX,
          y: bulletY,
          vx: bulletVx,
          vy: bulletVy,
          type: 'PISTOL',
          damage: 12,
          isPlayer: true,
          rotation: shotAngle
        })
      );
      if (particles) particles.emitSugarSmoke(bulletX, bulletY, 2, '#FFB6D9');
    } else if (this.currentWeapon.id === 'HMG') {
      soundManager.playHMG();
      const spread = (Math.random() - 0.5) * 35;
      projectiles.push(
        new Projectile({
          x: bulletX,
          y: bulletY,
          vx: bulletVx,
          vy: bulletVy + spread,
          type: 'HMG',
          damage: 14,
          penetrate: true,
          isPlayer: true,
          rotation: shotAngle
        })
      );
      this.ammo--;
    } else if (this.currentWeapon.id === 'SHOTGUN') {
      soundManager.playShotgun();
      const pelletCount = 6;
      for (let i = 0; i < pelletCount; i++) {
        const spreadAngle = shotAngle + ((i - (pelletCount - 1) / 2) * 0.12) + (Math.random() - 0.5) * 0.04;
        const speed = 640 + Math.random() * 80;
        projectiles.push(
          new Projectile({
            x: bulletX,
            y: bulletY,
            vx: Math.cos(spreadAngle) * speed,
            vy: Math.sin(spreadAngle) * speed,
            type: 'SHOTGUN',
            damage: 15,
            isPlayer: true,
            rotation: spreadAngle
          })
        );
      }
      if (particles) particles.emitCandyShards(bulletX, bulletY, 8);
      this.ammo--;
    } else if (this.currentWeapon.id === 'ROCKET') {
      soundManager.playRocketLaunch();
      projectiles.push(
        new Projectile({
          x: bulletX,
          y: bulletY,
          vx: bulletVx * 0.95,
          vy: bulletVy * 0.95,
          type: 'ROCKET',
          damage: 75,
          isPlayer: true,
          rotation: shotAngle
        })
      );
      this.ammo--;
    } else if (this.currentWeapon.id === 'LATIGO_DULCE') {
      soundManager.playEnemyPop();
      projectiles.push(
        new Projectile({
          x: bulletX + this.facing * 12,
          y: bulletY,
          vx: bulletVx * 0.75,
          vy: bulletVy * 0.75,
          type: 'LATIGO_DULCE',
          damage: 35,
          width: 32,
          height: 26,
          life: 0.38,
          penetrate: true,
          isPlayer: true,
          rotation: shotAngle
        })
      );
      if (particles) particles.emitSparkles(bulletX + this.facing * 14, bulletY, 8, '#A3E635');
      this.ammo--;
    } else if (this.currentWeapon.id === 'CANON_BURBUJAS') {
      soundManager.playSodaGrenadeFizz();
      projectiles.push(
        new Projectile({
          x: bulletX + this.facing * 10,
          y: bulletY,
          vx: bulletVx * 0.85,
          vy: bulletVy * 0.85,
          type: 'BUBBLE',
          damage: 42,
          width: 28,
          height: 28,
          life: 1.8,
          penetrate: false,
          isPlayer: true,
          rotation: shotAngle
        })
      );
      if (particles) particles.emitSodaBubbles(bulletX + this.facing * 12, bulletY, 6);
      this.ammo--;
    }

    if (this.ammo <= 0 && this.currentWeapon.id !== 'PISTOL') {
      this.currentWeapon = WEAPON_TYPES.PISTOL;
      this.ammo = Infinity;
    }
  }

  throwGrenade(grenades, particles, soundManager) {
    this.grenades--;
    this.grenadeTimer = 0.5;
    soundManager.playSodaGrenadeFizz();

    const gVx = this.facing * 340 + this.vx * 0.5;
    const gVy = this.aimUp ? -480 : -260;

    grenades.push(
      new Grenade({
        x: this.x + this.width / 2 + this.facing * 18,
        y: this.y + 10,
        vx: gVx,
        vy: gVy
      })
    );

    if (particles) particles.emitSodaBubbles(this.x + this.width / 2, this.y + 10, 5);
  }

  draw(ctx) {
    if (this.isDead) return;

    if (this.invulnerableTimer > 0 && Math.floor(this.animTime * 18) % 2 === 0) {
      return;
    }

    ctx.save();
    const cx = this.x + this.width / 2;
    const bottomY = this.y + this.height;

    // 1. Soft Elliptical Ground Shadow right under feet
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, bottomY + 1, 15, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fill();
    ctx.restore();

    // 2. Universal Bottom-Center Pivot Transformation anchored firmly on ground
    ctx.translate(cx + this.recoilX, bottomY + 1 - this.stepArc);
    ctx.rotate(this.rotation);

    // Calculate dynamic Squash & Stretch
    let scaleY = 1;
    let scaleX = 1;

    // Idle Breathing
    if (this.isGrounded && Math.abs(this.vx) <= 15) {
      scaleY = 1 + Math.sin(this.animTime * 4) * 0.03;
      scaleX = 1 - Math.sin(this.animTime * 4) * 0.03;
    } 
    // Jump Stretch (Ascending)
    else if (!this.isGrounded && this.vy < -50) {
      scaleY = 1.18;
      scaleX = 0.85;
    }

    // Landing Impact Squash (Lerp recovery in 0.15s)
    if (this.landSquashTimer > 0) {
      const t = this.landSquashTimer / 0.15;
      scaleY = 1 - (0.20 * t);
      scaleX = 1 + (0.20 * t);
    }

    // Flip horizontally when facing === -1 (perfect mirror with center pivot)
    ctx.scale(this.facing * scaleX, scaleY);

    const sprite = imageLoader.getImage('player');
    const renderH = 50;
    const renderW = 38;

    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      // Draw PNG Mascot Sprite anchored firmly at bottom-center: (-renderW / 2, -renderH)
      ctx.drawImage(sprite, -renderW / 2, -renderH, renderW, renderH);
    } else {
      ctx.beginPath();
      ctx.arc(0, -renderH / 2, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#FF77B0';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw Gun Overlay in Hand (aligned with facing direction)
    const gunX = this.aimUp ? 8 : 14;
    const gunY = this.aimUp ? -renderH + 16 : (this.isCrouching ? -renderH + 34 : -renderH + 28);

    ctx.save();
    ctx.translate(gunX, gunY);
    if (this.aimUp) ctx.rotate(-Math.PI / 2);

    let gunSpriteKey = 'arma_pistol';
    let gunW = 20;
    let gunH = 13;

    if (this.currentWeapon.id === 'HMG') {
      gunSpriteKey = 'arma_hmg';
      gunW = 26;
      gunH = 13;
    } else if (this.currentWeapon.id === 'SHOTGUN') {
      gunSpriteKey = 'arma_shotgun';
      gunW = 26;
      gunH = 11;
    } else if (this.currentWeapon.id === 'ROCKET') {
      gunSpriteKey = 'arma_rocket';
      gunW = 27;
      gunH = 14;
    } else if (this.currentWeapon.id === 'LATIGO_DULCE') {
      gunSpriteKey = 'arma_latigo';
      gunW = 22;
      gunH = 15;
    } else if (this.currentWeapon.id === 'CANON_BURBUJAS') {
      gunSpriteKey = 'arma_burbujas';
      gunW = 25;
      gunH = 16;
    }

    const gunSprite = imageLoader.getImage(gunSpriteKey);
    if (gunSprite && gunSprite.complete && gunSprite.naturalWidth > 0) {
      ctx.drawImage(gunSprite, -4, -gunH / 2, gunW, gunH);
    } else {
      ctx.fillStyle = '#FF5A9E';
      ctx.fillRect(-2, -3, 14, 6);
    }
    ctx.restore();

    ctx.restore();
  }
}
