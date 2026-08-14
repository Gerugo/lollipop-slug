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

  // Robust One-Way & Solid Platform Collision Detection
  static resolvePlatforms(entity, platforms, isDroppingDown = false) {
    const dropping = isDroppingDown || entity.isDropping;
    const entityBottom = entity.y + entity.height;
    const prevBottom = entity.prevY !== undefined ? entity.prevY + entity.height : entityBottom - entity.vy * 0.016;

    for (const plat of platforms) {
      // Horizontal overlap check with a small margin for smooth stepping
      const overlapX = (entity.x + entity.width * 0.85 > plat.x) && (entity.x + entity.width * 0.15 < plat.x + plat.width);
      if (!overlapX) continue;

      if (plat.isOneWay) {
        // If dropping down through platform, skip collision
        if (dropping) continue;

        // Only land if moving downward (vy >= 0) and feet were above or at platform top
        if (entity.vy >= 0 && prevBottom <= plat.y + 14 && entityBottom >= plat.y) {
          entity.y = plat.y - entity.height;
          entity.vy = 0;
          entity.isGrounded = true;
          return plat;
        }
      } else {
        // Solid ground platform
        if (entity.vy >= 0 && prevBottom <= plat.y + 16 && entityBottom >= plat.y) {
          entity.y = plat.y - entity.height;
          entity.vy = 0;
          entity.isGrounded = true;
          return plat;
        }
      }
    }

    return null;
  }
}
