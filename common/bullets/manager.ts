import { Vector3 } from "three";
import { VoxelWorld } from "../voxel";
import { Bullet } from "./bullet";
import { PunctureBullet } from "./types/puncture";

export class BulletManager {
  bullets: Bullet[] = [];
  world: VoxelWorld;
  constructor(world: VoxelWorld) {
    this.world = world;
  }

  createBullet(position: Vector3, velocity: Vector3) {
    this.bullets.push(new PunctureBullet(position, velocity, this));
  }

  update(dt: number) {
    this.bullets = this.bullets.filter((bullet) => {
      return bullet.update(dt);
    });
  }
}
