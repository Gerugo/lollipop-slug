import { Enemy } from '../entities/Enemy.js';
import { Hostage } from '../entities/Hostage.js';
import { Boss } from '../entities/Boss.js';
import { SlugVehicle } from '../entities/SlugVehicle.js';
import { Destructible } from '../entities/Destructible.js';
import { imageLoader } from '../engine/ImageLoader.js';
import { LEVEL_1_CONFIG } from './Level1Config.js';

export class Level1 {
  constructor() {
    this.config = LEVEL_1_CONFIG;
    this.width = this.config.width;
    this.height = this.config.height;
    this.bossTriggerX = this.config.bossTriggerX;
    this.bossArenaLockX = this.config.bossArenaLockX;

    // Load platforms from data configuration
    this.platforms = JSON.parse(JSON.stringify(this.config.platforms));

    this.animTime = 0;
  }

  createEnemies() {
    return this.config.enemies.map((e) => new Enemy(e));
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
    return new Boss(this.config.boss.x, this.config.boss.y);
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

  // --- 3-LAYER CINEMATIC PARALLAX & BIOME SYSTEM ---
  drawBackground(ctx, camera) {
    const viewX = camera.x;
    const viewW = camera.viewportWidth;
    const viewH = camera.viewportHeight;

    const currentBiome = this.getCurrentBiome(viewX + viewW / 2);

    // 1. DYNAMIC ATMOSPHERIC SKY LAYER (Interpolated per Biome)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, viewH);
    if (currentBiome.id === 'BIOME_B') {
      skyGrad.addColorStop(0, '#F472B6');
      skyGrad.addColorStop(0.5, '#FB7185');
      skyGrad.addColorStop(1, '#FDE047');
    } else if (currentBiome.id === 'BIOME_C') {
      skyGrad.addColorStop(0, '#6366F1');
      skyGrad.addColorStop(0.5, '#A855F7');
      skyGrad.addColorStop(1, '#F472B6');
    } else if (currentBiome.id === 'BIOME_ARENA') {
      skyGrad.addColorStop(0, '#0284C7');
      skyGrad.addColorStop(0.5, '#6366F1');
      skyGrad.addColorStop(1, '#EC4899');
    } else {
      skyGrad.addColorStop(0, '#93C5FD');
      skyGrad.addColorStop(0.5, '#BAE6FD');
      skyGrad.addColorStop(1, '#FEF08A');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, viewW, viewH);

    // LAYER 1 (Distant Parallax 0.05): Sky with 3D Sun
    const skyImg = imageLoader.getImage('cielo');
    if (skyImg && skyImg.complete && skyImg.naturalWidth > 0) {
      const skyAspect = skyImg.naturalWidth / skyImg.naturalHeight;
      const skyRenderW = viewH * skyAspect;
      const skyOffsetX = (viewX * 0.05) % skyRenderW;

      ctx.save();
      ctx.globalAlpha = 0.85;
      let startX = -skyOffsetX;
      while (startX < viewW) {
        ctx.drawImage(skyImg, startX, 0, skyRenderW + 1, viewH);
        startX += skyRenderW;
      }
      ctx.restore();
    }

    // LAYER 2 (Mid Parallax 0.30): Rolling Clay Hills & Chocolate Gears
    const hillsImg = imageLoader.getImage('colinas');
    if (hillsImg && hillsImg.complete && hillsImg.naturalWidth > 0) {
      const hillsAspect = hillsImg.naturalWidth / hillsImg.naturalHeight;
      const hillsH = viewH * 0.72;
      const hillsRenderW = hillsH * hillsAspect;
      const hillsOffsetX = (viewX * 0.30) % hillsRenderW;

      let startX = -hillsOffsetX;
      while (startX < viewW) {
        ctx.drawImage(hillsImg, startX, viewH - hillsH, hillsRenderW + 1, hillsH);
        startX += hillsRenderW;
      }
    }

    // Biome C Factory chocolate gears in mid-distance
    if (viewX + viewW > 3600 && viewX < 5400) {
      ctx.save();
      const gearX = (4200 - viewX * 0.30);
      const gearY = 180;
      this.drawChocolateGear(ctx, gearX, gearY, 70, this.animTime * 0.6);
      this.drawChocolateGear(ctx, gearX + 110, gearY + 30, 48, -this.animTime * 0.9);
      ctx.restore();
    }

    // Biome B Syrup Waterfalls in mid-distance
    if (viewX + viewW > 1900 && viewX < 3900) {
      ctx.save();
      const fallX = (2800 - viewX * 0.40);
      const fallGrad = ctx.createLinearGradient(fallX, 160, fallX + 60, 460);
      fallGrad.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
      fallGrad.addColorStop(0.5, 'rgba(225, 29, 72, 0.6)');
      fallGrad.addColorStop(1, 'rgba(159, 18, 57, 0.7)');
      ctx.fillStyle = fallGrad;
      ctx.fillRect(fallX, 160, 65, 300);

      // Bubbling shimmer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      for (let i = 0; i < 5; i++) {
        const by = 180 + ((this.animTime * 120 + i * 50) % 260);
        ctx.fillRect(fallX + 10 + i * 9, by, 6, 14);
      }
      ctx.restore();
    }
  }

