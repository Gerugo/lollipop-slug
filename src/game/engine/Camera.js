export class Camera {
  constructor(viewportWidth = 960, viewportHeight = 540) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.levelWidth = 6400;
    this.levelHeight = 540;
    this.shakeTotalDuration = 0.3;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeDirX = 0;
    this.shakeDirY = 0;
    this.locked = false;
    this.lockedTargetX = 0;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this.punchZoomSpeed = 3.5;
  }

  setBounds(width, height) {
    this.levelWidth = width;
    this.levelHeight = height;
  }

  setZoom(zoomLevel = 1.0) {
    this.targetZoom = zoomLevel;
  }

  punchZoom(targetZoom = 1.08, returnSpeed = 3.8) {
    this.zoom = targetZoom;
    this.targetZoom = 1.0;
    this.punchZoomSpeed = returnSpeed;
  }

  shake(arg1 = 8, arg2 = 0.3, dirX = 0, dirY = 0) {
    let finalIntensity = arg1;
    let finalDuration = arg2;

    if (arg1 > 30 && arg2 < 30) {
      finalDuration = arg1 / 1000;
      finalIntensity = arg2;
    }

    this.shakeIntensity = Math.max(this.shakeIntensity, finalIntensity);
    this.shakeDuration = Math.max(this.shakeDuration, finalDuration);
    this.shakeTotalDuration = Math.max(this.shakeTotalDuration, this.shakeDuration);
    this.shakeDirX = dirX;
    this.shakeDirY = dirY;
  }

  lockToArena(targetX = 5200) {
    this.locked = true;
    this.lockedTargetX = targetX;
  }

  unlock() {
    this.locked = false;
  }

  update(dt, target) {
    // Smooth zoom interpolation with punch speed
    this.zoom += (this.targetZoom - this.zoom) * Math.min(1, dt * (this.punchZoomSpeed || 4.0));

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
      // Quadratic ease-out decay curve for heavier physical impact feel
      const progress = Math.max(0, this.shakeDuration / (this.shakeTotalDuration || 0.3));
      const easedIntensity = this.shakeIntensity * Math.pow(progress, 1.8);

      const noiseX = (Math.random() * 2 - 1);
      const noiseY = (Math.random() * 2 - 1);

      this.shakeOffsetX = (this.shakeDirX * 0.6 + noiseX * 0.4) * easedIntensity;
      this.shakeOffsetY = (this.shakeDirY * 0.6 + noiseY * 0.4) * easedIntensity;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      this.shakeIntensity = 0;
      this.shakeDirX = 0;
      this.shakeDirY = 0;
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
