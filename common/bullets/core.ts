import { Box3, Vector3 } from "three";
import { VoxelWorld } from "../voxel";
import { intersectRay } from "../voxel/raytrace";

export class Bullet {
  static vec1 = new Vector3();

  static damageMap = [
    new Vector3(0, 0, 1),
    new Vector3(0, 0, -1),
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0),
    new Vector3(1, 0, 0),
    new Vector3(-1, 0, 0),
  ];

  position: Vector3 = new Vector3();
  velocity: Vector3 = new Vector3();
  manager: BulletManager;
  constructor(start: Vector3, velocity: Vector3, manager: BulletManager) {
    this.position.copy(start);
    this.velocity.copy(velocity);
    this.manager = manager;
  }

  update(dt: number) {
    const next = Bullet.vec1.copy(this.position).addScaledVector(this.velocity, dt);

    if (this.manager.world.isVoxelOutOfBounds(Bullet.vec1)) {
      return false;
    }

    const intersection = intersectRay(this.position, next, this.manager.world);
    this.position.copy(next);
    if (intersection) {
      const v = new Vector3().copy(intersection.voxel);
      this.manager.world.setVoxel(v.copy(intersection.voxel), 0);
      // for (const d of Bullet.damageMap) {
      //   if (Math.random() > 0.5) {
      //     this.manager.world.setVoxel(v.copy(intersection.voxel).add(d), 0);
      //   }
      // }
      return false;
    }

    return true;
  }
}

export class BulletManager {
  bullets: Bullet[] = [];
  world: VoxelWorld;
  constructor(world: VoxelWorld) {
    this.world = world;
  }

  createBullet(position: Vector3, velocity: Vector3) {
    this.bullets.push(new Bullet(position, velocity, this));
  }

  update(dt: number) {
    this.bullets = this.bullets.filter((bullet) => {
      return bullet.update(dt);
    });
  }
}
