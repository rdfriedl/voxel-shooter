import { World } from "cannon-es";

export const FIXED_TIME_STEP = 1 / 60;
export const physicsWorld = new World();
physicsWorld.gravity.set(0, -9.8, 0);

physicsWorld.defaultContactMaterial.friction = -1;

if (import.meta.env.DEV) {
  // @ts-ignore
  window.physicsWorld = physicsWorld;
}
