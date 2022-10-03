import { World } from "ecsy";
import { InstancedMesh, Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";
import { Movement } from "../components/movement";
import { Object3DComponent } from "../components/object3D";

const geometry = new SphereGeometry(0.5);
const material = new MeshBasicMaterial({
  color: 0xff0000,
});

export function createBulletEntity(world: World, id: number, position: Vector3, velocity: Vector3) {
  const mesh = new Mesh(geometry, material);
  return world
    .createEntity(`bullet-${id}`)
    .addComponent(Object3DComponent, { object: mesh })
    .addComponent(Movement, { position, velocity });
}
