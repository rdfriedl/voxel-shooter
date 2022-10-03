import { Vector3 } from "three";
import { Signal } from "../utils/emitter";
import { VoxelWorld } from "../voxel";
import { Bullet } from "./bullet";
import { PunctureBullet } from "./types/puncture";

export class BulletManager {
  bullets: Bullet[] = [];
  world: VoxelWorld;

  onBulletCreate = new Signal<[Bullet]>();
  onBulletChange = new Signal<[Bullet]>();
  onBulletDestroy = new Signal<[Bullet]>();

  constructor(world: VoxelWorld) {
    this.world = world;
  }

  createBullet(position: Vector3, velocity: Vector3) {
    const bullet = new PunctureBullet(position, velocity, this);
    this.bullets.push(bullet);
    this.onBulletCreate.emit(bullet);
  }

  update(dt: number) {
    this.bullets = this.bullets.filter((bullet) => {
      const keepAlive = bullet.update(dt);
      if (!keepAlive) this.onBulletDestroy.emit(bullet);
      return keepAlive;
    });
  }
}
