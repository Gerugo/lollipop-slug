import { LEVEL_10_CONFIG } from './Level10Config.js';
import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Destructible } from '../entities/Destructible.js';
import { SlugVehicle } from '../entities/SlugVehicle.js';
import { Boss10 } from '../entities/Boss10.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Level10 {
  constructor() {
    this.config = LEVEL_10_CONFIG;
    this.width = LEVEL_10_CONFIG.width;
    this.height = LEVEL_10_CONFIG.height;
    this.bossTriggerX = LEVEL_10_CONFIG.bossTriggerX;
    this.bossArenaLockX = LEVEL_10_CONFIG.bossArenaLockX;
    this.platforms = LEVEL_10_CONFIG.platforms;
    this.biomes = LEVEL_10_CONFIG.biomes;
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
    return new Boss10({
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

    // LAYER 1: Distant Grand Throne Sanctum & Starlight Rosette (factor: 0.15)
    const bgSky = imageLoader.getImage('cielo10');
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

    // LAYER 2: Imperial Golden Arches & Chandeliers Parallax (factor: 0.40)
    const bgSanc = imageLoader.getImage('sanctum');
    if (bgSanc && bgSanc.complete && bgSanc.naturalWidth > 0) {
      const imgW = bgSanc.naturalWidth;
      const imgH = bgSanc.naturalHeight;
      const scale = 0.9;
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const factor = 0.40;
      const offsetX = -(camera.x * factor) % drawW;
      const offsetY = vpH - drawH;

      for (let x = offsetX - drawW; x < vpW + drawW; x += drawW) {
        ctx.drawImage(bgSanc, x, offsetY, drawW, drawH);
      }
    }

    // LAYER 3: Ambient Golden Cosmic Starlight Sparkles
    for (let i = 0; i < 24; i++) {
      const sx = ((i * 59 + this.animTime * 25) % (vpW + 40)) - 20;
      const sy = ((i * 37 + this.animTime * 50) % (vpH - 40)) + 20;
      const sr = (i % 3) + 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(250, 204, 21, 0.8)' : 'rgba(236, 72, 153, 0.8)';
      ctx.fill();
    }
  }

  drawPlatforms(ctx, camera) {
    for (const plat of this.platforms) {
      if (!camera.isVisible(plat.x, plat.y - 20, plat.width, plat.height + 40)) continue;

      ctx.save();

      // RETRACTABLE SUGAR SPIKES TRAP
      if (plat.type === 'spikes') {
        ctx.fillStyle = '#1C1917';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

        const spikeW = 18;
        const spikeCount = Math.floor(plat.width / spikeW);
        for (let i = 0; i < spikeCount; i++) {
          const sx = plat.x + i * spikeW;
          ctx.beginPath();
          ctx.moveTo(sx, plat.y);
          ctx.lineTo(sx + spikeW / 2, plat.y - 16);
          ctx.lineTo(sx + spikeW, plat.y);
          ctx.closePath();
          ctx.fillStyle = '#F59E0B';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      // SOLID IMPERIAL GOLDEN GROUND
      else if (plat.type === 'ground') {
        const groundGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        groundGrad.addColorStop(0, '#78350F');
        groundGrad.addColorStop(0.3, '#451A03');
        groundGrad.addColorStop(1, '#1C1917');

        ctx.fillStyle = groundGrad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Regal Gold Top Rim
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(plat.x, plat.y, plat.width, 7);

        // Starlight Diamond Inlays
        for (let x = plat.x + 20; x < plat.x + plat.width - 20; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, plat.y + 7);
          ctx.lineTo(x + 8, plat.y + 15);
          ctx.lineTo(x, plat.y + 23);
          ctx.lineTo(x - 8, plat.y + 15);
          ctx.closePath();
          ctx.fillStyle = '#FDE047';
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

        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(plat.x + 2, plat.y + 1, plat.width - 4, 3);
      }
      // ULTRA ELASTIC TRAMPOLINES
      else if (plat.type === 'elastic') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 12);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
        ctx.fill();
        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(plat.x + plat.width / 2, plat.y + 5, plat.width * 0.35, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
      }
      // BOUNCE TRAMPOLINES
      else if (plat.type === 'bounce') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 12);
        ctx.fillStyle = 'rgba(236, 72, 153, 0.85)';
        ctx.fill();
        ctx.strokeStyle = '#F472B6';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      // SINKING PLATFORMS
      else if (plat.type === 'sinking') {
        const sinkOffset = plat.sinkOffset || 0;
        ctx.save();
        ctx.translate(0, sinkOffset);

        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
        ctx.fillStyle = '#4C0519';
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }
      // CANDY CANE / GOLDEN COLUMNS
      else if (plat.type === 'candy_cane') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
        ctx.fillStyle = '#D97706';
        ctx.fill();
        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
