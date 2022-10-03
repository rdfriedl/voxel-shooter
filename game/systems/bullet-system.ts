import { Entity, System } from "ecsy";
import { onBulletCreate, onBulletDestroy } from "../connection";
import { createBulletEntity } from "../entities/bullet";

export class BulletSystem extends System {
  bullets: Map<number, Entity> = new Map();

  init() {
    onBulletCreate.addListener((id, position, velocity) => {
      if (this.bullets.has(id)) throw new Error("already have bullet");

      const entity = createBulletEntity(this.world, id, position, velocity);
      this.bullets.set(id, entity);
    });

    onBulletDestroy.addListener((id) => {
      this.bullets.get(id)?.remove();
    });
  }
  execute(delta: number, time: number): void {}
}
