import { Camera } from './Camera.js';
import { InputManager } from './InputManager.js';
import { ParticleSystem } from '../entities/ParticleSystem.js';
import { soundManager } from '../audio/SoundManager.js';
import { imageLoader } from './ImageLoader.js';
import { Player } from '../entities/Player.js';
import { Level1 } from '../level/Level1.js';
import { WEAPON_TYPES } from '../entities/Weapons.js';
import { Physics } from './Physics.js';

export class GameEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;

    this.viewportWidth = 960;
    this.viewportHeight = 540;

    this.camera = new Camera(this.viewportWidth, this.viewportHeight);
    this.input = new InputManager();
    this.particles = new ParticleSystem();
    this.sound = soundManager;

    this.level = new Level1();
    this.camera.setBounds(this.level.width, this.level.height);

    this.player = new Player(100, 380);
    this.enemies = [];
    this.hostages = [];
    this.boss = null;
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.grenades = [];
    this.drops = [];

    this.state = 'MENU';
    this.difficulty = 'NORMAL';

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('lollipop_slug_highscore') || '0', 10);
    this.rescuedHostages = 0;
    this.totalHostages = 5;
    this.gameTime = 0;

    this.lastTime = 0;
    this.animFrameId = null;
    this.running = false;

    this.respawnTimer = 0;
    this.victoryTimer = 0;

    this.input.attach();

    imageLoader.preloadAll().then(() => {
      console.log('[GameEngine] All sprite and background assets loaded successfully.');
    });
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    if (diff === 'EASY') {
      this.player.lives = 4;
      this.player.maxHp = 4;
      this.player.hp = 4;
    } else if (diff === 'HARD') {
      this.player.lives = 2;
      this.player.maxHp = 3;
      this.player.hp = 3;
    } else {
      this.player.lives = 3;
      this.player.maxHp = 3;
      this.player.hp = 3;
    }
  }

  startNewGame() {
    this.level = new Level1();
    this.camera.setBounds(this.level.width, this.level.height);
    this.camera.x = 0;
    this.camera.locked = false;

    this.player.reset(100, 380);
    this.setDifficulty(this.difficulty);

    this.enemies = this.level.createEnemies();
    this.hostages = this.level.createHostages();
    this.boss = null;

    this.projectiles = [];
    this.enemyProjectiles = [];
    this.grenades = [];
    this.drops = [];
    this.particles.clear();

    this.score = 0;
    this.rescuedHostages = 0;
    this.gameTime = 0;
    this.respawnTimer = 0;
    this.victoryTimer = 0;

    this.setState('PLAYING');
    this.sound.startBGM('stage');
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
      this.sound.startBGM(this.boss ? 'boss' : 'stage');
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.input.detach();
    this.sound.stopBGM();
  }

  loop(currentTime) {
    if (!this.running) return;

    try {
      const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
      this.lastTime = currentTime;

      this.input.update();

      if (this.input.isJustPressed('pause')) {
        this.togglePause();
      }

      if (this.state === 'PLAYING') {
        this.update(dt);
      }

      this.render();

      if (this.callbacks.onHUDUpdate) {
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

    // 1. Boss Arena Trigger & Camera Lock
    if (!this.boss && this.player.x >= this.level.bossTriggerX) {
      console.log('[GameEngine] Boss arena activated. Spawning Gumball Mech Titan...');
      this.boss = this.level.createBoss();
      this.camera.lockToArena(2640);
      this.sound.playBossAlarm();
      this.sound.startBGM('boss');
    }

    // 2. Update Player
    this.player.update(
      dt,
      this.input,
      this.level.platforms,
      this.projectiles,
      this.grenades,
      this.particles,
      this.sound
    );

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

    // 3. Update Camera
    this.camera.update(dt, this.player);

    // 4. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt, this.particles, this.level.platforms);

      if (proj.life <= 0 || proj.x < this.camera.x - 100 || proj.x > this.camera.x + this.viewportWidth + 100) {
        this.projectiles.splice(i, 1);
        continue;
      }

      for (const enemy of this.enemies) {
        if (!enemy.dead && !proj.hitEntities.has(enemy) && Physics.checkAABB(proj, enemy)) {
          enemy.takeDamage(proj.damage, this.particles, this.sound, proj.x);
          proj.hitEntities.add(enemy);

          if (enemy.dead) {
            this.handleEnemyDeath(enemy);
          }

          if (!proj.penetrate) {
            if (proj.type === 'ROCKET') {
              this.explodeRocket(proj.x, proj.y);
            }
            this.projectiles.splice(i, 1);
            break;
          }
        }
      }

      for (const hostage of this.hostages) {
        if (!hostage.isRescued && Physics.checkAABB(proj, hostage)) {
          hostage.rescue(this.particles, this.sound, this.drops);
          this.rescuedHostages++;
          this.addScore(1000);
          if (!proj.penetrate) {
            this.projectiles.splice(i, 1);
            break;
          }
        }
      }

      if (this.boss && !this.boss.dead && !this.boss.isDefeated && Physics.checkAABB(proj, this.boss)) {
        this.boss.takeDamage(proj.damage, this.particles, this.sound, this.camera);
        if (proj.type === 'ROCKET') {
          this.explodeRocket(proj.x, proj.y);
        }
        if (!proj.penetrate) {
          this.projectiles.splice(i, 1);
        }
      }
    }

    // 5. Update Enemy Projectiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const eProj = this.enemyProjectiles[i];
      eProj.update(dt, this.particles, this.level.platforms);

      if (eProj.life <= 0 || eProj.x < this.camera.x - 100 || eProj.x > this.camera.x + this.viewportWidth + 100) {
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      if (!this.player.isDead && Physics.checkAABB(eProj, this.player)) {
        this.player.takeDamage(eProj.damage, eProj.x, this.particles, this.sound, this.camera);
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // 6. Update Grenades
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.update(dt, this.level.platforms, this.particles, this.sound);

      if (g.exploded) {
        for (const enemy of this.enemies) {
          if (!enemy.dead && Physics.checkCircleAABB(g, enemy)) {
            enemy.takeDamage(g.damage, this.particles, this.sound, g.x);
            if (enemy.dead) {
              this.handleEnemyDeath(enemy);
            }
          }
        }
        for (const hostage of this.hostages) {
          if (!hostage.isRescued && Physics.checkCircleAABB(g, hostage)) {
            hostage.rescue(this.particles, this.sound, this.drops);
            this.rescuedHostages++;
            this.addScore(1000);
          }
        }
        if (this.boss && !this.boss.dead && !this.boss.isDefeated && Physics.checkCircleAABB(g, this.boss)) {
          this.boss.takeDamage(g.damage, this.particles, this.sound, this.camera);
        }

        this.grenades.splice(i, 1);
      }
    }

    // 7. Update Enemies
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

      if (!enemy.dead && !this.player.isDead && Physics.checkAABB(this.player, enemy)) {
        this.player.takeDamage(1, enemy.x + enemy.width / 2, this.particles, this.sound, this.camera);
      }
    }

    // 8. Update Hostages
    for (const hostage of this.hostages) {
      hostage.update(dt, this.level.platforms, this.particles, this.sound, this.drops);
      if (!hostage.isRescued && !this.player.isDead && Physics.checkAABB(this.player, hostage)) {
        hostage.rescue(this.particles, this.sound, this.drops);
        this.rescuedHostages++;
        this.addScore(1000);
      }
    }

    // 9. Update Drops
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      drop.timer += dt;
      drop.vy += 800 * dt;
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
          drop.vx *= 0.5;
        }
      }

      if (!drop.collected && !this.player.isDead && Physics.checkAABB(this.player, drop)) {
        drop.collected = true;
        this.collectDrop(drop);
        this.drops.splice(i, 1);
      }
    }

    // 10. Update Boss safely & Trigger Victory
    if (this.boss) {
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

      if (!this.boss.dead && !this.boss.isDefeated && !this.player.isDead && Physics.checkAABB(this.player, this.boss)) {
        this.player.takeDamage(1, this.boss.x + this.boss.width / 2, this.particles, this.sound, this.camera);
      }

      if (this.boss.dead && this.state === 'PLAYING') {
        this.victoryTimer += dt;
        if (this.victoryTimer > 1.8) {
          console.log('[GameEngine] Boss defeated! Victory triggered.');
          this.player.isVictorious = true;
          this.addScore(50000);
          this.saveHighScore();
          this.setState('VICTORY');
          this.sound.stopBGM();
        }
      }
    }

    // 11. Update Particle System
    this.particles.update(dt);
  }

  handleEnemyDeath(enemy) {
    this.addScore(enemy.scoreValue);
    const rand = Math.random();
    if (rand < 0.12) {
      // 12% Star bonus drop
      this.spawnDrop(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'ESTRELLA');
    } else if (rand < 0.20) {
      // 8% Apple grenade refill drop (total 20% drop chance)
      this.spawnDrop(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'GRENADE');
    }
  }

  explodeRocket(x, y) {
    this.sound.playExplosion();
    this.camera.shake(12, 0.4);
    this.particles.emitShockwave(x, y, 75, '#FF3388');
    this.particles.emitSyrupSplash(x, y, 22, '#EF4444');
    this.particles.emitSugarSmoke(x, y, 10, '#FDE68A');

    for (const enemy of this.enemies) {
      if (!enemy.dead && Math.hypot(enemy.x + enemy.width / 2 - x, enemy.y + enemy.height / 2 - y) < 80) {
        enemy.takeDamage(65, this.particles, this.sound, x);
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
      width: 26,
      height: 26
    });
  }

  collectDrop(drop) {
    this.particles.emitSparkles(drop.x + 13, drop.y + 13, 14, '#FFDF6D');

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
    } else if (drop.type === 'GRENADE') {
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

    // 1. Draw 2-Layer Seamless Parallax Background
    this.level.drawBackground(ctx, this.camera);

    // 2. Apply Camera World Transform
    this.camera.applyTransform(ctx);

    // 3. Draw Level Platforms & Ground
    this.level.drawPlatforms(ctx, this.camera);

    // 4. Draw Hostages
    for (const hostage of this.hostages) {
      if (this.camera.isVisible(hostage.x, hostage.y, hostage.width, hostage.height)) {
        hostage.draw(ctx);
      }
    }

    // 5. Draw Drops
    for (const drop of this.drops) {
      if (this.camera.isVisible(drop.x, drop.y, drop.width, drop.height)) {
        this.drawDrop(ctx, drop);
      }
    }

    // 6. Draw Enemies
    for (const enemy of this.enemies) {
      if (this.camera.isVisible(enemy.x, enemy.y, enemy.width, enemy.height)) {
        enemy.draw(ctx);
      }
    }

    // 7. Draw Boss
    if (this.boss && this.camera.isVisible(this.boss.x, this.boss.y, this.boss.width, this.boss.height)) {
      this.boss.draw(ctx);
    }

    // 8. Draw Player
    this.player.draw(ctx);

    // 9. Draw Grenades & Projectiles
    for (const g of this.grenades) {
      g.draw(ctx);
    }
    for (const proj of this.projectiles) {
      proj.draw(ctx);
    }
    for (const eProj of this.enemyProjectiles) {
      eProj.draw(ctx);
    }

    // 10. Draw Particle System
    this.particles.draw(ctx);

    // 11. Restore Camera Transform
    this.camera.restoreTransform(ctx);
  }

  drawDrop(ctx, drop) {
    ctx.save();
    const cx = drop.x + 13;
    const cy = drop.y + 13;
    const bob = Math.sin(drop.timer * 6) * 3;

    // Ground Shadow for Item
    ctx.beginPath();
    ctx.ellipse(cx, drop.y + drop.height + 2, 12, 3.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fill();

    ctx.translate(cx, cy + bob);

    if (drop.type === 'ESTRELLA' || drop.type === 'CANDY_BONUS') {
      // Rotating Star Collectible ('estrella.png')
      ctx.rotate(drop.timer * 3.5);
      const starSprite = imageLoader.getImage('estrella');
      if (starSprite && starSprite.complete && starSprite.naturalWidth > 0) {
        ctx.drawImage(starSprite, -14, -14, 28, 28);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    } else {
      // Weapon Upgrade Crate
      ctx.beginPath();
      ctx.roundRect(-13, -13, 26, 26, 6);
      let crateColor = '#FF5A9E';
      let label = 'H';
      if (drop.type === 'SHOTGUN') {
        crateColor = '#0284C7';
        label = 'S';
      } else if (drop.type === 'ROCKET') {
        crateColor = '#D97706';
        label = 'R';
      } else if (drop.type === 'GRENADE') {
        crateColor = '#059669';
        label = '💣';
      }

      ctx.fillStyle = crateColor;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, 0, 4);
    }

    ctx.restore();
  }
}
