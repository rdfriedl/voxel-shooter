import { Entity, World } from "ecsy";

export class ExtendedWorld extends World {
  getEntityByName(name: string): Entity {
    // @ts-ignore
    return this.entityManager.getEntityByName(name);
  }

  getEntities() {
    // @ts-ignore
    return this.entityManager._entities;
  }
}
