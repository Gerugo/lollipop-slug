import { LEVEL_7_CONFIG } from './Level7Config.js';
import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Destructible } from '../entities/Destructible.js';
import { SlugVehicle } from '../entities/SlugVehicle.js';
import { Boss7 } from '../entities/Boss7.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Level7 {
  constructor() {
    this.config = LEVEL_7_CONFIG;
    this.width = LEVEL_7_CONFIG.width;
    this.height = LEVEL_7_CONFIG.height;
    this.bossTriggerX = LEVEL_7_CONFIG.bossTriggerX;
    this.bossArenaLockX = LEVEL_7_CONFIG.bossArenaLockX;
    this.platforms = LEVEL_7_CONFIG.platforms;
    this.biomes = LEVEL_7_CONFIG.biomes;
    this.animTime = 0;
  }

  createEnemies() {
    return this.config.enemies.map(cfg => new Enemy(cfg));
  }

  createHostages() {
    return this.config.hostages.map(cfg => new Hostage(cfg));
  }

  createDestructibles() {
    return this.config.destructibles.map(cfg => new Destructible(cfg));
  }

  createVehicle() {
    if (!this.config.vehicle) return null;
    return new SlugVehicle(this.config.vehicle.x, this.config.vehicle.y);
  }

  createBoss() {
    if (!this.config.boss) return null;
    return new Boss7({
      x: this.config.boss.x,
      y: this.config.boss.y,
      hp: this.config.boss.hp,
      arenaLeft: this.bossArenaLockX,
      arenaRight: this.width
    });
  }

  getCurrentBiome(worldX) {
    for (const biome of this.biomes) {
      if (worldX >= biome.startX && worldX < biome.endX) {
        return biome;
      }
    }
    return this.biomes[this.biomes.length - 1];
  }

  update(dt) {
    this.animTime += dt;
  }

  drawBackground(ctx, camera) {
    const vpW = camera.viewportWidth;
    const vpH = camera.viewportHeight;

    const biome = this.getCurrentBiome(camera.x + vpW / 2);
    const grad = ctx.createLinearGradient(0, 0, 0, vpH);
    grad.addColorStop(0, biome.skyGradient[0]);
    grad.addColorStop(0.55, biome.skyGradient[1]);
    grad.addColorStop(1, biome.skyGradient[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, vpW, vpH);

    // LAYER 1: Distant Gummy Cavern Background (factor: 0.15)
    const bgSky = imageLoader.getImage('cielo7');
    if (bgSky && bgSky.complete && bgSky.naturalWidth > 0) {
      const imgW = bgSky.naturalWidth;
      const imgH = bgSky.naturalHeight;
      const scale = vpH / imgH;
      const drawW = imgW * scale;
      const factor = 0.15;
      const offsetX = -(camera.x * factor) % drawW;

      for (let x = offsetX - drawW; x < vpW + drawW; x += drawW) {
        ctx.drawImage(bgSky, x, 0, drawW, vpH);
      }
    }

    // LAYER 2: Translucent Gummy Pillars Parallax (factor: 0.40)
    const bgJelly = imageLoader.getImage('gelatina');
    if (bgJelly && bgJelly.complete && bgJelly.naturalWidth > 0) {
      const imgW = bgJelly.naturalWidth;
      const imgH = bgJelly.naturalHeight;
      const scale = 0.9;
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const factor = 0.40;
      const offsetX = -(camera.x * factor) % drawW;
      const offsetY = vpH - drawH;

      for (let x = offsetX - drawW; x < vpW + drawW; x += drawW) {
        ctx.drawImage(bgJelly, x, offsetY, drawW, drawH);
      }
    }

    // LAYER 3: Ambient Floating Jelly Sparkles
    for (let i = 0; i < 18; i++) {
      const sx = ((i * 73 + this.animTime * 25) % (vpW + 40)) - 20;
      const sy = ((i * 47 + Math.sin(this.animTime * 2 + i) * 20 + i * 30) % (vpH - 80)) + 40;
      const sr = (i % 3) + 2;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(251, 113, 133, 0.7)' : 'rgba(167, 243, 208, 0.7)';
      ctx.fill();
    }
  }

  drawPlatforms(ctx, camera) {
    for (const plat of this.platforms) {
      if (!camera.isVisible(plat.x, plat.y - 20, plat.width, plat.height + 40)) continue;

      ctx.save();

      // ULTRA ELASTIC JELLY PLATFORMS
      if (plat.type === 'elastic') {
        const bouncePulse = Math.sin(this.animTime * 6) * 2;

        const elGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        elGrad.addColorStop(0, '#FB7185');
        elGrad.addColorStop(0.35, '#E11D48');
        elGrad.addColorStop(1, '#881337');

        ctx.fillStyle = elGrad;
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y - bouncePulse, plat.width, plat.height + bouncePulse, 12);
        ctx.fill();
        ctx.strokeStyle = '#FDA4AF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Shiny Jelly Highlight
        ctx.beginPath();
        ctx.ellipse(plat.x + plat.width / 2, plat.y + 6 - bouncePulse, plat.width * 0.4, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();
      }
      // SOLID GUMMY GROUND
      else if (plat.type === 'ground') {
        const groundGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        groundGrad.addColorStop(0, '#E11D48');
        groundGrad.addColorStop(0.3, '#BE123C');
        groundGrad.addColorStop(1, '#4C0519');

        ctx.fillStyle = groundGrad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Neon Pink Gum Frosting on Top
        ctx.fillStyle = '#FDA4AF';
        ctx.fillRect(plat.x, plat.y, plat.width, 8);

        // Gum drops
        for (let x = plat.x; x < plat.x + plat.width; x += 28) {
          ctx.beginPath();
          ctx.arc(x + 14, plat.y + 8, 6, 0, Math.PI);
          ctx.fillStyle = '#F43F5E';
          ctx.fill();
        }
      }
      // WAFER PLATFORMS
      else if (plat.type === 'wafer') {
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
        ctx.fill();
        ctx.strokeStyle = '#FDE68A';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FB7185';
        ctx.fillRect(plat.x + 2, plat.y + 1, plat.width - 4, 3);
      }
      // STANDARD BOUNCE TRAMPOLINES
      else if (plat.type === 'bounce') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 12);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
        ctx.fill();
        ctx.strokeStyle = '#6EE7B7';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(plat.x + plat.width / 2, plat.y + 5, plat.width * 0.35, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
      }
      // SINKING PLATFORMS
      else if (plat.type === 'sinking') {
        const sinkOffset = plat.sinkOffset || 0;
        ctx.save();
        ctx.translate(0, sinkOffset);

        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
        ctx.fillStyle = '#9333EA';
        ctx.fill();
        ctx.strokeStyle = '#D8B4FE';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }
      // CANDY CANE / JELLY POLES
      else if (plat.type === 'candy_cane') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
        ctx.fillStyle = '#BE123C';
        ctx.fill();
        ctx.strokeStyle = '#FDA4AF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
