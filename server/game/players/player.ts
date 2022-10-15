import { Box3, Vector3 } from "three";
import { PlayerState } from "../../../common/schema";
import { PlayerManager } from "./manager";

const minOffset = new Vector3(2, 10);
const maxOffset = new Vector3(2, 2);

export class Player {
  hitbox: Box3 = new Box3();
  state: PlayerState;
  /** interpolated player position */
  position = new Vector3();
  /** readonly player velocity */
  velocity = new Vector3();

  manager: PlayerManager;

  constructor(state: PlayerState, manager: PlayerManager) {
    this.state = state;
    this.manager = manager;
    this.setPosition(state.position.getPositionVector(), state.position.getVelocityVector());
  }

  setPosition(position: Vector3, velocity: Vector3) {
    this.position.copy(position);
    this.velocity.copy(velocity);
    this.state.position.px = this.position.x;
    this.state.position.py = this.position.y;
    this.state.position.pz = this.position.z;
    this.state.position.vx = this.velocity.x;
    this.state.position.vy = this.velocity.y;
    this.state.position.vz = this.velocity.z;
    this.hitbox.min.copy(this.position).sub(minOffset);
    this.hitbox.max.copy(this.position).add(maxOffset);
  }
  respawn(position: Vector3) {
    this.state.health = 100;
    this.state.alive = true;
    this.setPosition(position, new Vector3(0, 0, 0));
  }

  damage(amount: number) {
    this.state.health -= amount;
    this.state.alive = this.state.health > 0;
  }

  update(dt: number) {
    const v = this.state.position.getVelocityVector();
    this.position.addScaledVector(v, dt);

    // update hitbox
    this.hitbox.min.copy(this.position).sub(minOffset);
    this.hitbox.max.copy(this.position).add(maxOffset);
  }
}
