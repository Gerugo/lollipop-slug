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
        ctx.translate(plat.x + shake, drawY);

        // Platform Bottom Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.roundRect(2, 4, plat.width - 4, plat.height, 8);
        ctx.fill();

        // 3-Layer Biscuit Sandwich Body
        const waferGrad = ctx.createLinearGradient(0, 0, 0, plat.height);
        waferGrad.addColorStop(0, '#FDA4AF');
        waferGrad.addColorStop(0.3, '#E11D48');
        waferGrad.addColorStop(0.5, '#FFFFFF'); // Cream layer
        waferGrad.addColorStop(0.7, '#E11D48');
        waferGrad.addColorStop(1, '#9F1239');
        ctx.beginPath();
        ctx.roundRect(0, 0, plat.width, plat.height, 8);
        ctx.fillStyle = waferGrad;
        ctx.fill();

        // Waffle Grid Texture
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.2;
        const gridW = 16;
        for (let gx = 8; gx < plat.width - 8; gx += gridW) {
          ctx.strokeRect(gx, 4, gridW - 4, plat.height - 8);
        }

        // Top Rim Highlight
        ctx.strokeStyle = '#FFE4E6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(4, 1);
        ctx.lineTo(plat.width - 4, 1);
        ctx.stroke();

        // Warning crumb crack lines if sinking
        if (plat.sinkY > 8) {
          ctx.strokeStyle = '#4C0519';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(plat.width * 0.28, 0);
          ctx.lineTo(plat.width * 0.34, plat.height);
          ctx.moveTo(plat.width * 0.68, 0);
          ctx.lineTo(plat.width * 0.62, plat.height);
          ctx.stroke();

          // Crumbs falling
          ctx.fillStyle = '#FDA4AF';
          for (let i = 0; i < 4; i++) {
            ctx.fillRect(plat.width * 0.3 + i * 20, plat.height + (this.animTime * 60 + i * 8) % 18, 2.5, 2.5);
          }
        }
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
        ctx.translate(plat.x, drawY);

        // Platform Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.roundRect(2, 3, plat.width - 4, plat.height, 8);
        ctx.fill();

        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, 0, 0, plat.width, plat.height);
        } else {
          // Baked Waffle Sandwich Gradient
          const mGrad = ctx.createLinearGradient(0, 0, 0, plat.height);
          mGrad.addColorStop(0, '#FEF3C7');
          mGrad.addColorStop(0.35, '#D97706');
          mGrad.addColorStop(0.5, '#FFFBEB'); // Cream filling
          mGrad.addColorStop(0.65, '#D97706');
          mGrad.addColorStop(1, '#92400E');
          ctx.beginPath();
          ctx.roundRect(0, 0, plat.width, plat.height, 8);
          ctx.fillStyle = mGrad;
          ctx.fill();

          // Waffle Grid Indentation Shading
          ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
          ctx.lineWidth = 1.2;
          const gw = 18;
          for (let gx = 8; gx < plat.width - 8; gx += gw) {
            ctx.strokeRect(gx, 3, gw - 4, plat.height - 6);
          }
        }

        // Top Rim Highlight
        ctx.strokeStyle = '#FEF3C7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(6, 1);
        ctx.lineTo(plat.width - 6, 1);
        ctx.stroke();

        // Candy Thruster Pods (Left and Right)
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.roundRect(14, plat.height - 3, 16, 7, [0, 0, 4, 4]);
        ctx.roundRect(plat.width - 30, plat.height - 3, 16, 7, [0, 0, 4, 4]);
        ctx.fill();

        // Shimmering Exhaust Heat & Sweet Thruster Bubbles
        const bubblePulse = Math.sin(this.animTime * 14) * 2;
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(22, plat.height + 6, 3.5 + bubblePulse, 0, Math.PI * 2);
        ctx.arc(plat.width - 22, plat.height + 6, 3.5 - bubblePulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#E0F2FE';
        ctx.beginPath();
        ctx.arc(22, plat.height + 12, 2.2, 0, Math.PI * 2);
        ctx.arc(plat.width - 22, plat.height + 12, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } 
      // --- 5. STANDARD WAFER / BARQUILLO PLATFORM ---
      else if (plat.type === 'wafer') {
        // Platform Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.roundRect(plat.x + 2, drawY + 4, plat.width - 4, plat.height, 8);
        ctx.fill();

        if (barquilloImg && barquilloImg.complete && barquilloImg.naturalWidth > 0) {
          ctx.drawImage(barquilloImg, plat.x, drawY, plat.width, plat.height);
        } else {
          // Layered Wafer Sandwich
          const waferGrad = ctx.createLinearGradient(0, drawY, 0, drawY + plat.height);
          waferGrad.addColorStop(0, '#FEF3C7');
          waferGrad.addColorStop(0.32, '#D97706');
          waferGrad.addColorStop(0.5, '#FFFFFF'); // Cream layer
          waferGrad.addColorStop(0.68, '#D97706');
          waferGrad.addColorStop(1, '#92400E');
          ctx.beginPath();
          ctx.roundRect(plat.x, drawY, plat.width, plat.height, 8);
          ctx.fillStyle = waferGrad;
          ctx.fill();

          // Waffle Cross-Hatch Grid Shading
          ctx.strokeStyle = 'rgba(120, 53, 15, 0.32)';
          ctx.lineWidth = 1.2;
          const gw = 18;
          for (let gx = plat.x + 8; gx < plat.x + plat.width - 8; gx += gw) {
            ctx.strokeRect(gx, drawY + 3, gw - 4, plat.height - 6);
          }
        }

        // Top Satin Rim Light
        ctx.strokeStyle = '#FFFBEB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(plat.x + 6, drawY + 1);
        ctx.lineTo(plat.x + plat.width - 6, drawY + 1);
        ctx.stroke();
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
}
