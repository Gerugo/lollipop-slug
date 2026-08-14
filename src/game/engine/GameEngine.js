import { Player } from '../entities/Player.js';
import { ParticleSystem } from '../entities/ParticleSystem.js';
import { soundManager } from '../audio/SoundManager.js';
import { InputManager } from './InputManager.js';
import { Camera } from './Camera.js';
import { Physics } from './Physics.js';
import { Level1 } from '../level/Level1.js';
import { WEAPON_TYPES } from '../entities/Weapons.js';
import { imageLoader } from './ImageLoader.js';

export class GameEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;

    // Viewport Virtual Dimensions (16:9 Standard)
    this.viewportWidth = 960;
    this.viewportHeight = 540;

    // Core Managers
    this.input = new InputManager();
    this.sound = soundManager;
    this.camera = new Camera(this.viewportWidth, this.viewportHeight);
    this.particles = new ParticleSystem();

    // Game State
    this.state = 'MENU';
    this.difficulty = 'NORMAL';
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('lollipop_slug_highscore') || '0', 10);
    this.rescuedHostages = 0;
    this.gameTime = 0;
    this.lastTime = 0;
    this.animFrameId = null;

    // Entities (Safely initialized for MENU preview & background rendering)
    this.level = new Level1();
    this.player = new Player(100, 350);
    this.vehicle = null;
    this.enemies = [];
    this.hostages = [];
    this.destructibles = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.grenades = [];
    this.drops = [];
    this.boss = null;
    this.respawnTimer = 0;

    // Cinematic Boss Intro State
    this.bossIntroTimer = 0;
    this.isBossIntroActive = false;

    // Candy Rain Mini-Event
    this.candyRainTimer = 25; // First event after 25s
    this.candyRainDuration = 0;

    this.loop = this.loop.bind(this);
  }

  start() {
    if (this.input) {
      if (typeof this.input.init === 'function') this.input.init();
      else if (typeof this.input.attach === 'function') this.input.attach();
    }
    if (this.sound && typeof this.sound.init === 'function') {
      this.sound.init();
    }
    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  startNewGame() {
    this.level = new Level1();
    this.camera.setBounds(this.level.width, this.level.height);
    this.camera.x = 0;
    this.camera.unlock();
    this.camera.setZoom(1.0);

    this.player = new Player(100, 350);
    this.player.reset(100, 350);

    this.vehicle = this.level.createVehicle();
    this.enemies = this.level.createEnemies();
    this.hostages = this.level.createHostages();
    this.destructibles = this.level.createDestructibles();
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.grenades = [];
    this.drops = [];
    this.boss = null;
    this.bossIntroTimer = 0;
    this.isBossIntroActive = false;
    this.candyRainTimer = 22;
    this.candyRainDuration = 0;

    this.score = 0;
    this.rescuedHostages = 0;
    this.gameTime = 0;
    this.respawnTimer = 0;
    this.particles.clear();

    this.setState('PLAYING');
    this.sound.startBGM('level');
    this.sound.playMissionStart();
  }

  setDifficulty(diff) {
    this.difficulty = diff;
  }

  setState(newState) {
    this.state = newState;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(newState);
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.setState('PAUSED');
      this.sound.stopBGM();
    } else if (this.state === 'PAUSED') {
      this.setState('PLAYING');
      this.sound.startBGM(this.boss ? 'boss' : 'level');
    }
  }

  loop(currentTime) {
    try {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
      this.lastTime = currentTime;

      if (this.state === 'PLAYING') {
        this.update(dt);
      }

      this.render();

      if (this.callbacks.onHUDUpdate && this.player) {
        this.callbacks.onHUDUpdate({
          hp: this.player.hp,
          maxHp: this.player.maxHp,
          lives: this.player.lives,
          score: this.score,
          highScore: this.highScore,
          gameTime: Math.floor(this.gameTime),
          weapon: this.player.currentWeapon,
          ammo: this.player.ammo,
          grenades: this.player.grenades,
          vehicleArmor: this.vehicle && this.vehicle.isOccupied ? this.vehicle.armor : null,
          maxVehicleArmor: this.vehicle ? this.vehicle.maxArmor : 5,
          boss: this.boss ? {
            name: this.boss.name,
            hp: this.boss.hp,
            maxHp: this.boss.maxHp,
            phase: this.boss.phase
          } : null
        });
      }
    } catch (loopErr) {
      console.error('[GameEngine] Protected loop error:', loopErr);
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  }

  update(dt) {
    this.gameTime += dt;
    this.level.update(dt);

    const currentBiome = this.level.getCurrentBiome(this.player ? this.player.x : 0);

    // 1. DYNAMIC PLATFORMS UPDATE (Moving, Sinking, Trampolines)
    Physics.updatePlatforms(this.level.platforms, dt, this.particles, this.sound);

    // 2. CANDY RAIN MINI-EVENT
    this.candyRainTimer -= dt;
    if (this.candyRainTimer <= 0) {
      this.candyRainTimer = 35 + Math.random() * 20;
      this.candyRainDuration = 6.0;
      this.sound.playCandyPickup();
    }
    if (this.candyRainDuration > 0) {
      this.candyRainDuration -= dt;
      if (Math.random() < 0.3) {
        const dropX = this.camera.x + Math.random() * this.camera.viewportWidth;
        this.spawnDrop(dropX, -20, Math.random() < 0.4 ? 'ESTRELLA' : 'CANDY_BONUS');
      }
    }

    // 3. CINEMATIC BOSS INTRO & ARENA TRIGGER
    if (!this.boss && this.player.x >= this.level.bossTriggerX) {
      console.log('[GameEngine] Boss arena activated. Initiating cinematic entrance...');
      this.boss = this.level.createBoss();
      this.boss.y = -180; // Start falling from the sky!
      this.boss.vy = 400;
      this.camera.lockToArena(this.level.bossArenaLockX);
      this.camera.setZoom(1.15); // Cinematic focus zoom
      this.isBossIntroActive = true;
      this.bossIntroTimer = 3.0;
      this.sound.playBossAlarm();
    }

    if (this.isBossIntroActive) {
      this.bossIntroTimer -= dt;
      // Boss falling impact
      if (this.boss && this.boss.y < 230) {
        this.boss.y += this.boss.vy * dt;
        this.boss.vy += 800 * dt;
        if (this.boss.y >= 230) {
          this.boss.y = 230;
          this.boss.vy = 0;
          // Grand entrance ground slam!
          this.camera.shake(28, 1.2);
          this.sound.playExplosion();
          this.particles.emitExplosionSprite(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height, 1.6);
          this.particles.emitShockwave(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height, 220, '#FF3388');
          this.particles.emitConfetti(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height, 50);
        }
      }

      if (this.bossIntroTimer <= 0) {
        this.isBossIntroActive = false;
        this.camera.setZoom(1.0);
        this.sound.startBGM('boss');
      }
    }

    // 4. UPDATE VEHICLE
    if (this.vehicle) {
      this.vehicle.update(
        dt,
        this.player,
        this.input,
        this.level.platforms,
        this.projectiles,
        this.enemies,
        this.particles,
        this.sound,
        this.camera
      );
    }

    // 5. UPDATE PLAYER (if not in vehicle and not locked in intro)
    if (!this.vehicle || !this.vehicle.isOccupied) {
      this.player.update(
        dt,
        this.isBossIntroActive ? { isDown: () => false, isJustPressed: () => false } : this.input,
        this.level.platforms,
        this.projectiles,
        this.grenades,
        this.particles,
        this.sound
      );
    }

    // Arena boundary clamp when camera is locked
    if (this.camera.locked) {
      this.player.x = Math.max(this.camera.x + 10, Math.min(this.level.width - this.player.width - 20, this.player.x));
    }

    if (this.player.isDead) {
      this.respawnTimer += dt;
      if (this.respawnTimer >= 2.0) {
        if (this.player.lives > 0) {
          const respawnX = Math.max(100, this.camera.x + 80);
          this.player.reset(respawnX, 200);
          this.respawnTimer = 0;
        } else {
          this.saveHighScore();
          this.setState('GAME_OVER');
          this.sound.stopBGM();
          return;
        }
      }
    }

    // 6. UPDATE CAMERA & AMBIENT PARTICLES
    this.camera.update(dt, this.player);
    this.particles.updateAmbient(dt, this.camera, currentBiome.id);

    // 7. UPDATE DESTRUCTIBLES
    for (const d of this.destructibles) {
      d.update(dt);
    }

    // 8. UPDATE PROJECTILES & PLATFORM CRUMBLE
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt);

      if (proj.isOffscreen(this.camera.x - 100, this.camera.x + this.camera.viewportWidth + 100, 540)) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check Destructibles hit
      let hit = false;
      for (const d of this.destructibles) {
        if (!d.dead && Physics.checkAABB(proj, d)) {
          d.takeDamage(proj.damage, this.particles, this.sound, this.drops);
          hit = true;
          break;
        }
      }
      if (hit) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check Platform impact crumble
      for (const plat of this.level.platforms) {
        if (Physics.checkAABB(proj, plat)) {
          this.particles.emitCrumble(proj.x, proj.y, 6, '#FDE68A');
          hit = true;
          break;
        }
      }
      if (hit && !proj.penetrate) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check Enemy hit
      for (const enemy of this.enemies) {
        if (!enemy.dead && Physics.checkAABB(proj, enemy)) {
          enemy.takeDamage(proj.damage, this.particles, this.sound, proj.x);
          if (enemy.dead) this.handleEnemyDeath(enemy);
          hit = true;
          if (!proj.penetrate) break;
        }
      }
      if (hit && !proj.penetrate) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check Boss hit
      if (this.boss && !this.boss.dead && !this.boss.isDefeated && !this.isBossIntroActive && Physics.checkAABB(proj, this.boss)) {
        this.boss.takeDamage(proj.damage, this.particles, this.sound, this.camera);
        if (proj.type === 'ROCKET') {
          this.explodeRocket(proj.x, proj.y);
        }
        if (!proj.penetrate) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Check Hostages rescue via bullet
      for (const hostage of this.hostages) {
        if (!hostage.isRescued && Physics.checkAABB(proj, hostage)) {
          hostage.rescue(this.particles, this.sound, this.drops);
          this.rescuedHostages++;
          this.addScore(1000);
        }
      }
    }

    // 9. UPDATE ENEMY PROJECTILES
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const eProj = this.enemyProjectiles[i];
      eProj.update(dt);

      if (eProj.isOffscreen(this.camera.x - 100, this.camera.x + this.camera.viewportWidth + 100, 540)) {
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      // Check Barricade absorption
      let blocked = false;
      for (const d of this.destructibles) {
        if (!d.dead && Physics.checkAABB(eProj, d)) {
          d.takeDamage(eProj.damage, this.particles, this.sound, this.drops);
          blocked = true;
          break;
        }
      }
      if (blocked) {
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      // Check Vehicle Armor hit
      if (this.vehicle && this.vehicle.isOccupied && !this.vehicle.isDestroyed && Physics.checkAABB(eProj, this.vehicle)) {
        this.vehicle.takeDamage(eProj.damage, eProj.x, this.particles, this.sound, this.camera);
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      // Check Player hit
      if (!this.player.isDead && Physics.checkAABB(eProj, this.player)) {
        this.player.takeDamage(eProj.damage, eProj.x, this.particles, this.sound, this.camera);
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // 10. UPDATE GRENADES
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.update(dt, this.level.platforms, this.particles, this.sound);

      if (g.exploded) {
        this.particles.emitExplosionSprite(g.x, g.y, 1.3);
        this.camera.shake(14, 0.4);
        for (const d of this.destructibles) {
          if (!d.dead && Physics.checkCircleAABB(g, d)) {
            d.takeDamage(50, this.particles, this.sound, this.drops);
          }
        }
        for (const enemy of this.enemies) {
          if (!enemy.dead && Physics.checkCircleAABB(g, enemy)) {
            enemy.takeDamage(g.damage, this.particles, this.sound, g.x);
            if (enemy.dead) this.handleEnemyDeath(enemy);
          }
        }
        for (const hostage of this.hostages) {
          if (!hostage.isRescued && Physics.checkCircleAABB(g, hostage)) {
            hostage.rescue(this.particles, this.sound, this.drops);
            this.rescuedHostages++;
            this.addScore(1000);
          }
        }
        if (this.boss && !this.boss.dead && !this.boss.isDefeated && !this.isBossIntroActive && Physics.checkCircleAABB(g, this.boss)) {
          this.boss.takeDamage(g.damage, this.particles, this.sound, this.camera);
        }

        this.grenades.splice(i, 1);
      }
    }

    // 11. UPDATE ENEMIES
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(
        dt,
        this.player,
        this.level.platforms,
        this.enemyProjectiles,
        this.particles,
        this.sound,
        this.camera
      );

      if (!enemy.dead) {
        if (this.vehicle && this.vehicle.isOccupied && !this.vehicle.isDestroyed && Physics.checkAABB(this.vehicle, enemy)) {
          this.vehicle.takeDamage(1, enemy.x, this.particles, this.sound, this.camera);
        } else if (!this.player.isDead && Physics.checkAABB(this.player, enemy)) {
          this.player.takeDamage(1, enemy.x + enemy.width / 2, this.particles, this.sound, this.camera);
        }
      }
    }

    // 12. UPDATE HOSTAGES
    for (const hostage of this.hostages) {
      hostage.update(dt, this.level.platforms, this.particles, this.sound, this.drops);
      if (!hostage.isRescued && !this.player.isDead && Physics.checkAABB(this.player, hostage)) {
        hostage.rescue(this.particles, this.sound, this.drops);
        this.rescuedHostages++;
        this.addScore(1000);
      }
    }

    // 13. UPDATE DROPS
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      drop.timer += dt;
      drop.vy += 750 * dt;
      drop.x += drop.vx * dt;
      drop.y += drop.vy * dt;

      for (const plat of this.level.platforms) {
        if (
          drop.x + drop.width > plat.x &&
          drop.x < plat.x + plat.width &&
          drop.y + drop.height >= plat.y &&
          drop.y + drop.height <= plat.y + 16 &&
          drop.vy > 0
        ) {
          drop.y = plat.y - drop.height;
          drop.vy = 0;
          drop.vx = 0;
          break;
        }
      }

      if (!this.player.isDead && Physics.checkAABB(this.player, drop)) {
        this.collectDrop(drop);
        this.drops.splice(i, 1);
      }
    }

    // 14. UPDATE BOSS
    if (this.boss) {
      if (!this.isBossIntroActive) {
        this.boss.update(
          dt,
          this.player,
          this.level.platforms,
          this.enemyProjectiles,
          this.enemies,
          this.particles,
          this.sound,
          this.camera
        );
      }

      if (this.boss.dead && this.state !== 'VICTORY') {
        this.addScore(10000);
        this.saveHighScore();
        this.setState('VICTORY');
        this.sound.stopBGM();
        this.sound.playMissionComplete();
      }
    }

    // 15. UPDATE PARTICLES
    this.particles.update(dt, this.level.platforms);
  }

  handleEnemyDeath(enemy) {
    this.addScore(100);
    const rand = Math.random();
    if (rand < 0.15) {
      this.spawnDrop(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'ESTRELLA');
    } else if (rand < 0.25) {
      this.spawnDrop(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'GRENADE');
    }
  }

  explodeRocket(x, y) {
    this.sound.playExplosion();
    this.camera.shake(16, 0.5);
    this.particles.emitExplosionSprite(x, y, 1.4);
    this.particles.emitShockwave(x, y, 90, '#FF3388');
    this.particles.emitSyrupSplash(x, y, 25, '#EF4444');
    this.particles.emitSugarSmoke(x, y, 12, '#FDE68A');

    for (const d of this.destructibles) {
      if (!d.dead && Math.hypot(d.x + d.width / 2 - x, d.y + d.height / 2 - y) < 85) {
        d.takeDamage(65, this.particles, this.sound, this.drops);
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.dead && Math.hypot(enemy.x + enemy.width / 2 - x, enemy.y + enemy.height / 2 - y) < 85) {
        enemy.takeDamage(70, this.particles, this.sound, x);
        if (enemy.dead) this.handleEnemyDeath(enemy);
      }
    }
  }

  spawnDrop(x, y, type) {
    this.drops.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 60,
      vy: -150,
      type,
      collected: false,
      timer: 0,
      width: 28,
      height: 28
    });
  }

  collectDrop(drop) {
    this.particles.emitSparkles(drop.x + 14, drop.y + 14, 16, '#FFDF6D');

    if (drop.type === 'HMG') {
      this.player.equipWeapon(WEAPON_TYPES.HMG);
      this.sound.playWeaponPickup('HMG');
      this.addScore(500);
    } else if (drop.type === 'SHOTGUN') {
      this.player.equipWeapon(WEAPON_TYPES.SHOTGUN);
      this.sound.playWeaponPickup('SHOTGUN');
      this.addScore(500);
    } else if (drop.type === 'ROCKET') {
      this.player.equipWeapon(WEAPON_TYPES.ROCKET);
      this.sound.playWeaponPickup('ROCKET');
      this.addScore(500);
    } else if (drop.type === 'GRENADE' || drop.type === 'G') {
      this.player.addGrenades(5);
      this.sound.playWeaponPickup('GRENADE');
      this.addScore(500);
    } else if (drop.type === 'ESTRELLA' || drop.type === 'CANDY_BONUS') {
      this.sound.playCandyPickup();
      if (this.player.hp < this.player.maxHp) {
        this.player.hp++;
      }
      this.addScore(2500);
    }
  }

  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  saveHighScore() {
    if (this.score >= this.highScore) {
      localStorage.setItem('lollipop_slug_highscore', this.highScore.toString());
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    // 1. Draw 3-Layer Parallax Biome Background
    this.level.drawBackground(ctx, this.camera);

    // 2. Apply Camera World Transform
    this.camera.applyTransform(ctx);

    // 3. Draw Level Platforms & Continuous Ground
    this.level.drawPlatforms(ctx, this.camera);

    // 4. Draw Destructibles (Barricades)
    for (const d of this.destructibles) {
      if (this.camera.isVisible(d.x, d.y, d.width, d.height)) {
        d.draw(ctx);
      }
    }

    // 5. Draw Hostages
    for (const hostage of this.hostages) {
      if (this.camera.isVisible(hostage.x, hostage.y, hostage.width, hostage.height)) {
        hostage.draw(ctx);
      }
    }

    // 6. Draw Vehicle (Lollipop Slug Tank)
    if (this.vehicle && this.camera.isVisible(this.vehicle.x, this.vehicle.y, this.vehicle.width, this.vehicle.height)) {
      this.vehicle.draw(ctx);
    }

    // 7. Draw Drops (Supply Crates & Candy Stars)
    for (const drop of this.drops) {
      if (this.camera.isVisible(drop.x, drop.y, drop.width, drop.height)) {
        this.drawDrop(ctx, drop);
      }
    }

    // 8. Draw Enemies
    for (const enemy of this.enemies) {
      if (this.camera.isVisible(enemy.x, enemy.y, enemy.width, enemy.height)) {
        enemy.draw(ctx);
      }
    }

    // 9. Draw Boss
    if (this.boss && this.camera.isVisible(this.boss.x, this.boss.y, this.boss.width, this.boss.height)) {
      this.boss.draw(ctx);
    }

    // 10. Draw Player (hidden when riding inside vehicle)
    if (this.player && (!this.vehicle || !this.vehicle.isOccupied)) {
      this.player.draw(ctx);
    }

    // 11. Draw Grenades & Projectiles
    for (const g of this.grenades) {
      g.draw(ctx);
    }
    for (const proj of this.projectiles) {
      proj.draw(ctx);
    }
    for (const eProj of this.enemyProjectiles) {
      eProj.draw(ctx);
    }

    // 12. Draw Particle System
    this.particles.draw(ctx);

    // 13. Restore Camera Transform
    this.camera.restoreTransform(ctx);

    // 14. Draw Cinematic Boss Warning Overlay (Screen Space)
    if (this.isBossIntroActive) {
      ctx.save();
      const flash = Math.floor(this.gameTime * 8) % 2 === 0;
      ctx.fillStyle = flash ? 'rgba(239, 68, 68, 0.4)' : 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(0, 80, this.viewportWidth, 90);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 24px "Bungee", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ ALERTA: THE GUMBALL MECH TITAN ⚠️', this.viewportWidth / 2, 130);

      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillText('¡PREPÁRATE PARA LA BATALLA!', this.viewportWidth / 2, 155);
      ctx.restore();
    }
  }

  drawDrop(ctx, drop) {
    ctx.save();
    const cx = drop.x + 14;
    const cy = drop.y + 14;
    const bob = Math.sin(drop.timer * 6) * 4;

    ctx.beginPath();
    ctx.ellipse(cx, drop.y + drop.height + 2, 14, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
    ctx.fill();

    ctx.translate(cx, cy + bob);

    if (drop.type === 'ESTRELLA' || drop.type === 'CANDY_BONUS') {
      ctx.rotate(drop.timer * 3.5);
      const starSprite = imageLoader.getImage('estrella');
      if (starSprite && starSprite.complete && starSprite.naturalWidth > 0) {
        ctx.drawImage(starSprite, -15, -15, 30, 30);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.fill();
      }
    } else {
      const cajaSprite = imageLoader.getImage('caja');
      if (cajaSprite && cajaSprite.complete && cajaSprite.naturalWidth > 0) {
        ctx.drawImage(cajaSprite, -15, -15, 30, 30);
      } else {
        ctx.beginPath();
        ctx.roundRect(-14, -14, 28, 28, 6);
        ctx.fillStyle = '#D97706';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      let label = 'H';
      let jellyColor = 'rgba(236, 72, 153, 0.9)';
      if (drop.type === 'SHOTGUN') {
        label = 'S';
        jellyColor = 'rgba(14, 165, 233, 0.9)';
      } else if (drop.type === 'ROCKET') {
        label = 'R';
        jellyColor = 'rgba(245, 158, 11, 0.9)';
      } else if (drop.type === 'GRENADE' || drop.type === 'G') {
        label = 'G';
        jellyColor = 'rgba(16, 185, 129, 0.9)';
      }

      const letterBob = Math.sin(drop.timer * 8) * 2;
      ctx.save();
      ctx.translate(0, -18 + letterBob);

      ctx.beginPath();
      ctx.roundRect(-10, -10, 20, 20, 5);
      ctx.fillStyle = jellyColor;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, 1);
      ctx.restore();
    }

    ctx.restore();
  }
}
