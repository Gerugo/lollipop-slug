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

  // Update dynamic platforms (moving, sinking, acid animation)
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
        plat.maxSink = 24; // Smooth maximum depression

        if (plat.isStandingOn) {
          // Smoothly depress under player weight (capped at 24px)
          plat.sinkY = Math.min(plat.maxSink, plat.sinkY + 36 * dt);
          if (particles && Math.random() < 0.15) {
            particles.emitCandyShards(plat.x + Math.random() * plat.width, plat.y + plat.sinkY, 1);
          }
        } else {
          // Smoothly spring back up when stepped off
          plat.sinkY = Math.max(0, plat.sinkY - 30 * dt);
        }

        plat.isStandingOn = false; // Reset each frame
      } else if (plat.type === 'acid_pool' && particles && Math.random() < 0.08) {
        // Ambient toxic green bubbles
        particles.emitSugarSmoke(plat.x + Math.random() * plat.width, plat.y + 4, 1, '#84CC16');
      }
    }
  }

  // Robust One-Way, Solid, Bounce, Sticky & Hazard Platform Collision Detection
  static resolvePlatforms(entity, platforms, isDroppingDown = false, sound = null, particles = null, camera = null) {
    const dropping = isDroppingDown || entity.isDropping;
    const entityBottom = entity.y + entity.height;
    const prevBottom = entity.prevY !== undefined ? entity.prevY + entity.height : entityBottom - entity.vy * 0.016;

    for (const plat of platforms) {
      const platY = plat.y + (plat.sinkY || 0);

      // Horizontal overlap check with safety margin
      const overlapX = (entity.x + entity.width * 0.85 > plat.x) && (entity.x + entity.width * 0.15 < plat.x + plat.width);
      if (!overlapX) continue;

      // Acid Pool, Soda Tide, Lava Caramel & Spikes Hazards: burns/damages player on contact
      if (plat.type === 'acid_pool' || plat.type === 'soda_tide' || plat.type === 'lava_caramel' || plat.type === 'spikes') {
        if (entity.vy >= 0 && prevBottom <= platY + 18 && entityBottom >= platY) {
          if (entity.takeDamage) {
            entity.takeDamage(1, entity.x + entity.width / 2, particles, sound, camera);
          }
          if (particles) {
            let sparkCol = '#84CC16';
            if (plat.type === 'soda_tide') sparkCol = '#06B6D4';
            else if (plat.type === 'lava_caramel') sparkCol = '#EA580C';
            else if (plat.type === 'spikes') sparkCol = '#E11D48';

            particles.emitSparkles(entity.x + entity.width / 2, platY, 6, sparkCol);
            if (plat.type === 'soda_tide') particles.emitSodaBubbles(entity.x + entity.width / 2, platY, 4);
            else if (plat.type === 'lava_caramel') particles.emitSugarSmoke(entity.x + entity.width / 2, platY, 3, '#EA580C');
            else if (plat.type === 'spikes') particles.emitCandyShards(entity.x + entity.width / 2, platY, 4);
          }
        }
        continue;
      }

      // Bounce / Elastic Trampoline platform
      if (plat.type === 'bounce' || plat.type === 'elastic') {
        if (entity.vy >= 0 && prevBottom <= platY + 20 && entityBottom >= platY - 2) {
          entity.y = platY - entity.height;
          entity.vy = plat.type === 'elastic' ? -780 : -740; // Super bounce launch!
          entity.isGrounded = false;
          if (sound && sound.playJump) sound.playJump();
          if (particles) {
            particles.emitSparkles(plat.x + plat.width / 2, platY, 16, '#84CC16');
            particles.emitShockwave(plat.x + plat.width / 2, platY + 10, 50, '#A3E635');
          }
          return plat;
        }
        continue;
      }

      if (plat.isOneWay) {
        if (dropping) continue;

        // One-Way platform landing: check if falling down onto top surface
        if (entity.vy >= 0 && prevBottom <= platY + 18 && entityBottom >= platY - 4) {
          entity.y = platY - entity.height;
          entity.vy = 0;
          entity.isGrounded = true;

          if (plat.type === 'sinking') {
            plat.isStandingOn = true;
          } else if (plat.type === 'sticky') {
            // Slow down horizontal movement on sticky licorice roots
            entity.vx *= 0.62;
            if (particles && Math.random() < 0.2) {
              particles.emitSugarSmoke(entity.x + entity.width / 2, entityBottom, 1, '#15803D');
            }
          } else if (plat.type === 'ice') {
            // Low friction slippery ice slide
            entity.vx *= 0.985;
            if (particles && Math.abs(entity.vx) > 30 && Math.random() < 0.3) {
              particles.emitSparkles(entity.x + entity.width / 2, entityBottom, 1, '#BAE6FD');
            }
          } else if (plat.type === 'moving' && plat.speedX) {
            // Carry entity along with moving platform
            entity.x += plat.speedX * 0.016;
          }
          return plat;
        }
      } else {
        // Solid ground platform
        if (entity.vy >= 0 && prevBottom <= platY + 20 && entityBottom >= platY - 4) {
          entity.y = platY - entity.height;
          entity.vy = 0;
          entity.isGrounded = true;

          if (plat.type === 'sticky') {
            entity.vx *= 0.62;
          } else if (plat.type === 'ice') {
            entity.vx *= 0.985;
            if (particles && Math.abs(entity.vx) > 30 && Math.random() < 0.3) {
              particles.emitSparkles(entity.x + entity.width / 2, entityBottom, 1, '#BAE6FD');
            }
          }
          return plat;
        }
      }
    }

    return null;
  }

  // Physical solid obstacle resolution for destructibles (barrels, crates)
  static resolveDestructibles(entity, destructibles) {
    if (!destructibles || destructibles.length === 0 || !entity) return;
    const prevBottom = entity.prevY !== undefined ? entity.prevY + entity.height : entity.y + entity.height - entity.vy * 0.016;

    for (const d of destructibles) {
      if (d.dead) continue;

      // Check overlap
      if (
        entity.x + entity.width > d.x &&
        entity.x < d.x + d.width &&
        entity.y + entity.height > d.y &&
        entity.y < d.y + d.height
      ) {
        // Landing on top of destructible
        if (entity.vy >= 0 && prevBottom <= d.y + 14) {
          entity.y = d.y - entity.height;
          entity.vy = 0;
          entity.isGrounded = true;
          continue;
        }

        // Horizontal obstacle collision: push out
        const overlapLeft = (entity.x + entity.width) - d.x;
        const overlapRight = (d.x + d.width) - entity.x;

        if (overlapLeft < overlapRight) {
          entity.x = d.x - entity.width;
          if (entity.vx > 0) entity.vx = 0;
        } else {
          entity.x = d.x + d.width;
          if (entity.vx < 0) entity.vx = 0;
        }
      }
    }
  }
}
