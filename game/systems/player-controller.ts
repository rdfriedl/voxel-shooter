import { System } from "ecsy";
import { Object3D, Raycaster, Vector3 } from "three";
import { Movement } from "../components/movement";
import { Object3DComponent } from "../components/object3D";
import { LocalPlayerTag, PlayerCollisionTag } from "../components/tags";
import { getRoom, onRespawn } from "../connection";
import { keyStates, mouseButtonStates } from "../utils/key-states";
import { ControlsSystem } from "./controls";

export class PlayerController extends System {
  raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10);
  canJump = false;
  canShoot = true;
  interval: NodeJS.Timer | undefined;
  init() {
    this.interval = setInterval(this.sendPlayerPosition.bind(this), 1000 / 30);

    onRespawn.addListener(this.setPositionFromServer, this);
  }
  getPlayer() {
    return this.queries.player.results[0];
  }
  setPositionFromServer(position: Vector3) {
    const movement = this.getPlayer().getMutableComponent(Movement);
    movement?.position.copy(position);
    movement?.velocity.set(0, 0, 0);
  }
  sendPlayerPosition() {
    const room = getRoom();
    const movement = this.getPlayer().getComponent(Movement);
    if (!movement || !room) return;

    room.send("position", {
      position: movement.position,
      velocity: movement.velocity,
    });
  }
  stop() {
    if (this.interval) clearInterval(this.interval);
    onRespawn.removeListener(this.sendPlayerPosition);
  }
  execute(delta: number) {
    const direction = new Vector3();
    const controls = this.world.getSystem(ControlsSystem).controls;
    const player = this.getPlayer();

    // input
    const moveForward = keyStates["KeyW"] ?? false;
    const moveBackward = keyStates["KeyS"] ?? false;
    const moveLeft = keyStates["KeyA"] ?? false;
    const moveRight = keyStates["KeyD"] ?? false;
    const jump = keyStates["Space"] ?? false;
    const sprint = keyStates["ShiftLeft"] ?? false;

    // start move the player
    const movement = player.getMutableComponent(Movement);
    if (!movement) return;

    const velocity = movement.velocity;
    const position = movement.position;

    this.raycaster.ray.origin.copy(position);
    const collisions = this.queries.collision.results
      .map((e) => e.getComponent(Object3DComponent)?.object)
      .filter(Boolean) as Object3D[];
    const intersections = this.raycaster.intersectObjects(collisions, true);
    const standingOn = intersections[0];

    velocity.y -= 9.8 * 20 * delta;
    velocity.z -= velocity.z * 8 * delta;
    velocity.x -= velocity.x * 8 * delta;

    if (standingOn && velocity.y < 0) {
      velocity.y = Math.max(0, velocity.y);
      position.y = standingOn.point.y + this.raycaster.far;
      this.canJump = true;
    }

    if (controls.isLocked === true) {
      direction.z = Number(moveBackward) - Number(moveForward);
      direction.x = Number(moveLeft) - Number(moveRight);
      direction.normalize();

      const camera = controls.getObject();
      velocity.z = 0;
      velocity.x = 0;
      // move right/left
      const v = new Vector3();
      v.setFromMatrixColumn(camera.matrix, 0);
      velocity.addScaledVector(v, -direction.x * (sprint ? 30 : 20));

      // move forward/backwards
      v.setFromMatrixColumn(camera.matrix, 0);
      v.crossVectors(camera.up, v);
      velocity.addScaledVector(v, -direction.z * (sprint ? 50 : 40));

      if (this.canJump && jump) {
        velocity.y = 50;
        this.canJump = false;
      }

      // NOTE: move to something like a gun controller
      if (mouseButtonStates[0] && this.canShoot) {
        getRoom()?.send("shoot", {
          position: camera.position.toArray(),
          direction: controls.getDirection(new Vector3()).toArray(),
        });

        this.canShoot = false;
        setTimeout(() => {
          this.canShoot = true;
        }, 100);
      }
    }

    // stop the player from falling too far
    if (position.y < -400) {
      velocity.y = 0;
    }

    position.addScaledVector(velocity, delta);
  }
}

PlayerController.queries = {
  player: {
    components: [LocalPlayerTag, Movement],
  },
  collision: {
    components: [Object3DComponent, PlayerCollisionTag],
  },
};
