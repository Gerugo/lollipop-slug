import { LEVEL_9_CONFIG } from './Level9Config.js';
import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Destructible } from '../entities/Destructible.js';
import { SlugVehicle } from '../entities/SlugVehicle.js';
import { Boss9 } from '../entities/Boss9.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Level9 {
  constructor() {
    this.config = LEVEL_9_CONFIG;
    this.width = LEVEL_9_CONFIG.width;
    this.height = LEVEL_9_CONFIG.height;
    this.bossTriggerX = LEVEL_9_CONFIG.bossTriggerX;
    this.bossArenaLockX = LEVEL_9_CONFIG.bossArenaLockX;
    this.platforms = LEVEL_9_CONFIG.platforms;
    this.biomes = LEVEL_9_CONFIG.biomes;
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
    return new Boss9({
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

    // LAYER 1: Distant Gothic Citadel & Blood Moon (factor: 0.15)
    const bgSky = imageLoader.getImage('cielo9');
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

    // LAYER 2: Dark Chocolate Battlements Parallax (factor: 0.40)
    const bgWalls = imageLoader.getImage('murallas');
    if (bgWalls && bgWalls.complete && bgWalls.naturalWidth > 0) {
      const imgW = bgWalls.naturalWidth;
      const imgH = bgWalls.naturalHeight;
      const scale = 0.9;
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const factor = 0.40;
      const offsetX = -(camera.x * factor) % drawW;
      const offsetY = vpH - drawH;

      for (let x = offsetX - drawW; x < vpW + drawW; x += drawW) {
        ctx.drawImage(bgWalls, x, offsetY, drawW, drawH);
      }
    }

    // LAYER 3: Ambient Dark Energy Particles
    for (let i = 0; i < 20; i++) {
      const sx = ((i * 67 + this.animTime * 20) % (vpW + 40)) - 20;
      const sy = ((i * 47 + this.animTime * 45) % (vpH - 40)) + 20;
      const sr = (i % 3) + 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(225, 29, 72, 0.7)' : 'rgba(147, 51, 234, 0.7)';
      ctx.fill();
    }
  }

  drawPlatforms(ctx, camera) {
    for (const plat of this.platforms) {
      if (!camera.isVisible(plat.x, plat.y - 20, plat.width, plat.height + 40)) continue;

      ctx.save();

      // RETRACTABLE SUGAR SPIKES TRAP
      if (plat.type === 'spikes') {
        // Base plate
        ctx.fillStyle = '#18181B';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

        // Sharp Spikes
        const spikeW = 18;
        const spikeCount = Math.floor(plat.width / spikeW);
        for (let i = 0; i < spikeCount; i++) {
          const sx = plat.x + i * spikeW;
          ctx.beginPath();
          ctx.moveTo(sx, plat.y);
          ctx.lineTo(sx + spikeW / 2, plat.y - 16);
          ctx.lineTo(sx + spikeW, plat.y);
          ctx.closePath();
          ctx.fillStyle = '#E11D48';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      // SOLID DARK CHOCOLATE GROUND
      else if (plat.type === 'ground') {
        const groundGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        groundGrad.addColorStop(0, '#27272A');
        groundGrad.addColorStop(0.3, '#18181B');
        groundGrad.addColorStop(1, '#09090B');

        ctx.fillStyle = groundGrad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Crimson Rune Border
        ctx.fillStyle = '#E11D48';
        ctx.fillRect(plat.x, plat.y, plat.width, 6);

        // Gothic runes
        ctx.strokeStyle = '#9333EA';
        ctx.lineWidth = 1.5;
        for (let x = plat.x + 25; x < plat.x + plat.width - 25; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, plat.y + 6);
          ctx.lineTo(x + 10, plat.y + 20);
          ctx.lineTo(x + 20, plat.y + 6);
          ctx.stroke();
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

        ctx.fillStyle = '#E11D48';
        ctx.fillRect(plat.x + 2, plat.y + 1, plat.width - 4, 3);
      }
      // ULTRA ELASTIC JELLY TRAMPOLINES
      else if (plat.type === 'elastic') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 12);
        ctx.fillStyle = 'rgba(225, 29, 72, 0.85)';
        ctx.fill();
        ctx.strokeStyle = '#FDA4AF';
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
        ctx.fillStyle = 'rgba(147, 51, 234, 0.85)';
        ctx.fill();
        ctx.strokeStyle = '#D8B4FE';
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
        ctx.fillStyle = '#18181B';
        ctx.fill();
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }
      // CANDY CANE / OBSIDIAN SPIRES
      else if (plat.type === 'candy_cane') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
        ctx.fillStyle = '#09090B';
        ctx.fill();
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