  drawChocolateGear(ctx, x, y, radius, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / teeth);
      ctx.fillRect(-8, -radius - 12, 16, 14);
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(254, 243, 199, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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

      // Strict Viewport Culling
      if (endX < camera.x - 80 || startX > camera.x + camera.viewportWidth + 80) {
        continue;
      }

      const biome = this.getCurrentBiome(startX + plat.width / 2);

      ctx.save();

      // 1. Single Continuous Organic Bezier Ground Path
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

      // 2. Biome-Specific Pastel Clay Gradient
      const groundGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
      const cols = biome.groundGradient;
      groundGrad.addColorStop(0, cols[0]);
      groundGrad.addColorStop(0.2, cols[1]);
      groundGrad.addColorStop(0.5, cols[2]);
      groundGrad.addColorStop(1, cols[3]);
      ctx.fillStyle = groundGrad;
      ctx.fill();

      // 3. Marshmallow Frosting Glaze Highlight on Top
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

      // 4. Wildflowers & Sugar Sprinkles across the surface
      const flowerColors = ['#FF69B4', '#FBBF24', '#38BDF8', '#FFFFFF', '#C084FC'];
      for (let fx = startX + 24; fx < endX - 24; fx += 34) {
        if (fx < camera.x - 30 || fx > camera.x + camera.viewportWidth + 30) continue;

        const wave = Math.sin(fx * 0.025) * 2.5;
        const fy = topY + wave + 6;
        const fColor = flowerColors[Math.floor(fx / 34) % flowerColors.length];

        ctx.fillStyle = fColor;
        ctx.beginPath();
        ctx.arc(fx - 2, fy, 2, 0, Math.PI * 2);
        ctx.arc(fx + 2, fy, 2, 0, Math.PI * 2);
        ctx.arc(fx, fy - 2, 2, 0, Math.PI * 2);
        ctx.arc(fx, fy + 2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
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
        waferGrad.addColorStop(0, '#FDA4AF');
        waferGrad.addColorStop(1, '#E11D48');
        ctx.beginPath();
        ctx.roundRect(0, 0, plat.width, plat.height, 8);
        ctx.fillStyle = waferGrad;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Warning crumb crack lines if sinking
        if (plat.sinkY > 10) {
          ctx.strokeStyle = '#881337';
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
        bounceGrad.addColorStop(0, '#F43F5E');
        bounceGrad.addColorStop(0.5, '#FB7185');
        bounceGrad.addColorStop(1, '#9F1239');
        ctx.beginPath();
        ctx.roundRect(0, 0, plat.width, plat.height, 12);
        ctx.fillStyle = bounceGrad;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Trampoline Spring Stars
        ctx.fillStyle = '#FEF08A';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ BOING ▲', plat.width / 2, plat.height - 7);
      } else if (plat.type === 'moving') {
        // Hovering Wafer with dynamic thrusters
        ctx.translate(plat.x, drawY);

        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, 0, 0, plat.width, plat.height);
        } else {
          const mGrad = ctx.createLinearGradient(0, 0, 0, plat.height);
          mGrad.addColorStop(0, '#FEF3C7');
          mGrad.addColorStop(1, '#D97706');
          ctx.beginPath();
          ctx.roundRect(0, 0, plat.width, plat.height, 8);
          ctx.fillStyle = mGrad;
          ctx.fill();
        }

        // Sweet Thruster Bubbles underneath
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(20, plat.height + 4, 4 + Math.sin(this.animTime * 12) * 2, 0, Math.PI * 2);
        ctx.arc(plat.width - 20, plat.height + 4, 4 + Math.sin(this.animTime * 12 + 1) * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (plat.type === 'wafer') {
        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, plat.x, drawY, plat.width, plat.height);
        } else {
          const waferGrad = ctx.createLinearGradient(0, drawY, 0, drawY + plat.height);
          waferGrad.addColorStop(0, '#FEF3C7');
          waferGrad.addColorStop(1, '#D97706');
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
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }
}
