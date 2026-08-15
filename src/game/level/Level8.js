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
    this.drawContinuousGround(ctx, camera);
    this.drawFloatingPlatforms(ctx, camera);
  }

  drawContinuousGround(ctx, camera) {
    const groundPlatforms = this.platforms.filter((p) => p.y >= 440);

    for (const plat of groundPlatforms) {
      const startX = plat.x;
      const endX = plat.x + plat.width;
      const topY = plat.y;
      const bottomY = this.height;

      if (endX < camera.x - 80 || startX > camera.x + camera.viewportWidth + 80) continue;

      const biome = this.getCurrentBiome(startX + plat.width / 2);

      ctx.save();

      // BOILING CARAMEL LAVA BASIN AT FLOOR LEVEL
      if (plat.type === 'lava_caramel') {
        const lavaGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
        lavaGrad.addColorStop(0, '#FDE047');
        lavaGrad.addColorStop(0.2, '#EA580C');
        lavaGrad.addColorStop(1, '#7C2D12');
        ctx.fillStyle = lavaGrad;
        ctx.fillRect(startX, topY, plat.width, plat.height);

        for (let x = startX; x < endX; x += 32) {
          const bubbleY = topY + Math.sin(this.animTime * 6 + x) * 4;
          ctx.beginPath();
          ctx.arc(x + 16, bubbleY, 8, Math.PI, 0);
          ctx.fillStyle = '#FEF08A';
          ctx.fill();
        }
        ctx.restore();
        continue;
      }

      // Organic Bezier Ground Path
      ctx.beginPath();
      ctx.moveTo(startX, bottomY);
      ctx.lineTo(startX, topY + 18);
      ctx.quadraticCurveTo(startX, topY, startX + 18, topY);

      const step = 40;
      for (let curX = startX + 18; curX < endX - 18; curX += step) {
        const nextX = Math.min(endX - 18, curX + step);
        const midX = (curX + nextX) / 2;
        const wave = Math.sin(midX * 0.025) * 2.5;
        ctx.quadraticCurveTo(midX, topY + wave, nextX, topY);
      }

      ctx.lineTo(endX - 18, topY);
      ctx.quadraticCurveTo(endX, topY, endX, topY + 18);
      ctx.lineTo(endX, bottomY);
      ctx.closePath();

      const groundGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
      const cols = biome.groundGradient;
      groundGrad.addColorStop(0, cols[0]);
      groundGrad.addColorStop(0.2, cols[1]);
      groundGrad.addColorStop(0.5, cols[2]);
      groundGrad.addColorStop(1, cols[3]);
      ctx.fillStyle = groundGrad;
      ctx.fill();

      // 3D Clay Texture Overlay
      const sueloImg = imageLoader.getImage('suelo');
      if (sueloImg && sueloImg.complete && sueloImg.naturalWidth > 0) {
        ctx.save();
        ctx.clip();
        ctx.globalAlpha = 0.45;
        const tileW = 140;
        const tileH = 80;
        for (let tx = startX; tx < endX; tx += tileW) {
          ctx.drawImage(sueloImg, tx, topY, tileW, tileH);
        }
        ctx.restore();
      }

      // Molten Caramel Sugar Frosting Highlight
      ctx.beginPath();
      ctx.moveTo(startX + 6, topY + 4);
      for (let curX = startX + 18; curX < endX - 18; curX += step) {
        const nextX = Math.min(endX - 18, curX + step);
        const midX = (curX + nextX) / 2;
        const wave = Math.sin(midX * 0.025) * 2.5;
        ctx.quadraticCurveTo(midX, topY + wave + 4, nextX, topY + 4);
      }
      ctx.strokeStyle = biome.frostingColor || '#F59E0B';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.restore();
    }
  }

  drawFloatingPlatforms(ctx, camera) {
    const barquilloImg = imageLoader.getImage('barquillo');
    const bastonImg = imageLoader.getImage('baston');
    const floating = this.platforms.filter((p) => p.y < 440);

    for (const plat of floating) {
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
      // MOVING FLOATING CRUST PLATFORMS WITH 3D BISCUITS
      else if (plat.type === 'moving' || plat.type === 'wafer') {
        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, plat.x, plat.y, plat.width, plat.height);
        } else {
          ctx.fillStyle = '#78350F';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
          ctx.fill();
        }
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
        ctx.translate(0, sinkOffset);
        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, plat.x, plat.y, plat.width, plat.height);
        } else {
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
          ctx.fillStyle = '#451A03';
          ctx.fill();
        }
      }
      // CANDY CANE / VOLCANIC SPIRES
      else if (plat.type === 'candy_cane') {
        if (bastonImg && bastonImg.complete && bastonImg.naturalWidth > 0) {
          ctx.drawImage(bastonImg, plat.x, plat.y, plat.width, plat.height);
        } else {
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
          ctx.fillStyle = '#7C2D12';
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }
}
