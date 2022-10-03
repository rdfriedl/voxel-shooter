import { Vector3 } from "three";
import { intersectRay } from "../voxel/raytrace";
import { BulletManager } from "./manager";

export class Bullet {
  static lastId = 0;
  static vec1 = new Vector3();

  id: number;
  position: Vector3 = new Vector3();
  velocity: Vector3 = new Vector3();
  manager: BulletManager;
  constructor(start: Vector3, velocity: Vector3, manager: BulletManager) {
    this.position.copy(start);
    this.velocity.copy(velocity);
    this.manager = manager;
    this.id = Bullet.lastId++;
  }

  update(dt: number) {
    const next = Bullet.vec1.copy(this.position).addScaledVector(this.velocity, dt);
    const intersection = intersectRay(this.position, next, this.manager.world);
    this.position.copy(next);
    if (intersection) {
      this.manager.world.setVoxel(intersection.voxel, 0);
      return false;
    }

    if (this.manager.world.isVoxelOutOfBounds(this.position)) {
      return false;
    }

    return true;
  }
}
