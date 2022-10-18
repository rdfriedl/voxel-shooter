import { intersectRay } from "../../../../common/voxel/raytrace";
import { Bullet } from "../bullet";

export class PunctureBullet extends Bullet {
  power = 5;

  update(dt: number) {
    const next = Bullet.vec1.copy(this.position).addScaledVector(this.velocity, dt);

    const playerHit = this.manager.room.playerManager.intersectRay(this.position, next, this.owner);
    if (playerHit) {
      playerHit.player.damage(10);
      this.alive = false;
      return;
    }

    while (this.power > 0) {
      const intersection = intersectRay(this.position, next, this.manager.world);
      if (intersection) {
        this.manager.world.setVoxel(intersection.voxel, 0);
        this.power--;
      } else break;
    }
    if (this.power <= 0) {
      this.alive = false;
      return;
    }

    this.position.copy(next);

    this.updateExpire(dt);
  }
}
