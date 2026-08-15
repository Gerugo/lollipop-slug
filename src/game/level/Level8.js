import { LEVEL_8_CONFIG } from './Level8Config.js';
import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Destructible } from '../entities/Destructible.js';
import { SlugVehicle } from '../entities/SlugVehicle.js';
import { Boss8 } from '../entities/Boss8.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Level8 {
  constructor() {
    this.config = LEVEL_8_CONFIG;
    this.width = LEVEL_8_CONFIG.width;
    this.height = LEVEL_8_CONFIG.height;
    this.bossTriggerX = LEVEL_8_CONFIG.bossTriggerX;
    this.bossArenaLockX = LEVEL_8_CONFIG.bossArenaLockX;
    this.platforms = LEVEL_8_CONFIG.platforms;
    this.biomes = LEVEL_8_CONFIG.biomes;
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
    return new Boss8({
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

    // Update moving floating crust platforms
    for (const plat of this.platforms) {
      if (plat.type === 'moving' && plat.speedX) {
        plat.x += plat.speedX * dt;
        if (plat.x <= plat.minX) {
          plat.x = plat.minX;
          plat.speedX = Math.abs(plat.speedX);
        } else if (plat.x >= plat.maxX) {
          plat.x = plat.maxX;
          plat.speedX = -Math.abs(plat.speedX);
        }
      }
    }
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

    // LAYER 1: Distant Volcanic Cavern & Lava Falls (factor: 0.15)
    const bgSky = imageLoader.getImage('cielo8');
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

    // LAYER 2: Dark Chocolate Basalt Columns Parallax (factor: 0.40)
    const bgVolc = imageLoader.getImage('volcan');
    if (bgVolc && bgVolc.complete && bgVolc.naturalWidth > 0) {
      const imgW = bgVolc.naturalWidth;
      const imgH = bgVolc.naturalHeight;
      const scale = 0.9;
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const factor = 0.40;
      const offsetX = -(camera.x * factor) % drawW;
      const offsetY = vpH - drawH;

      for (let x = offsetX - drawW; x < vpW + drawW; x += drawW) {
        ctx.drawImage(bgVolc, x, offsetY, drawW, drawH);
      }
    }

    // LAYER 3: Ambient Heat Embers & Molten Sparkles
    for (let i = 0; i < 22; i++) {
      const sx = ((i * 61 + this.animTime * 30) % (vpW + 40)) - 20;
      const sy = vpH - ((i * 41 + this.animTime * 70) % (vpH - 60));
      const sr = (i % 3) + 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(245, 158, 11, 0.75)' : 'rgba(239, 68, 68, 0.75)';
      ctx.fill();
    }
  }

  drawPlatforms(ctx, camera) {
    for (const plat of this.platforms) {
      if (!camera.isVisible(plat.x, plat.y - 20, plat.width, plat.height + 40)) continue;

      ctx.save();

      // BOILING CARAMEL LAVA HAZARD
      if (plat.type === 'lava_caramel') {
        const lavaGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        lavaGrad.addColorStop(0, '#FDE047');
        lavaGrad.addColorStop(0.2, '#EA580C');
        lavaGrad.addColorStop(1, '#7C2D12');

        ctx.fillStyle = lavaGrad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Boiling surface bubbles
        for (let x = plat.x; x < plat.x + plat.width; x += 32) {
          const bubbleY = plat.y + Math.sin(this.animTime * 6 + x) * 4;
          ctx.beginPath();
          ctx.arc(x + 16, bubbleY, 8, Math.PI, 0);
          ctx.fillStyle = '#FEF08A';
          ctx.fill();
        }
      }
      // SOLID BASALT / DARK CHOCOLATE GROUND
      else if (plat.type === 'ground') {
        const groundGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        groundGrad.addColorStop(0, '#44403C');
        groundGrad.addColorStop(0.3, '#292524');
        groundGrad.addColorStop(1, '#0C0A09');

        ctx.fillStyle = groundGrad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Glowing Molten Amber Rim
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(plat.x, plat.y, plat.width, 6);

        // Fiery cracks
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1.5;
        for (let x = plat.x + 20; x < plat.x + plat.width - 20; x += 55) {
          ctx.beginPath();
          ctx.moveTo(x, plat.y + 6);
          ctx.lineTo(x + 12, plat.y + 22);
          ctx.stroke();
        }
      }
      // MOVING FLOATING CRUST PLATFORMS
      else if (plat.type === 'moving') {
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#EA580C';
        ctx.fillRect(plat.x + 4, plat.y + 1, plat.width - 8, 4);
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
      // BOUNCE TRAMPOLINES
      else if (plat.type === 'bounce') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 12);
        ctx.fillStyle = 'rgba(234, 88, 12, 0.85)';
        ctx.fill();
        ctx.strokeStyle = '#FDE047';
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
        ctx.fillStyle = '#451A03';
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }
      // CANDY CANE / VOLCANIC SPIRES
      else if (plat.type === 'candy_cane') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
        ctx.fillStyle = '#9A3412';
        ctx.fill();
        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
