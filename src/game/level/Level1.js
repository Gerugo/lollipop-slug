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
    for (const plat of this.platforms) {
      if (plat.squashTimer > 0) {
        plat.squashTimer = Math.max(0, plat.squashTimer - dt);
      }
    }
  }

  // --- CONTINUOUS PROGRESSIVE HORIZONTAL ATMOSPHERIC PARALLAX SYSTEM ---
  getAtmosphere(worldX) {
    const zones = [
      { x: 0,    top: [147, 197, 253], mid: [186, 230, 253], bot: [254, 240, 138] }, // Bosque Amanecer
      { x: 1800, top: [147, 197, 253], mid: [186, 230, 253], bot: [254, 240, 138] },
      { x: 2500, top: [244, 114, 182], mid: [251, 113, 133], bot: [253, 224, 71] },  // Río Sirope
      { x: 3600, top: [244, 114, 182], mid: [251, 113, 133], bot: [253, 224, 71] },
      { x: 4200, top: [99, 102, 241],  mid: [168, 85, 247],  bot: [244, 114, 182] }, // Fábrica
      { x: 5100, top: [99, 102, 241],  mid: [168, 85, 247],  bot: [244, 114, 182] },
      { x: 5600, top: [2, 132, 199],   mid: [99, 102, 241],  bot: [236, 72, 153] },  // Arena Titán
      { x: 6400, top: [2, 132, 199],   mid: [99, 102, 241],  bot: [236, 72, 153] }
    ];

    const clampedX = Math.max(0, Math.min(6400, worldX));
    for (let i = 0; i < zones.length - 1; i++) {
      const z1 = zones[i];
      const z2 = zones[i + 1];
      if (clampedX >= z1.x && clampedX <= z2.x) {
        const factor = (clampedX - z1.x) / (z2.x - z1.x || 1);
        const lerpColor = (c1, c2) => `rgb(${Math.round(c1[0] + (c2[0] - c1[0]) * factor)}, ${Math.round(c1[1] + (c2[1] - c1[1]) * factor)}, ${Math.round(c1[2] + (c2[2] - c1[2]) * factor)})`;
        return {
          top: lerpColor(z1.top, z2.top),
          mid: lerpColor(z1.mid, z2.mid),
          bot: lerpColor(z1.bot, z2.bot)
        };
      }
    }
    return { top: '#93C5FD', mid: '#BAE6FD', bot: '#FEF08A' };
  }

  drawBackground(ctx, camera) {
    const viewX = camera.x;
    const viewW = camera.viewportWidth;
    const viewH = camera.viewportHeight;
    const centerWorldX = viewX + viewW / 2;

    // 1. DYNAMIC CONTINUOUS ATMOSPHERIC SKY (Continuous Smooth Interpolation)
    const atmo = this.getAtmosphere(centerWorldX);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, viewH);
    skyGrad.addColorStop(0, atmo.top);
    skyGrad.addColorStop(0.52, atmo.mid);
    skyGrad.addColorStop(1, atmo.bot);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, viewW, viewH);

    // LAYER 1: Distant Sky Panorama (Parallax 0.05)
    const skyImg = imageLoader.getImage('cielo');
    if (skyImg && skyImg.complete && skyImg.naturalWidth > 0) {
      const skyAspect = skyImg.naturalWidth / skyImg.naturalHeight;
      const skyRenderW = viewH * skyAspect;
      const skyOffsetX = (viewX * 0.05) % skyRenderW;

      ctx.save();
      ctx.globalAlpha = 0.55;
      let startX = -skyOffsetX;
      while (startX < viewW) {
        ctx.drawImage(skyImg, startX, 0, skyRenderW + 1, viewH);
        startX += skyRenderW;
      }
      ctx.restore();
    }

    // LAYER 2: Distant Horizon Landmarks by World Zone (Parallax 0.12)
    this.drawZoneLandmarks(ctx, viewX, viewW, viewH);

    // LAYER 3: Mid Parallax (0.30): Rolling Clay Hills
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

    // Microscopic Sparkling Diamond Sugar Crystals over green hills
    this.drawHillSugarSparkles(ctx, viewX, viewW, viewH);
  }

  // --- ATMOSPHERIC LANDMARKS ANCHORED PER ZONE (PARALLAX 0.15) ---
  drawZoneLandmarks(ctx, viewX, viewW, viewH) {
    // --- ZONE 1: EL BOSQUE DE PIRULETAS (x: 0 - 2200) ---
    if (viewX < 2400) {
      // 1. Radiant Morning Sun (Anchor: World X = 350)
      const sunScreenX = (350 - viewX * 0.04);
      const sunScreenY = 75;
      if (sunScreenX > -150 && sunScreenX < viewW + 150) {
        ctx.save();
        // Pulsating Sun Corona
        const sunCorona = ctx.createRadialGradient(sunScreenX, sunScreenY, 15, sunScreenX, sunScreenY, 70);
        sunCorona.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
        sunCorona.addColorStop(0.5, 'rgba(251, 191, 36, 0.35)');
        sunCorona.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = sunCorona;
        ctx.beginPath();
        ctx.arc(sunScreenX, sunScreenY, 70, 0, Math.PI * 2);
        ctx.fill();

        // Sun Core
        ctx.fillStyle = '#FFFBEB';
        ctx.beginPath();
        ctx.arc(sunScreenX, sunScreenY, 22, 0, Math.PI * 2);
        ctx.fill();

        // 12 Rotating Sun Rays
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
        ctx.lineWidth = 2.5;
        const rayAngle = this.animTime * 0.25;
        for (let r = 0; r < 12; r++) {
          const a = rayAngle + (r * Math.PI * 2) / 12;
          ctx.beginPath();
          ctx.moveTo(sunScreenX + Math.cos(a) * 26, sunScreenY + Math.sin(a) * 26);
          ctx.lineTo(sunScreenX + Math.cos(a) * 58, sunScreenY + Math.sin(a) * 58);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Distant Wafer Windmill (Anchor: World X = 950)
      const millScreenX = (950 - viewX * 0.15);
      const millScreenY = 175;
      if (millScreenX > -80 && millScreenX < viewW + 80) {
        this.drawWaferWindmill(ctx, millScreenX, millScreenY, 40);
      }

      // 3. Giant Horizon Lollipop Trees (Anchor: World X = 1450, 1850)
      [1450, 1850].forEach((lx, idx) => {
        const lScreenX = (lx - viewX * 0.15);
        if (lScreenX > -60 && lScreenX < viewW + 60) {
          this.drawHorizonLollipop(ctx, lScreenX, 190 + idx * 10, 32 + idx * 6, idx % 2 === 0 ? '#EC4899' : '#3B82F6');
        }
      });
    }

    // --- ZONE 2: EL RÍO DE SIROPE (x: 2000 - 4000) ---
    if (viewX + viewW > 1800 && viewX < 4200) {
      // 1. Distant Red Sugar Rock Mountain Silhouettes
      [2200, 2700, 3300].forEach((mx, idx) => {
        const mScreenX = (mx - viewX * 0.12);
        if (mScreenX > -150 && mScreenX < viewW + 150) {
          this.drawSugarMountain(ctx, mScreenX, 160, 160 + idx * 30, 140, '#9F1239');
        }
      });

      // 2. Molten Strawberry Syrup Waterfalls in mid-distance
      const fallScreenX = (2900 - viewX * 0.20);
      if (fallScreenX > -100 && fallScreenX < viewW + 100) {
        ctx.save();
        const fallGrad = ctx.createLinearGradient(fallScreenX, 160, fallScreenX + 50, 420);
        fallGrad.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
        fallGrad.addColorStop(0.5, 'rgba(225, 29, 72, 0.65)');
        fallGrad.addColorStop(1, 'rgba(159, 18, 57, 0.75)');
        ctx.fillStyle = fallGrad;
        ctx.fillRect(fallScreenX, 160, 50, 260);

        // Bubbling waterfall foam & shimmer
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < 4; i++) {
          const by = 170 + ((this.animTime * 140 + i * 65) % 230);
          ctx.fillRect(fallScreenX + 6 + i * 11, by, 7, 16);
        }
        ctx.restore();
      }
    }

    // --- ZONE 3: LAS CUMBRES DE LA FÁBRICA (x: 3700 - 5400) ---
    if (viewX + viewW > 3600 && viewX < 5500) {
      // 1. Factory Chimneys with Cotton Candy Smoke
      [3900, 4400, 4850].forEach((cx, idx) => {
        const cScreenX = (cx - viewX * 0.15);
        if (cScreenX > -80 && cScreenX < viewW + 80) {
          this.drawFactoryChimney(ctx, cScreenX, 140 + idx * 15, 34, 150);
        }
      });

      // 2. Interlocking Chocolate Clockwork Gears
      const gearX = (4500 - viewX * 0.25);
      const gearY = 170;
      if (gearX > -150 && gearX < viewW + 150) {
        this.drawChocolateGear(ctx, gearX, gearY, 65, this.animTime * 0.6);
        this.drawChocolateGear(ctx, gearX + 95, gearY + 28, 42, -this.animTime * 0.9);
      }
    }

    // --- ZONE 4: LA ARENA DEL GUMBALL TITAN (x: 5200 - 6400) ---
    if (viewX + viewW > 5000) {
      // 1. Massive Gumball Fortress Arena Towers in background
      const fortX = (5800 - viewX * 0.15);
      if (fortX > -250 && fortX < viewW + 250) {
        this.drawGumballFortress(ctx, fortX, 130, viewH);
      }

      // 2. Sweeping Arena Searchlight Beams across sky
      this.drawArenaSearchlights(ctx, viewX, viewW, viewH);
    }
  }

  drawWaferWindmill(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);

    // Windmill Tower (Crisp Wafer Pattern)
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.moveTo(-size * 0.35, size * 1.5);
    ctx.lineTo(-size * 0.18, 0);
    ctx.lineTo(size * 0.18, 0);
    ctx.lineTo(size * 0.35, size * 1.5);
    ctx.closePath();
    ctx.fill();

    // Tower Roof (Sugar Cone)
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, 0);
    ctx.lineTo(0, -size * 0.45);
    ctx.lineTo(size * 0.25, 0);
    ctx.closePath();
    ctx.fill();

    // 4 Rotating Wafer Blades
    ctx.translate(0, -size * 0.05);
    ctx.rotate(this.animTime * 0.8);
    for (let b = 0; b < 4; b++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#FDE68A';
      ctx.fillRect(-3, 0, 6, size * 1.1);
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(-3, 0, 6, size * 1.1);
    }
    ctx.restore();
  }

  drawHorizonLollipop(ctx, x, y, radius, color) {
    ctx.save();
    ctx.translate(x, y);

    // Stick
    ctx.fillStyle = '#FDF2F8';
    ctx.fillRect(-2.5, 0, 5, 80);

    // Candy Swirl Head
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner White Spiral
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  drawSugarMountain(ctx, x, y, width, height, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(-width / 2, height);
    ctx.lineTo(-width * 0.15, 0);
    ctx.lineTo(0, 15);
    ctx.lineTo(width * 0.2, -10);
    ctx.lineTo(width / 2, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawFactoryChimney(ctx, x, y, width, height) {
    ctx.save();
    ctx.translate(x, y);

    // Brick Chimney
    ctx.fillStyle = '#312E81';
    ctx.fillRect(-width / 2, 0, width, height);

    // Rim
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(-width / 2 - 4, -8, width + 8, 8);

    // Billowing Cotton Candy Smoke
    for (let s = 0; s < 4; s++) {
      const puffTime = (this.animTime * 0.8 + s * 0.4) % 1.6;
      const puffScale = 8 + puffTime * 18;
      const puffX = Math.sin(this.animTime + s) * 16 + puffTime * 20;
      const puffY = -12 - puffTime * 55;
      ctx.fillStyle = `rgba(244, 114, 182, ${0.45 * (1 - puffTime / 1.6)})`;
      ctx.beginPath();
      ctx.arc(puffX, puffY, puffScale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawGumballFortress(ctx, x, y, viewH) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.55;

    // Fortress Base Tower
    ctx.fillStyle = '#1E1B4B';
    ctx.fillRect(-70, 0, 140, viewH - y);

    // Gumball Glass Dome on Top
    const domeGrad = ctx.createRadialGradient(-10, -35, 5, 0, -35, 55);
    domeGrad.addColorStop(0, 'rgba(56, 189, 248, 0.75)');
    domeGrad.addColorStop(0.6, 'rgba(14, 165, 233, 0.45)');
    domeGrad.addColorStop(1, 'rgba(3, 105, 161, 0.8)');
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.arc(0, -35, 50, 0, Math.PI * 2);
    ctx.fill();

    // Multicolored Gumballs inside dome
    const gColors = ['#EF4444', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
    for (let g = 0; g < 9; g++) {
      const gx = Math.cos(g * 1.2) * 28;
      const gy = -35 + Math.sin(g * 1.5) * 28;
      ctx.fillStyle = gColors[g % gColors.length];
      ctx.beginPath();
      ctx.arc(gx, gy, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawArenaSearchlights(ctx, viewX, viewW, viewH) {
    ctx.save();
    // 2 Sweeping Searchlight Beams across sky
    const lights = [
      { anchorX: 5600, speed: 0.7, color: 'rgba(56, 189, 248, 0.22)' },
      { anchorX: 6200, speed: -0.55, color: 'rgba(236, 72, 153, 0.22)' }
    ];

    lights.forEach((lt) => {
      const lightScreenX = (lt.anchorX - viewX * 0.15);
      if (lightScreenX > -200 && lightScreenX < viewW + 200) {
        const sweepAngle = Math.sin(this.animTime * lt.speed) * 0.45 - Math.PI / 2;
        ctx.save();
        ctx.translate(lightScreenX, 260);
        ctx.rotate(sweepAngle);

        const beamGrad = ctx.createLinearGradient(0, 0, 0, -360);
        beamGrad.addColorStop(0, lt.color);
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = beamGrad;

        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-65, -360);
        ctx.lineTo(65, -360);
        ctx.lineTo(6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    });
    ctx.restore();
  }

  drawChocolateGear(ctx, x, y, radius, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Gear base shadow
    ctx.fillStyle = 'rgba(45, 18, 5, 0.55)';
    ctx.beginPath();
    ctx.arc(2, 4, radius + 2, 0, Math.PI * 2);
    ctx.fill();

    // Gear body - rich dark milk chocolate gradient
    const gearGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
    gearGrad.addColorStop(0, '#92400E');
    gearGrad.addColorStop(0.6, '#78350F');
    gearGrad.addColorStop(1, '#451A03');
    ctx.fillStyle = gearGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // 3D Beveled Gear Teeth
    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / teeth);

      // Tooth shadow
      ctx.fillStyle = '#321402';
      ctx.fillRect(-8, -radius - 12, 16, 14);

      // Tooth body gradient
      const toothGrad = ctx.createLinearGradient(-8, -radius - 12, 8, -radius);
      toothGrad.addColorStop(0, '#B45309');
      toothGrad.addColorStop(0.5, '#78350F');
      toothGrad.addColorStop(1, '#451A03');
      ctx.fillStyle = toothGrad;
      ctx.fillRect(-7, -radius - 11, 14, 13);

      // Tooth top highlight
      ctx.fillStyle = 'rgba(254, 243, 199, 0.4)';
      ctx.fillRect(-7, -radius - 11, 14, 2.5);

      ctx.restore();
    }

    // Outer rim bevel ring
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Caramel Core
    const coreGrad = ctx.createRadialGradient(-radius * 0.1, -radius * 0.1, 2, 0, 0, radius * 0.42);
    coreGrad.addColorStop(0, '#FDE68A');
    coreGrad.addColorStop(0.5, '#F59E0B');
    coreGrad.addColorStop(1, '#B45309');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center Axle Hole with depth shadow
    ctx.fillStyle = '#1C0A00';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
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

      // Viewport Culling
      if (endX < camera.x - 100 || startX > camera.x + camera.viewportWidth + 100) {
        continue;
      }

      const biome = this.getCurrentBiome(startX + plat.width / 2);

      ctx.save();

      // 1. Single Continuous Organic Bezier Ground Path
      ctx.beginPath();
      ctx.moveTo(startX, bottomY);
      ctx.lineTo(startX, topY + 22);
      ctx.quadraticCurveTo(startX, topY, startX + 22, topY);

      const step = 38;
      for (let curX = startX + 22; curX < endX - 22; curX += step) {
        const nextX = Math.min(endX - 22, curX + step);
        const midX = (curX + nextX) / 2;
        const wave = Math.sin(midX * 0.022) * 3.0;
        ctx.quadraticCurveTo(midX, topY + wave, nextX, topY);
      }

      ctx.lineTo(endX - 22, topY);
      ctx.quadraticCurveTo(endX, topY, endX, topY + 22);
      ctx.lineTo(endX, bottomY);
      ctx.closePath();

      // 2. Rich 4-Stop Stratified Gradient (Surface Clay -> Soil Body -> Subsoil -> Deep Shadow)
      const groundGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
      const cols = biome.groundGradient;
      groundGrad.addColorStop(0, cols[0]);
      groundGrad.addColorStop(0.18, cols[1]);
      groundGrad.addColorStop(0.55, cols[2]);
      groundGrad.addColorStop(1, cols[3]);
      ctx.fillStyle = groundGrad;
      ctx.fill();

      // 3. Procedural Clay Texture & Micro-grain Strata Layers
      ctx.save();
      ctx.clip();

      const sueloImg = imageLoader.getImage('suelo');
      if (sueloImg && sueloImg.complete && sueloImg.naturalWidth > 0) {
        ctx.globalAlpha = 0.50;
        const tileW = 160;
        const tileH = 90;
        for (let tx = startX; tx < endX; tx += tileW) {
          ctx.drawImage(sueloImg, tx, topY, tileW, tileH);
        }
      }

      // Horizontal Strata Veins (Caramel & Biscuit Sediment Lines)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let strataY = topY + 35; strataY < bottomY; strataY += 24) {
        ctx.beginPath();
        ctx.moveTo(startX, strataY);
        for (let sx = startX; sx < endX; sx += 60) {
          ctx.lineTo(sx + 30, strataY + Math.sin(sx * 0.03) * 3);
        }
        ctx.lineTo(endX, strataY);
        ctx.lineTo(endX, strataY + 6);
        ctx.lineTo(startX, strataY + 6);
        ctx.fill();
      }

      // Porous Gingerbread & Biscuit Dough Micro-Texture
      this.drawGingerbreadPorosity(ctx, startX, endX, topY, bottomY);

      // Cliff Edge Drop-off Shading (Left and Right Vertical Edge Ambient Occlusion)
      const leftCliffGrad = ctx.createLinearGradient(startX, topY, startX + 32, topY);
      leftCliffGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      leftCliffGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = leftCliffGrad;
      ctx.fillRect(startX, topY, 32, bottomY - topY);

      const rightCliffGrad = ctx.createLinearGradient(endX - 32, topY, endX, topY);
      rightCliffGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      rightCliffGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      ctx.fillStyle = rightCliffGrad;
      ctx.fillRect(endX - 32, topY, 32, bottomY - topY);

      ctx.restore(); // Exit clip

      // 4. Volumetric 3D Fondant Frosting & Drip Layer
      // 4a. Drop Shadow beneath Frosting Drips
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.moveTo(startX + 10, topY + 4);
      for (let curX = startX + 18; curX < endX - 18; curX += step) {
        const nextX = Math.min(endX - 18, curX + step);
        const midX = (curX + nextX) / 2;
        const wave = Math.sin(midX * 0.022) * 3.0;
        const isDrip = ((Math.floor(curX / step) % 3) === 0);
        const dripDepth = isDrip ? 14 : 7;
        ctx.quadraticCurveTo(midX, topY + wave + dripDepth + 3, nextX, topY + 4);
      }
      ctx.lineTo(endX - 10, topY + 4);
      ctx.lineTo(startX + 10, topY + 4);
      ctx.fill();
      ctx.restore();

      // 4b. Thick Frosting Body with Organic Drips
      ctx.save();
      ctx.fillStyle = biome.frostingColor;
      ctx.beginPath();
      ctx.moveTo(startX + 10, topY);
      for (let curX = startX + 18; curX < endX - 18; curX += step) {
        const nextX = Math.min(endX - 18, curX + step);
        const midX = (curX + nextX) / 2;
        const wave = Math.sin(midX * 0.022) * 3.0;
        const isDrip = ((Math.floor(curX / step) % 3) === 0);
        const dripDepth = isDrip ? 12 : 5;
        ctx.quadraticCurveTo(midX, topY + wave + dripDepth, nextX, topY);
      }
      ctx.lineTo(endX - 10, topY);
      ctx.lineTo(startX + 10, topY);
      ctx.fill();

      // 4c. Satin Rim Light / Specular Glaze Curve on Frosting Crest
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startX + 12, topY + 2);
      for (let curX = startX + 22; curX < endX - 22; curX += step) {
        const nextX = Math.min(endX - 22, curX + step);
        const midX = (curX + nextX) / 2;
        const wave = Math.sin(midX * 0.022) * 3.0;
        ctx.quadraticCurveTo(midX, topY + wave + 2, nextX, topY + 2);
      }
      ctx.stroke();
      ctx.restore();

      // 5. 3D Cylindrical Sugar Sprinkles & Star Sequins in Relief
      const sprinkleColors = ['#FF69B4', '#FBBF24', '#38BDF8', '#FFFFFF', '#A855F7', '#34D399'];
      for (let fx = startX + 26; fx < endX - 26; fx += 28) {
        if (fx < camera.x - 40 || fx > camera.x + camera.viewportWidth + 40) continue;

        const wave = Math.sin(fx * 0.022) * 3.0;
        const fy = topY + wave + 6;
        const itemType = Math.floor(fx / 28) % 4;
        const colorIdx = Math.floor(fx / 28) % sprinkleColors.length;
        const mainColor = sprinkleColors[colorIdx];

        ctx.save();
        ctx.translate(fx, fy);

        if (itemType === 0) {
          // 3D Capsule / Jimmie Sprinkle (Rotated Pill with Top Highlight)
          const angle = ((fx % 60) - 30) * (Math.PI / 180);
          ctx.rotate(angle);

          // Sprinkle shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.roundRect(-4, 1.5, 9, 4.5, 2);
          ctx.fill();

          // Sprinkle body
          ctx.fillStyle = mainColor;
          ctx.beginPath();
          ctx.roundRect(-4.5, -2, 9, 4, 2);
          ctx.fill();

          // Highlight on top half
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.beginPath();
          ctx.roundRect(-3.5, -1.8, 7, 1.5, 1);
          ctx.fill();
        } else if (itemType === 1) {
          // 3D Sugar Pearl Sphere (Sphere with Radial Specular)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.arc(0.5, 1.5, 2.5, 0, Math.PI * 2);
          ctx.fill();

          const pearlGrad = ctx.createRadialGradient(-1, -1, 0.5, 0, 0, 2.8);
          pearlGrad.addColorStop(0, '#FFFFFF');
          pearlGrad.addColorStop(0.4, mainColor);
          pearlGrad.addColorStop(1, '#9D174D');
          ctx.fillStyle = pearlGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 2.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (itemType === 2) {
          // Wildflower Sugar Blossom
          ctx.fillStyle = mainColor;
          ctx.beginPath();
          ctx.arc(-2.2, 0, 2, 0, Math.PI * 2);
          ctx.arc(2.2, 0, 2, 0, Math.PI * 2);
          ctx.arc(0, -2.2, 2, 0, Math.PI * 2);
          ctx.arc(0, 2.2, 2, 0, Math.PI * 2);
          ctx.fill();

          // Flower center
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Tiny Sparkling Sugar Crystal (Diamond Glint)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.beginPath();
          ctx.moveTo(0, -3);
          ctx.lineTo(2.2, 0);
          ctx.lineTo(0, 3);
          ctx.lineTo(-2.2, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
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

      // --- 1. SOFT CAST SHADOW ON GROUND PLANE BELOW PLATFORM ---
      if (drawY < 450) {
        const shadowDist = 460 - (drawY + plat.height);
        if (shadowDist > 0 && shadowDist < 300) {
          const shadowAlpha = Math.max(0.08, 0.30 - shadowDist / 1000);
          const shadowW = plat.width * (1 - shadowDist / 800);
          const shadowH = 7;
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(plat.x + plat.width / 2, 460 + 2, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
          ctx.fill();
          ctx.restore();
        }
      }

      // --- 2. SINKING WAFER PLATFORM ---
      if (plat.type === 'sinking') {
        const shake = plat.isStandingOn ? (Math.random() - 0.5) * 3 : 0;
        this.drawWafer3D(ctx, plat.x + shake, drawY, plat.width, plat.height, true, plat.sinkY, false, plat.bites);
      } 
      // --- 3. ELASTIC JELLY BOUNCE TRAMPOLINE ---
      else if (plat.type === 'bounce') {
        const squash = plat.squashTimer > 0 ? (plat.squashTimer / 0.25) : 0;
        const scaleY = 1 - Math.sin(squash * Math.PI) * 0.42;
        const scaleX = 1 + Math.sin(squash * Math.PI) * 0.22;

        ctx.translate(plat.x + plat.width / 2, drawY + plat.height);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-plat.width / 2, -plat.height);

        // Trampoline Base Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
        ctx.beginPath();
        ctx.roundRect(2, 4, plat.width - 4, plat.height, 10);
        ctx.fill();

        // Translucent Jelly Body Gradient
        const bounceGrad = ctx.createLinearGradient(0, 0, 0, plat.height);
        bounceGrad.addColorStop(0, '#FB7185');
        bounceGrad.addColorStop(0.35, '#F43F5E');
        bounceGrad.addColorStop(0.75, '#BE123C');
        bounceGrad.addColorStop(1, '#881337');
        ctx.beginPath();
        ctx.roundRect(0, 0, plat.width, plat.height, 10);
        ctx.fillStyle = bounceGrad;
        ctx.fill();

        // Inner translucent jelly glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.beginPath();
        ctx.roundRect(4, 3, plat.width - 8, plat.height * 0.45, 6);
        ctx.fill();

        // White Glossy Rim
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Spring Bounce Chevron Label
        ctx.fillStyle = '#FEF08A';
        ctx.font = '900 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ BOING ▲', plat.width / 2, plat.height - 6);
      } 
      // --- 4. HOVERING MOVING WAFER PLATFORM ---
      else if (plat.type === 'moving') {
        this.drawWafer3D(ctx, plat.x, drawY, plat.width, plat.height, false, 0, true, plat.bites);
      } 
      // --- 5. STANDARD WAFER / BARQUILLO PLATFORM ---
      else if (plat.type === 'wafer') {
        this.drawWafer3D(ctx, plat.x, drawY, plat.width, plat.height, false, 0, false, plat.bites);
      } 
      // --- 6. 3D CYLINDRICAL CANDY CANE PLATFORM ---
      else if (plat.type === 'candy_cane') {
        // Platform Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.roundRect(plat.x + 2, drawY + 4, plat.width - 4, plat.height, 10);
        ctx.fill();

        if (bastonImg && bastonImg.complete && bastonImg.naturalWidth > 0) {
          ctx.drawImage(bastonImg, plat.x, drawY, plat.width, plat.height);
        } else {
          // 3D Cylindrical Base Tube Shading (White Core with Cylindrical Gradient)
          const tubeGrad = ctx.createLinearGradient(0, drawY, 0, drawY + plat.height);
          tubeGrad.addColorStop(0, '#FFFFFF');
          tubeGrad.addColorStop(0.25, '#F8FAFC');
          tubeGrad.addColorStop(0.7, '#CBD5E1');
          tubeGrad.addColorStop(1, '#64748B');
          ctx.beginPath();
          ctx.roundRect(plat.x, drawY, plat.width, plat.height, 10);
          ctx.fillStyle = tubeGrad;
          ctx.fill();

          // Spiral Red Stripes with 3D Depth
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(plat.x, drawY, plat.width, plat.height, 10);
          ctx.clip();

          const stripeW = 22;
          for (let sx = plat.x - 30; sx < plat.x + plat.width + 30; sx += stripeW * 2) {
            const redGrad = ctx.createLinearGradient(sx, drawY, sx + stripeW, drawY + plat.height);
            redGrad.addColorStop(0, '#EF4444');
            redGrad.addColorStop(0.3, '#DC2626');
            redGrad.addColorStop(0.8, '#991B1B');
            redGrad.addColorStop(1, '#450A0A');
            ctx.fillStyle = redGrad;

            ctx.beginPath();
            ctx.moveTo(sx, drawY);
            ctx.lineTo(sx + stripeW, drawY);
            ctx.lineTo(sx + stripeW - 16, drawY + plat.height);
            ctx.lineTo(sx - 16, drawY + plat.height);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();

          // Cylindrical Longitudinal Specular Highlight (Glassy Sheen)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(plat.x + 8, drawY + 3);
          ctx.lineTo(plat.x + plat.width - 8, drawY + 3);
          ctx.stroke();

          // Rounded End-Cap Highlights
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(plat.x + 6, drawY + plat.height / 2, 3, 0, Math.PI * 2);
          ctx.arc(plat.x + plat.width - 6, drawY + plat.height / 2, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  // --- 1. MICROSCOPIC SPARKLING DIAMOND SUGAR CRYSTALS OVER GREEN HILLS ---
  drawHillSugarSparkles(ctx, viewX, viewW, viewH) {
    ctx.save();
    const hillBaseY = viewH * 0.45;
    const crystalCount = 38;
    for (let i = 0; i < crystalCount; i++) {
      const seed = i * 197.3;
      const worldX = (i * 180 + Math.sin(seed) * 90);
      const screenX = (worldX - viewX * 0.30) % (viewW + 200);
      if (screenX < -20 || screenX > viewW + 20) continue;

      const screenY = hillBaseY + (Math.sin(worldX * 0.005) * 60) + ((seed * 13) % 110);
      const twinkle = Math.sin(this.animTime * 5 + seed) * 0.5 + 0.5;
      if (twinkle < 0.2) continue;

      const size = (1.5 + (seed % 2.5)) * twinkle;
      const isDiamond = (i % 3 === 0);

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.globalAlpha = 0.55 + twinkle * 0.45;

      // Soft Radial Aura
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Diamond Star Glint
      ctx.fillStyle = '#FFFFFF';
      if (isDiamond) {
        // 4-pointed diamond glint
        ctx.beginPath();
        ctx.moveTo(0, -size * 2.2);
        ctx.lineTo(size * 0.6, 0);
        ctx.lineTo(0, size * 2.2);
        ctx.lineTo(-size * 0.6, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-size * 2.2, 0);
        ctx.lineTo(0, size * 0.6);
        ctx.lineTo(size * 2.2, 0);
        ctx.lineTo(0, -size * 0.6);
        ctx.closePath();
        ctx.fill();
      } else {
        // Hexagonal sugar crystal grain
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.restore();
  }

  // --- 2. POROUS GINGERBREAD & BISCUIT DOUGH MICRO-TEXTURE ---
  drawGingerbreadPorosity(ctx, startX, endX, topY, bottomY) {
    ctx.save();
    const step = 28;
    for (let px = startX + 12; px < endX - 12; px += step) {
      for (let py = topY + 16; py < bottomY - 14; py += 22) {
        const hash = (px * 73.1 + py * 19.7);
        const poreRadius = 1.5 + (Math.sin(hash) * 0.5 + 0.5) * 2.2;
        const poreX = px + Math.sin(hash * 2.3) * 6;
        const poreY = py + Math.cos(hash * 1.7) * 4;

        // Dark sunken air pocket in spongy biscuit dough
        ctx.fillStyle = 'rgba(45, 15, 5, 0.38)';
        ctx.beginPath();
        ctx.arc(poreX, poreY, poreRadius, 0, Math.PI * 2);
        ctx.fill();

        // Upper pore rim light (baked crust highlight)
        ctx.strokeStyle = 'rgba(254, 243, 199, 0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(poreX - 0.6, poreY - 0.8, poreRadius * 0.7, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();

        // Embedded cinnamon spice speck / caramelized brown sugar grain
        if ((Math.floor(hash) % 3) === 0) {
          ctx.fillStyle = '#3E1504';
          ctx.fillRect(poreX + 4, poreY + 2, 1.8, 1.8);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(poreX + 4, poreY + 2, 1, 1);
        }
      }
    }
    ctx.restore();
  }

  // --- 3. 5-LAYER BEVELED WAFER & OBLEA WITH MICRO-RELIEF & CRUMBS ---
  drawWafer3D(ctx, x, y, width, height, isSinking = false, sinkY = 0, isMoving = false, bites = []) {
    const barquilloImg = imageLoader.getImage('barquillo') || imageLoader.getImage('plataforma-barquillo');

    ctx.save();
    // Platform Bottom Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 4, width - 4, height, 8);
    ctx.fill();

    if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0 && !isSinking && !isMoving) {
      ctx.drawImage(barquilloImg, x, y, width, height);
    } else {
      // 5-Layer Biscuit Sandwich Geometry
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 8);
      ctx.clip();

      // Layer 1: Top Baked Wafer Crust
      const crust1Grad = ctx.createLinearGradient(0, y, 0, y + height * 0.28);
      crust1Grad.addColorStop(0, '#FEF3C7');
      crust1Grad.addColorStop(0.4, '#F59E0B');
      crust1Grad.addColorStop(1, '#B45309');
      ctx.fillStyle = crust1Grad;
      ctx.fillRect(x, y, width, height * 0.28);

      // Layer 2: Cream Filling 1 (Vanilla / Strawberry Cream with 3D Bead Volume)
      const cream1Grad = ctx.createLinearGradient(0, y + height * 0.25, 0, y + height * 0.45);
      cream1Grad.addColorStop(0, '#78350F');
      cream1Grad.addColorStop(0.25, '#FFF1F2');
      cream1Grad.addColorStop(0.75, '#FFE4E6');
      cream1Grad.addColorStop(1, '#78350F');
      ctx.fillStyle = cream1Grad;
      ctx.fillRect(x, y + height * 0.25, width, height * 0.20);

      // Layer 3: Middle Wafer Crust
      const crust2Grad = ctx.createLinearGradient(0, y + height * 0.42, 0, y + height * 0.65);
      crust2Grad.addColorStop(0, '#F59E0B');
      crust2Grad.addColorStop(0.5, '#D97706');
      crust2Grad.addColorStop(1, '#92400E');
      ctx.fillStyle = crust2Grad;
      ctx.fillRect(x, y + height * 0.42, width, height * 0.23);

      // Layer 4: Cream Filling 2
      const cream2Grad = ctx.createLinearGradient(0, y + height * 0.62, 0, y + height * 0.80);
      cream2Grad.addColorStop(0, '#78350F');
      cream2Grad.addColorStop(0.25, '#FFF1F2');
      cream2Grad.addColorStop(0.75, '#FFE4E6');
      cream2Grad.addColorStop(1, '#451A03');
      ctx.fillStyle = cream2Grad;
      ctx.fillRect(x, y + height * 0.62, width, height * 0.18);

      // Layer 5: Bottom Caramelized Crust
      const crust3Grad = ctx.createLinearGradient(0, y + height * 0.78, 0, y + height);
      crust3Grad.addColorStop(0, '#B45309');
      crust3Grad.addColorStop(0.5, '#78350F');
      crust3Grad.addColorStop(1, '#451A03');
      ctx.fillStyle = crust3Grad;
      ctx.fillRect(x, y + height * 0.78, width, height * 0.22);

      // Bevel & Emboss Waffle Grid Micro-RelIEF (3D Sunken Pockets)
      const cellW = 16;
      const cellH = 10;
      for (let cx = x + 6; cx < x + width - 6; cx += cellW) {
        for (let cy = y + 2; cy < y + height - 4; cy += cellH) {
          // Deep sunken pocket
          ctx.fillStyle = 'rgba(69, 26, 3, 0.35)';
          ctx.fillRect(cx + 1, cy + 1, cellW - 4, cellH - 3);

          // Top & Left highlight bevel
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(cx, cy, cellW - 3, 1.2);
          ctx.fillRect(cx, cy, 1.2, cellH - 2);

          // Bottom & Right shadow bevel
          ctx.fillStyle = 'rgba(45, 15, 5, 0.55)';
          ctx.fillRect(cx, cy + cellH - 3, cellW - 3, 1.2);
          ctx.fillRect(cx + cellW - 3, cy, 1.2, cellH - 2);
        }
      }

      ctx.restore(); // Exit clip

      // Top Satin Specular Rim Light
      ctx.strokeStyle = '#FEF3C7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 1);
      ctx.lineTo(x + width - 4, y + 1);
      ctx.stroke();

      // Crunchy Wafer Crumb Grains (3D Biscuit Flakes)
      ctx.fillStyle = '#FEF08A';
      for (let i = 0; i < 6; i++) {
        const crumbX = x + 8 + ((i * 37) % (width - 16));
        const crumbY = y + 1.5 + (i % 3);
        ctx.fillRect(crumbX, crumbY, 2, 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(crumbX + 1, crumbY + 1.8, 2, 1);
        ctx.fillStyle = '#FEF08A';
      }
    }

    // --- REACTIVE BITE MARKS & BREAK NOTCHES (Scalloped Tooth Cuts with Exposed Cream & Crumbs) ---
    if (bites && bites.length > 0) {
      for (const bite of bites) {
        const bx = x + bite.relX;
        const by = bite.edge === 'top' ? y : y + height;
        const r = bite.radius || 11;
        const dir = bite.edge === 'top' ? 1 : -1;

        ctx.save();
        // 1. Dark Depth Hole
        ctx.fillStyle = '#1C0A00';
        ctx.beginPath();
        ctx.arc(bx - r * 0.45, by + dir * r * 0.25, r * 0.42, 0, Math.PI * 2);
        ctx.arc(bx, by + dir * r * 0.45, r * 0.52, 0, Math.PI * 2);
        ctx.arc(bx + r * 0.45, by + dir * r * 0.25, r * 0.42, 0, Math.PI * 2);
        ctx.fill();

        // 2. Exposed Vanilla Cream Filling in Bite Center
        ctx.fillStyle = '#FFF1F2';
        ctx.beginPath();
        ctx.arc(bx - r * 0.35, by + dir * r * 0.2, r * 0.32, 0, Math.PI * 2);
        ctx.arc(bx, by + dir * r * 0.35, r * 0.40, 0, Math.PI * 2);
        ctx.arc(bx + r * 0.35, by + dir * r * 0.2, r * 0.32, 0, Math.PI * 2);
        ctx.fill();

        // Strawberry Cream Accent Dot
        ctx.fillStyle = '#FB7185';
        ctx.beginPath();
        ctx.arc(bx, by + dir * r * 0.32, r * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // 3. Broken Biscuit Edge Outline
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(bx - r * 0.45, by + dir * r * 0.25, r * 0.42, 0, Math.PI);
        ctx.arc(bx, by + dir * r * 0.45, r * 0.52, 0, Math.PI);
        ctx.arc(bx + r * 0.45, by + dir * r * 0.25, r * 0.42, 0, Math.PI);
        ctx.stroke();

        // 4. Broken Biscuit Crumbs on Crater Perimeter
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(bx - r * 0.75, by + (dir > 0 ? 1 : -3), 2, 2);
        ctx.fillRect(bx + r * 0.7, by + (dir > 0 ? 2 : -4), 2.5, 2);
        ctx.fillRect(bx - 1.5, by + dir * (r * 0.6), 2, 2);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(bx + r * 0.25, by + (dir > 0 ? 3 : -5), 1.5, 1.5);
        ctx.fillRect(bx - r * 0.35, by + (dir > 0 ? 3 : -4), 2, 1.5);

        ctx.restore();
      }
    }

    // Dynamic Sinking Fractures and Falling Crumbs
    if (isSinking && sinkY > 4) {
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(x + width * 0.32, y);
      ctx.lineTo(x + width * 0.36, y + height);
      ctx.moveTo(x + width * 0.68, y);
      ctx.lineTo(x + width * 0.64, y + height);
      ctx.stroke();

      // Falling crumb particles
      ctx.fillStyle = '#FDA4AF';
      for (let i = 0; i < 5; i++) {
        const fallY = y + height + ((this.animTime * 70 + i * 14) % 24);
        const fallX = x + width * 0.3 + i * 18;
        ctx.fillRect(fallX, fallY, 2.5, 2.5);
      }
    }

    // Thruster Pods if moving platform
    if (isMoving) {
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.roundRect(x + 14, y + height - 2, 16, 7, [0, 0, 4, 4]);
      ctx.roundRect(x + width - 30, y + height - 2, 16, 7, [0, 0, 4, 4]);
      ctx.fill();

      const bubblePulse = Math.sin(this.animTime * 14) * 2;
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(x + 22, y + height + 6, 3.5 + bubblePulse, 0, Math.PI * 2);
      ctx.arc(x + width - 22, y + height + 6, 3.5 - bubblePulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.arc(x + 22, y + height + 12, 2.2, 0, Math.PI * 2);
      ctx.arc(x + width - 22, y + height + 12, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
