import { LEVEL_5_CONFIG } from './Level5Config.js';
import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Destructible } from '../entities/Destructible.js';
import { SlugVehicle } from '../entities/SlugVehicle.js';
import { Boss5 } from '../entities/Boss5.js';
import { imageLoader } from '../engine/ImageLoader.js';

export class Level5 {
  constructor() {
    this.config = LEVEL_5_CONFIG;
    this.width = LEVEL_5_CONFIG.width;
    this.height = LEVEL_5_CONFIG.height;
    this.bossTriggerX = LEVEL_5_CONFIG.bossTriggerX;
    this.bossArenaLockX = LEVEL_5_CONFIG.bossArenaLockX;
    this.platforms = JSON.parse(JSON.stringify(LEVEL_5_CONFIG.platforms));
    this.groundPlatforms = this.platforms.filter((p) => p.y >= 440);
    this.floatingPlatforms = this.platforms.filter((p) => p.y < 440);
    this.biomes = LEVEL_5_CONFIG.biomes;
    this.animTime = 0;
    this.tideLevel = 0; // Oscillating soda swamp tide
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
    return new Boss5({
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
    // Rising & falling soda tide (oscillates by +/- 18px every 5s)
    this.tideLevel = Math.sin(this.animTime * 1.25) * 16;
  }

  drawBackground(ctx, camera) {
    const viewX = camera.x;
    const viewW = camera.viewportWidth;
    const viewH = camera.viewportHeight;

    const currentBiome = this.getCurrentBiome(viewX + viewW / 2);

    // 1. DYNAMIC ATMOSPHERIC SKY LAYER (Interpolated per Biome)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, viewH);
    const cols = currentBiome.skyGradient;
    skyGrad.addColorStop(0, cols[0]);
    skyGrad.addColorStop(0.5, cols[1]);
    skyGrad.addColorStop(1, cols[2]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, viewW, viewH);

    // LAYER 1 (Distant Parallax 0.08): Distant Fizzy Swamp Horizon ('cielo5')
    const skyImg = imageLoader.getImage('cielo5');
    if (skyImg && skyImg.complete && skyImg.naturalWidth > 0) {
      const skyAspect = skyImg.naturalWidth / skyImg.naturalHeight;
      const skyRenderW = Math.round(viewH * skyAspect);
      const skyOffsetX = Math.round((viewX * 0.08) % skyRenderW);

      ctx.save();
      ctx.globalAlpha = 0.92;
      let startX = -skyOffsetX;
      while (startX < viewW) {
        ctx.drawImage(skyImg, startX, 0, skyRenderW + 1, viewH);
        startX += skyRenderW;
      }
      ctx.restore();
    }

    // LAYER 2 (Midground Parallax 0.28): Swamp Reeds & Glowing Canes ('pantano')
    const midImg = imageLoader.getImage('pantano');
    if (midImg && midImg.complete && midImg.naturalWidth > 0) {
      const midAspect = midImg.naturalWidth / midImg.naturalHeight;
      const midH = Math.round(viewH * 0.75);
      const midRenderW = Math.round(midH * midAspect);
      const midOffsetX = Math.round((viewX * 0.28) % midRenderW);

      ctx.save();
      ctx.globalAlpha = 0.95;
      let startX = -midOffsetX;
      while (startX < viewW) {
        ctx.drawImage(midImg, startX, viewH - midH, midRenderW + 1, midH);
        startX += midRenderW;
      }
      ctx.restore();
    }

    // Ambient floating soda mist
    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.fillRect(0, viewH - 140, viewW, 140);
  }

  drawPlatforms(ctx, camera) {
    this.drawContinuousGround(ctx, camera);
    this.drawFloatingPlatforms(ctx, camera);
  }

  drawContinuousGround(ctx, camera) {
    const groundPlatforms = this.groundPlatforms;

    for (const plat of groundPlatforms) {
      const startX = plat.x;
      const endX = plat.x + plat.width;
      const topY = plat.y;
      const bottomY = this.height;

      if (endX < camera.x - 80 || startX > camera.x + camera.viewportWidth + 80) continue;

      const biome = this.getCurrentBiome(startX + plat.width / 2);

      ctx.save();

      // SODA TIDE HAZARD POOL AT FLOOR LEVEL
      if (plat.type === 'soda_tide') {
        const poolGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
        poolGrad.addColorStop(0, '#06B6D4');
        poolGrad.addColorStop(0.4, '#0D9488');
        poolGrad.addColorStop(1, '#042F2E');
        ctx.fillStyle = poolGrad;
        ctx.fillRect(startX, topY + this.tideLevel * 0.5, plat.width, plat.height);

        ctx.strokeStyle = '#A5F3FC';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = startX; x <= endX; x += 16) {
          const waveY = topY + this.tideLevel * 0.5 + Math.sin((x + this.animTime * 80) * 0.05) * 4;
          if (x === startX) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
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

      // Real 3D Clay Texture Overlay
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

      // Mint/Moss Sugar Frosting Glaze
      ctx.beginPath();
      ctx.moveTo(startX + 6, topY + 4);
      for (let curX = startX + 18; curX < endX - 18; curX += step) {
        const nextX = Math.min(endX - 18, curX + step);
        const midX = (curX + nextX) / 2;
        const wave = Math.sin(midX * 0.025) * 2.5;
        ctx.quadraticCurveTo(midX, topY + wave + 4, nextX, topY + 4);
      }
      ctx.strokeStyle = biome.frostingColor || '#5EEAD4';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.restore();
    }
  }

  drawFloatingPlatforms(ctx, camera) {
    const barquilloImg = imageLoader.getImage('barquillo');
    const bastonImg = imageLoader.getImage('baston');
    const floating = this.floatingPlatforms;

    for (const plat of floating) {
      if (!camera.isVisible(plat.x, plat.y - 20, plat.width, plat.height + 40)) continue;

      ctx.save();

      // SODA TIDE HAZARD POOL
      if (plat.type === 'soda_tide') {
        const poolGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        poolGrad.addColorStop(0, '#06B6D4');
        poolGrad.addColorStop(0.4, '#0D9488');
        poolGrad.addColorStop(1, '#042F2E');

        ctx.fillStyle = poolGrad;
        ctx.fillRect(plat.x, plat.y + this.tideLevel * 0.5, plat.width, plat.height);

        // Effervescent surface foam
        ctx.strokeStyle = '#A5F3FC';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = plat.x; x <= plat.x + plat.width; x += 16) {
          const waveY = plat.y + this.tideLevel * 0.5 + Math.sin((x + this.animTime * 80) * 0.05) * 4;
          if (x === plat.x) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
      }
      // WAFER PLATFORMS WITH 3D BISCUIT SPRITE
      else if (plat.type === 'wafer') {
        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, plat.x, plat.y, plat.width, plat.height);
        } else {
          ctx.fillStyle = '#78350F';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
          ctx.fill();
        }
      }
      // BOUNCE BUBBLE TRAMPOLINES
      else if (plat.type === 'bounce') {
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 12);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.85)';
        ctx.fill();
        ctx.strokeStyle = '#67E8F9';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(plat.x + plat.width / 2, plat.y + 6, plat.width * 0.35, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();
      }
      // SINKING LILYPAD PLATFORMS
      else if (plat.type === 'sinking') {
        const sinkOffset = plat.sinkOffset || 0;
        ctx.translate(0, sinkOffset);
        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, plat.x, plat.y, plat.width, plat.height);
        } else {
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
          ctx.fillStyle = '#059669';
          ctx.fill();
        }
      }
      // CANDY CANE / VINE POLES
      else if (plat.type === 'candy_cane') {
        if (bastonImg && bastonImg.complete && bastonImg.naturalWidth > 0) {
          ctx.drawImage(bastonImg, plat.x, plat.y, plat.width, plat.height);
        } else {
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
          ctx.fillStyle = '#0D9488';
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }
}
