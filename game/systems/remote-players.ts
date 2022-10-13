import { Entity, System } from "ecsy";
import { CapsuleGeometry, Group, Mesh, MeshBasicMaterial } from "three";
import { PlayerState } from "../../common/schema";
import { Movement } from "../components/movement";
import { Object3DComponent } from "../components/object3D";
import { RemotePlayerTag } from "../components/tags";
import { getRoom, onPlayerJoin, onPlayerLeave, onPlayerPositionChange } from "../connection";

export class RemotePlayerSystem extends System {
  playerEntities: Map<string, Entity> = new Map();

  createPlayerEntity(player: PlayerState) {
    const group = new Group();
    group.name = `player-${player.id}`;
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

    onPlayerJoin.addListener((player) => {
      if (!this.playerEntities.has(player.id)) {
        this.createPlayerEntity(player);
      }
    });
    onPlayerLeave.addListener((player) => {
      const entity = this.playerEntities.get(player.id);
      if (entity) entity.remove();
    });
    onPlayerPositionChange.addListener((player) => {
      if (player.id === room.sessionId) return;

      const entity = this.playerEntities.get(player.id);
      if (!entity) return;
      const movement = entity.getMutableComponent(Movement);
      movement?.position.copy(player.position.getPositionVector());
      movement?.velocity.copy(player.position.getVelocityVector());
    });

    // create players
    room.state.players.forEach((player) => {
      if (player.id === room.sessionId) return;
      let entity = this.playerEntities.get(player.id);
      if (!entity) entity = this.createPlayerEntity(player);
      const movement = entity.getMutableComponent(Movement);
      movement?.position.copy(player.position.getPositionVector());
      movement?.velocity.copy(player.position.getVelocityVector());
    });
  }
  execute() {}
}
