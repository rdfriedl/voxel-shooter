import { Vector3 } from "three";
import { Signal } from "../../../common/utils/emitter";
import { VoxelWorld } from "../../../common/voxel";
import { GameRoom } from "../../rooms/game-room";
import { Player } from "../players/player";
import { Bullet } from "./bullet";

export class BulletManager {
  bullets: Bullet[] = [];
  room: GameRoom;
  world: VoxelWorld;

  onBulletCreate = new Signal<[Bullet]>();
  onBulletChange = new Signal<[Bullet]>();
  onBulletDestroy = new Signal<[Bullet]>();

  constructor(room: GameRoom) {
    this.room = room;
    this.world = room.voxelWorld;
  }

  createBullet(position: Vector3, velocity: Vector3, owner?: Player) {
    const bullet = new Bullet(position, velocity, this);
    bullet.owner = owner;
    this.bullets.push(bullet);
    this.onBulletCreate.emit(bullet);
  }

  update(dt: number) {
    this.bullets = this.bullets.filter((bullet) => {
      bullet.update(dt);

      if (!bullet.alive) this.onBulletDestroy.emit(bullet);
      return bullet.alive;
    });
  }
}
