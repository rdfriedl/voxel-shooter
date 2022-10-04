import { intersectRay } from "../../../../common/voxel/raytrace";
import { Bullet } from "../bullet";

export class PunctureBullet extends Bullet {
  power = 5;

  update(dt: number) {
    const next = Bullet.vec1.copy(this.position).addScaledVector(this.velocity, dt);

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

    if (this.manager.world.isVoxelOutOfBounds(this.position)) {
      this.alive = false;
      return;
    }

    this.position.copy(next);
  }
}
