import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Boss3 } from '../entities/Boss3.js';
import { SlugVehicle } from '../entities/SlugVehicle.js';
import { Destructible } from '../entities/Destructible.js';
import { imageLoader } from '../engine/ImageLoader.js';
import { LEVEL_3_CONFIG } from './Level3Config.js';

export class Level3 {
  constructor() {
    this.config = LEVEL_3_CONFIG;
    this.width = this.config.width;
    this.height = this.config.height;
    this.bossTriggerX = this.config.bossTriggerX;
    this.bossArenaLockX = this.config.bossArenaLockX;

    // Load platforms from data configuration
    this.platforms = JSON.parse(JSON.stringify(this.config.platforms));

    this.animTime = 0;
  }

  createEnemies() {
    // Escalar HP un +40% para el desafío del Nivel 3
    return this.config.enemies.map((e) => {
      const enemy = new Enemy(e);
      enemy.hp = Math.floor(enemy.hp * 1.35);
      return enemy;
    });
  }

  createHostages() {
    return this.config.hostages.map((h) => new Hostage(h));
  }

  createDestructibles() {
    return this.config.destructibles.map((d) => new Destructible(d));
  }

  createVehicle() {
    return new SlugVehicle(this.config.vehicle.x, this.config.vehicle.y);
  }

  createBoss() {
    return new Boss3(this.config.boss.x, this.config.boss.y);
  }

  getCurrentBiome(worldX) {
    for (const biome of this.config.biomes) {
      if (worldX >= biome.startX && worldX < biome.endX) {
        return biome;
      }
    }
    return this.config.biomes[0];
  }

  update(dt) {
    this.animTime += dt;
  }

  // --- 3-LAYER HIGH PERFORMANCE PARALLAX & BIOME SYSTEM ---
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

    // LAYER 1 (Distant Parallax 0.08): Cosmic Candy Factory Sky
    const skyImg = imageLoader.getImage('cielo3');
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

    // LAYER 2 (Mid Parallax 0.28): Cotton Candy Clouds & Chimneys
    const hillsImg = imageLoader.getImage('fabrica');
    if (hillsImg && hillsImg.complete && hillsImg.naturalWidth > 0) {
      const hillsAspect = hillsImg.naturalWidth / hillsImg.naturalHeight;
      const hillsH = Math.round(viewH * 0.75);
      const hillsRenderW = Math.round(hillsH * hillsAspect);
      const hillsOffsetX = Math.round((viewX * 0.28) % hillsRenderW);

      ctx.save();
      ctx.globalAlpha = 0.95;
      let startX = -hillsOffsetX;
      while (startX < viewW) {
        ctx.drawImage(hillsImg, startX, viewH - hillsH, hillsRenderW + 1, hillsH);
        startX += hillsRenderW;
      }
      ctx.restore();
    }

