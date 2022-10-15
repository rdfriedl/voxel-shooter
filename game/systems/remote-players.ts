import { Entity, System } from "ecsy";
import { CapsuleGeometry, Group, Mesh, MeshBasicMaterial } from "three";
import { PlayerState } from "../../common/schema";
import { Movement } from "../components/movement";
import { Object3DComponent } from "../components/object3D";
import { RemotePlayerTag } from "../components/tags";
import { getRoom, onPlayerAliveChange, onPlayerLeave, onPlayerPositionChange } from "../connection";

export class RemotePlayerSystem extends System {
  playerEntities: Map<string, Entity> = new Map();

  isLocalPlayer(player: PlayerState) {
    const room = getRoom();
    return player.id === room?.sessionId;
  }
  createPlayerEntity(player: PlayerState) {
    if (this.playerEntities.has(player.id)) return this.playerEntities.get(player.id) as Entity;

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

    // set the position
    const movement = entity.getMutableComponent(Movement);
    movement?.position.copy(player.position.getPositionVector());
    movement?.velocity.copy(player.position.getVelocityVector());

    this.playerEntities.set(player.id, entity);
    return entity;
  }
  removePlayerEntity(id: string) {
    const entity = this.playerEntities.get(id);

    if (entity) {
      entity.remove();
      this.playerEntities.delete(id);
    }
  }

  init() {
    onPlayerAliveChange.addListener((player, alive) => {
      if (this.isLocalPlayer(player)) return;
      if (alive) {
        this.createPlayerEntity(player);
      } else {
        this.removePlayerEntity(player.id);
      }
    });
    onPlayerLeave.addListener((player) => {
      this.removePlayerEntity(player.id);
    });
    onPlayerPositionChange.addListener((player) => {
      if (this.isLocalPlayer(player)) return;

      const entity = this.playerEntities.get(player.id);
      if (!entity) return;
      const movement = entity.getMutableComponent(Movement);
      movement?.position.copy(player.position.getPositionVector());
      movement?.velocity.copy(player.position.getVelocityVector());
    });

    // create existing players
    const room = getRoom();
    room?.state.players.forEach((player) => {
      if (this.isLocalPlayer(player)) return;
      this.createPlayerEntity(player);
    });
  }
  execute() {}
}
