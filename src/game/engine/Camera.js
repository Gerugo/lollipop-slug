export class Camera {
  constructor(viewportWidth = 960, viewportHeight = 540) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.levelWidth = 6400;
    this.levelHeight = 540;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.locked = false;
    this.lockedTargetX = 0;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
  }

  setBounds(width, height) {
    this.levelWidth = width;
    this.levelHeight = height;
  }

  setZoom(zoomLevel = 1.0) {
    this.targetZoom = zoomLevel;
  }

  shake(arg1 = 8, arg2 = 0.3) {
    let finalIntensity = arg1;
    let finalDuration = arg2;

    if (arg1 > 30 && arg2 < 30) {
      finalDuration = arg1 / 1000;
      finalIntensity = arg2;
    }

    this.shakeIntensity = Math.max(this.shakeIntensity, finalIntensity);
    this.shakeDuration = Math.max(this.shakeDuration, finalDuration);
  }

  lockToArena(targetX = 5200) {
    this.locked = true;
    this.lockedTargetX = targetX;
  }

  unlock() {
    this.locked = false;
  }

  update(dt, target) {
    // Smooth zoom interpolation
    this.zoom += (this.targetZoom - this.zoom) * Math.min(1, dt * 4.0);

    if (this.locked) {
      // Smoothly lerp towards arena lock position
      this.x += (this.lockedTargetX - this.x) * Math.min(1, dt * 3.5);
    } else if (target) {
      const lookAhead = target.facing * 80;
      const targetX = target.x - this.viewportWidth * 0.38 + lookAhead;
      this.x += (targetX - this.x) * Math.min(1, dt * 5);
    }

    this.x = Math.max(0, Math.min(this.x, this.levelWidth - this.viewportWidth));
    this.y = 0;

    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      this.shakeOffsetX = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeOffsetY = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 18);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  applyTransform(ctx) {
    ctx.save();

    // Center zoom
    if (this.zoom !== 1.0) {
      ctx.translate(this.viewportWidth / 2, this.viewportHeight / 2);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-this.viewportWidth / 2, -this.viewportHeight / 2);
    }

    ctx.translate(
      -Math.round(this.x + this.shakeOffsetX),
      -Math.round(this.y + this.shakeOffsetY)
    );
  }

  restoreTransform(ctx) {
    ctx.restore();
  }

  isVisible(x, y, width, height, padding = 100) {
    return (
      x + width >= this.x - padding &&
      x <= this.x + this.viewportWidth + padding &&
      y + height >= this.y - padding &&
      y <= this.y + this.viewportHeight + padding
    );
  }
}
