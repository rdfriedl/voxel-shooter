import { Entity, System } from "ecsy";
import { Vector3 } from "three";
import { VoxelWorld } from "../../common/voxel";
import { Object3DComponent } from "../components/object3D";
import { PlayerCollisionTag } from "../components/tags";
import { VoxelWorldMesh } from "../objects/voxel-world-mesh";

export class VoxelWorldSystem extends System {
  voxelWorld: VoxelWorld;
  worldEntity: Entity;

  constructor(world, attrs) {
    super(world, attrs);

    this.voxelWorld = new VoxelWorld(16, attrs.size || new Vector3(16, 16, 16));
    const worldMesh = new VoxelWorldMesh();
    worldMesh.world = this.voxelWorld;

    // NOTE: Make the world mesh its own entity
    this.worldEntity = world
      .createEntity("VoxelWorldMesh")
      .addComponent(Object3DComponent, { object: worldMesh })
      .addComponent(PlayerCollisionTag);
  }

  execute() {
    (this.worldEntity.getComponent(Object3DComponent)?.object as VoxelWorldMesh).update();
  }
}
