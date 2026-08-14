export class Physics {
  static checkAABB(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  static checkCircle(c1, c2) {
    const dx = (c1.x + c1.radius) - (c2.x + c2.radius);
    const dy = (c1.y + c1.radius) - (c2.y + c2.radius);
    const distSq = dx * dx + dy * dy;
    const rSum = c1.radius + c2.radius;
    return distSq <= rSum * rSum;
  }

  static checkCircleAABB(circle, box) {
    const cx = circle.x + (circle.radius || circle.width / 2);
    const cy = circle.y + (circle.radius || circle.height / 2);
    const r = circle.radius || circle.width / 2;

    const closestX = Math.max(box.x, Math.min(cx, box.x + box.width));
    const closestY = Math.max(box.y, Math.min(cy, box.y + box.height));

    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy < r * r;
  }

  // Update dynamic platforms (moving & sinking platforms)
  static updatePlatforms(platforms, dt, particles, sound) {
    for (const plat of platforms) {
      if (plat.type === 'moving') {
        if (plat.speedX) {
          plat.x += plat.speedX * dt;
          if (plat.x <= plat.minX || plat.x >= plat.maxX) {
            plat.speedX = -plat.speedX;
          }
        }
        if (plat.speedY) {
          plat.y += plat.speedY * dt;
          if (plat.y <= plat.minY || plat.y >= plat.maxY) {
            plat.speedY = -plat.speedY;
          }
        }
      } else if (plat.type === 'sinking') {
        plat.sinkY = plat.sinkY || 0;
        plat.sinkTimer = plat.sinkTimer || 0;
        plat.isCrumbling = plat.isCrumbling || false;

        if (plat.isStandingOn) {
          plat.sinkTimer += dt;
          plat.sinkY = Math.min(40, plat.sinkY + 45 * dt);
          if (plat.sinkTimer > 1.2 && !plat.isCrumbling) {
            plat.isCrumbling = true;
            if (particles) particles.emitCrumble(plat.x + plat.width / 2, plat.y + 10, 16, '#FDA4AF');
          }
        } else {
          plat.sinkTimer = Math.max(0, plat.sinkTimer - dt * 0.8);
          plat.sinkY = Math.max(0, plat.sinkY - dt * 25);
          if (plat.sinkY <= 0) plat.isCrumbling = false;
        }

        plat.isStandingOn = false; // Reset each frame
      }
    }
  }

  // Robust One-Way, Solid, Bounce & Dynamic Platform Collision Detection
  static resolvePlatforms(entity, platforms, isDroppingDown = false, sound = null, particles = null) {
    const dropping = isDroppingDown || entity.isDropping;
    const entityBottom = entity.y + entity.height;
    const prevBottom = entity.prevY !== undefined ? entity.prevY + entity.height : entityBottom - entity.vy * 0.016;

    for (const plat of platforms) {
      // If sinking platform is currently fully crumbled, ignore collision
      if (plat.type === 'sinking' && plat.isCrumbling && plat.sinkY >= 35) {
        continue;
      }

      const platY = plat.y + (plat.sinkY || 0);

      // Horizontal overlap check with safety margin
      const overlapX = (entity.x + entity.width * 0.85 > plat.x) && (entity.x + entity.width * 0.15 < plat.x + plat.width);
      if (!overlapX) continue;

      // Bounce / Trampoline platform
      if (plat.type === 'bounce') {
        if (entity.vy >= 0 && prevBottom <= platY + 18 && entityBottom >= platY) {
          entity.y = platY - entity.height;
          entity.vy = -740; // Super bounce launch!
          entity.isGrounded = false;
          if (sound && sound.playJump) sound.playJump();
          if (particles) {
            particles.emitSparkles(plat.x + plat.width / 2, platY, 16, '#F43F5E');
            particles.emitShockwave(plat.x + plat.width / 2, platY + 10, 50, '#FF77B0');
          }
          return plat;
        }
        continue;
      }

      if (plat.isOneWay) {
        if (dropping) continue;

        if (entity.vy >= 0 && prevBottom <= platY + 14 && entityBottom >= platY) {
          entity.y = platY - entity.height;
          entity.vy = 0;
          entity.isGrounded = true;

          if (plat.type === 'sinking') {
            plat.isStandingOn = true;
          } else if (plat.type === 'moving' && plat.speedX) {
            // Carry entity along with moving platform
            entity.x += plat.speedX * 0.016;
          }
          return plat;
        }
      } else {
        // Solid ground platform
        if (entity.vy >= 0 && prevBottom <= platY + 16 && entityBottom >= platY) {
          entity.y = platY - entity.height;
          entity.vy = 0;
          entity.isGrounded = true;
          return plat;
        }
      }
    }

    return null;
  }
}
