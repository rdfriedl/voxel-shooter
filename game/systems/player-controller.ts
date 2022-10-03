import { System } from "ecsy";
import { Object3D, Raycaster, Vector3 } from "three";
import { Movement } from "../components/movement";
import { Object3DComponent } from "../components/object3D";
import { LocalPlayerTag, PlayerCollisionTag } from "../components/tags";
import { getRoom } from "../connection";
import { keyStates, mouseButtonStates } from "../utils/key-states";
import { ControlsSystem } from "./controls";

export class PlayerController extends System {
  raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10);
  canJump = false;
  canShoot = true;
  interval: NodeJS.Timer | undefined;
  init() {
    this.interval = setInterval(() => {
      const room = getRoom();

      const player = this.queries.player.results[0];
      const movement = player.getComponent(Movement);
      if (!movement || !room) return;

      room.send("position", {
        position: movement.position,
        velocity: movement.velocity,
      });
    }, 1000 / 30);
  }
  stop() {
    if (this.interval) clearInterval(this.interval);
  }
  execute(delta: number, time: number) {
    const direction = new Vector3();
    const controls = this.world.getSystem(ControlsSystem).controls;

    this.queries.player.results.forEach((entity) => {
      const movement = entity.getMutableComponent(Movement);
      if (!movement) return;

      const velocity = movement.velocity;
      const position = movement.position;

      if (controls.isLocked === true) {
        this.raycaster.ray.origin.copy(position);
        const collisions = this.queries.collision.results
          .map((e) => e.getComponent(Object3DComponent)?.object)
          .filter(Boolean) as Object3D[];
        const intersections = this.raycaster.intersectObjects(collisions, true);
        const standingOn = intersections[0];

        velocity.y -= 9.8 * 20 * delta;
        velocity.z -= velocity.z * 8 * delta;
        velocity.x -= velocity.x * 8 * delta;

        const moveForward = keyStates["KeyW"] ?? false;
        const moveBackward = keyStates["KeyS"] ?? false;
        const moveLeft = keyStates["KeyA"] ?? false;
        const moveRight = keyStates["KeyD"] ?? false;
        const jump = keyStates["Space"] ?? false;
        const sprint = keyStates["ShiftLeft"] ?? false;

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
        } else if (standingOn && velocity.y < 0) {
          velocity.y = Math.max(0, velocity.y);
          position.y = standingOn.point.y + this.raycaster.far;
          this.canJump = true;
        }

        position.addScaledVector(velocity, delta);

        if (position.y < -100) {
          velocity.y = 0;
          position.y = 100;
        }

        if (mouseButtonStates[0] && this.canShoot) {
          getRoom()?.send("shoot", {
            position: camera.position.toArray(),
            direction: controls.getDirection(new Vector3()).toArray(),
          });

          this.canShoot = false;
          setTimeout(() => {
            this.canShoot = true;
          }, 120);
        }
      }
    });
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
