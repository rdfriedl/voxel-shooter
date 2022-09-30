import { Entity, System } from "ecsy";
import { CapsuleGeometry, Group, Mesh, MeshBasicMaterial } from "three";
import { Player } from "../../common/schema";
import { Movement } from "../components/movement";
import { Object3DComponent } from "../components/object3D";
import { RemotePlayerTag } from "../components/tags";
import { getRoom } from "../connection";

export class RemotePlayerSystem extends System {
  playerEntities: Map<string, Entity> = new Map();

  createPlayerEntity(player: Player) {
    const group = new Group();
    const mesh = new Mesh(
      new CapsuleGeometry(2, 8),
      new MeshBasicMaterial({
        color: 0xffffff,
      })
    );
    mesh.position.y = -4;
    group.add(mesh);
    const entity = this.world
      .createEntity(`player-${player.id}`)
      .addComponent(Movement)
      .addComponent(Object3DComponent, { object: group })
      .addComponent(RemotePlayerTag);
    this.playerEntities.set(player.id, entity);
    return entity;
  }

  init() {
    const room = getRoom();
    if (!room) return;

    room.state.players.onAdd = (player) => {
      if (player.id === room.sessionId) return;
      if (!this.playerEntities.has(player.id)) {
        this.createPlayerEntity(player);
      }
    };
    room.state.players.onRemove = (player) => {
      const entity = this.playerEntities.get(player.id);
      if (entity) entity.remove();
    };
  }
  execute() {
    const room = getRoom();
    if (!room) return;

    room.state.players.forEach((player) => {
      if (player.id === room.sessionId) return;
      let entity = this.playerEntities.get(player.id);
      if (!entity) {
        entity = this.createPlayerEntity(player);
      }

      const movement = entity.getMutableComponent(Movement);
      // @ts-ignore
      movement?.position.copy(player.position);
      // @ts-ignore
      movement?.velocity.copy(player.velocity);
    });
  }
}
