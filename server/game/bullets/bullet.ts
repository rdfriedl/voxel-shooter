import { Vector3 } from "three";
import { intersectRay } from "../../../common/voxel/raytrace";
import { Player } from "../players/player";
import { BulletManager } from "./manager";

export class Bullet {
  static lastId = 0;
  static vec1 = new Vector3();

  id = Bullet.lastId++;
  alive = true;
  position: Vector3 = new Vector3();
  velocity: Vector3 = new Vector3();
  owner?: Player;
  manager: BulletManager;
  constructor(start: Vector3, velocity: Vector3, manager: BulletManager) {
    this.position.copy(start);
    this.velocity.copy(velocity);
    this.manager = manager;
  }

  update(dt: number) {
    const next = Bullet.vec1.copy(this.position).addScaledVector(this.velocity, dt);

    // TODO: find which hit first
    const playerHit = this.manager.room.playerManager.intersectRay(this.position, next, this.owner);
    if (playerHit) {
      playerHit.player.damage(10);
      this.alive = false;
      return;
    }
    const voxelHit = intersectRay(this.position, next, this.manager.world);
    if (voxelHit) {
      this.manager.world.setVoxel(voxelHit.voxel, 0);
      this.alive = false;
      return;
    }

    this.position.copy(next);
    if (this.manager.world.isVoxelOutOfBounds(this.position)) {
      this.alive = false;
      return;
    }
  }
}