    // Biome A/C: Factory Steam Pipes overlay
    if (viewX < 2000 || (viewX + viewW > 4000 && viewX < 5800)) {
      ctx.save();
      ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
      for (let i = 0; i < 4; i++) {
        const px = ((viewX * 0.45 + i * 500) % (viewW + 200)) - 100;
        const py = 140 + Math.sin(this.animTime * 3 + i) * 20;
        ctx.beginPath();
        ctx.arc(px, py, 14 + Math.sin(this.animTime * 4 + i) * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // --- CONTINUOUS ORGANIC CLAY GROUND RENDERER & DYNAMIC PLATFORMS ---
  drawPlatforms(ctx, camera) {
    this.drawContinuousGround(ctx, camera);
    this.drawFloatingPlatforms(ctx, camera);
  }

  drawContinuousGround(ctx, camera) {
    const groundPlatforms = this.platforms.filter((p) => p.type === 'ground');

    for (const plat of groundPlatforms) {
      const startX = plat.x;
      const endX = plat.x + plat.width;
      const topY = plat.y;
      const bottomY = this.height;

      if (endX < camera.x - 80 || startX > camera.x + camera.viewportWidth + 80) {
        continue;
      }

      const biome = this.getCurrentBiome(startX + plat.width / 2);

      ctx.save();

      // 1. Continuous Organic Ground Path
      ctx.beginPath();
      ctx.moveTo(startX, bottomY);
      ctx.lineTo(startX, topY + 18);
      ctx.quadraticCurveTo(startX, topY, startX + 18, topY);

      const step = 45;
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

      // 2. Biome-Specific Smooth Ground Gradient (Fast & GPU Accelerated)
      const groundGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
      const cols = biome.groundGradient;
      groundGrad.addColorStop(0, cols[0]);
      groundGrad.addColorStop(0.2, cols[1]);
      groundGrad.addColorStop(0.5, cols[2]);
      groundGrad.addColorStop(1, cols[3]);
      ctx.fillStyle = groundGrad;
      ctx.fill();

      // 3. Optional Clay Texture Overlay without expensive filters
      const sueloImg = imageLoader.getImage('suelo');
      if (sueloImg && sueloImg.complete && sueloImg.naturalWidth > 0) {
        ctx.save();
        ctx.clip();
        ctx.globalAlpha = 0.22;
        const tileW = 140;
        const tileH = 80;
        for (let tx = startX; tx < endX; tx += tileW) {
          ctx.drawImage(sueloImg, tx, topY, tileW, tileH);
        }
        ctx.restore();
      }

      // 4. Marshmallow / Frosting Highlight on Top
      ctx.beginPath();
      ctx.moveTo(startX + 6, topY + 4);
      for (let curX = startX + 18; curX < endX - 18; curX += step) {
        const nextX = Math.min(endX - 18, curX + step);
        const midX = (curX + nextX) / 2;
        const wave = Math.sin(midX * 0.025) * 2.5;
        ctx.quadraticCurveTo(midX, topY + wave + 4, nextX, topY + 4);
      }
      ctx.strokeStyle = biome.frostingColor;
      ctx.lineWidth = 4;
      ctx.stroke();

      // 5. Sugar Sprinkles / Star Shards
      const flowerColors = ['#FEF08A', '#F472B6', '#38BDF8', '#C084FC', '#4ADE80'];
      for (let fx = startX + 24; fx < endX - 24; fx += 36) {
        if (fx < camera.x - 30 || fx > camera.x + camera.viewportWidth + 30) continue;

        const wave = Math.sin(fx * 0.025) * 2.5;
        const fy = topY + wave + 6;
        const fColor = flowerColors[Math.floor(fx / 36) % flowerColors.length];

        ctx.fillStyle = fColor;
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  drawFloatingPlatforms(ctx, camera) {
    const barquilloImg = imageLoader.getImage('barquillo') || imageLoader.getImage('plataforma-barquillo');
    const bastonImg = imageLoader.getImage('baston') || imageLoader.getImage('plataforma-baston');

    const floating = this.platforms.filter((p) => p.type !== 'ground');

    for (const plat of floating) {
      if (!camera.isVisible(plat.x, plat.y, plat.width, plat.height, 80)) continue;

      const drawY = plat.y + (plat.sinkY || 0);

      ctx.save();

      if (plat.type === 'sinking') {
        // Sinking Wafer Platform
        const shake = plat.isStandingOn ? (Math.random() - 0.5) * 3 : 0;
        ctx.translate(plat.x + shake, drawY);

        const waferGrad = ctx.createLinearGradient(0, 0, 0, plat.height);
        waferGrad.addColorStop(0, '#F472B6');
        waferGrad.addColorStop(1, '#9D174D');
        ctx.beginPath();
        ctx.roundRect(0, 0, plat.width, plat.height, 8);
        ctx.fillStyle = waferGrad;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (plat.sinkY > 10) {
          ctx.strokeStyle = '#500724';
          ctx.beginPath();
          ctx.moveTo(plat.width * 0.3, 0);
          ctx.lineTo(plat.width * 0.35, plat.height);
          ctx.moveTo(plat.width * 0.7, 0);
          ctx.lineTo(plat.width * 0.65, plat.height);
          ctx.stroke();
        }
      } else if (plat.type === 'bounce') {
        // Elastic Jelly Trampoline
        ctx.translate(plat.x, drawY);

        const bounceGrad = ctx.createLinearGradient(0, 0, 0, plat.height);
        bounceGrad.addColorStop(0, '#FBBF24');
        bounceGrad.addColorStop(0.5, '#F59E0B');
        bounceGrad.addColorStop(1, '#D97706');
        ctx.beginPath();
        ctx.roundRect(0, 0, plat.width, plat.height, 12);
        ctx.fillStyle = bounceGrad;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#1E1B4B';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ BOING ▲', plat.width / 2, plat.height - 7);
      } else if (plat.type === 'moving') {
        // Hovering Wafer with thrusters
        ctx.translate(plat.x, drawY);

        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, 0, 0, plat.width, plat.height);
        } else {
          const mGrad = ctx.createLinearGradient(0, 0, 0, plat.height);
          mGrad.addColorStop(0, '#E0E7FF');
          mGrad.addColorStop(1, '#6366F1');
          ctx.beginPath();
          ctx.roundRect(0, 0, plat.width, plat.height, 8);
          ctx.fillStyle = mGrad;
          ctx.fill();
        }

        // Sweet Thruster Bubbles underneath
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.arc(20, plat.height + 4, 4 + Math.sin(this.animTime * 12) * 2, 0, Math.PI * 2);
        ctx.arc(plat.width - 20, plat.height + 4, 4 + Math.sin(this.animTime * 12 + 1) * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (plat.type === 'wafer') {
        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, plat.x, drawY, plat.width, plat.height);
        } else {
          const waferGrad = ctx.createLinearGradient(0, drawY, 0, drawY + plat.height);
          waferGrad.addColorStop(0, '#FEF08A');
          waferGrad.addColorStop(1, '#F59E0B');
          ctx.beginPath();
          ctx.roundRect(plat.x, drawY, plat.width, plat.height, 8);
          ctx.fillStyle = waferGrad;
          ctx.fill();
          ctx.strokeStyle = '#B45309';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else if (plat.type === 'candy_cane') {
        if (bastonImg && bastonImg.complete && bastonImg.naturalWidth > 0) {
          ctx.drawImage(bastonImg, plat.x, drawY, plat.width, plat.height);
        } else {
          ctx.beginPath();
          ctx.roundRect(plat.x, drawY, plat.width, plat.height, 8);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = '#EC4899';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }
}
