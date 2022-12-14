import { Clock, DirectionalLight, HemisphereLight, MathUtils, Vector3 } from "three";
import { Sky } from "three/examples/jsm/objects/Sky";

import { SceneSystem } from "./systems/scene";
import { Movement } from "./components/movement";
import { BulletTag, InSceneTag, LocalPlayerTag, PlayerCollisionTag, RemotePlayerTag } from "./components/tags";
import { RenderSystem } from "./systems/render";
import { ControlsSystem } from "./systems/controls";
import { StatsSystem } from "./systems/stats";
import { Object3DComponent } from "./components/object3D";
import { PositionSyncSystem } from "./systems/position-sync";
import { PlayerController } from "./systems/player-controller";
import { ExtendedWorld } from "./utils/extended-world";
import { VoxelWorldSystem } from "./systems/voxel-world";
import { RemotePlayerSystem } from "./systems/remote-players";
import { MovementSystem } from "./systems/movement";
import { BulletSystem } from "./systems/bullet-system";
import { onTimeChange } from "./connection";

export class Game {
  world = new ExtendedWorld();
  clock = new Clock();

  time: number = 0;
  sky: Sky;

  constructor() {
    // components
    this.world.registerComponent(Object3DComponent).registerComponent(Movement);

    // tags
    this.world
      .registerComponent(BulletTag)
      .registerComponent(LocalPlayerTag)
      .registerComponent(RemotePlayerTag)
      .registerComponent(InSceneTag)
      .registerComponent(PlayerCollisionTag);

    // systems
    this.world
      .registerSystem(SceneSystem)
      .registerSystem(RenderSystem, { priority: 999 })
      .registerSystem(ControlsSystem)
      .registerSystem(PlayerController)
      .registerSystem(RemotePlayerSystem)
      .registerSystem(BulletSystem)
      .registerSystem(MovementSystem)
      .registerSystem(PositionSyncSystem)
      .registerSystem(VoxelWorldSystem)
      .registerSystem(StatsSystem, { priority: 1000 });

    // create local player
    this.world
      .createEntity("Player")
      .addComponent(Movement)
      .addComponent(Object3DComponent, { object: this.world.getSystem(ControlsSystem).controls.getObject() })
      .addComponent(LocalPlayerTag);

    // sky
    const sky = (this.sky = new Sky());
    sky.scale.setScalar(40000);
    this.world.createEntity("sky").addComponent(Object3DComponent, { object: sky });

    sky.material.uniforms.turbidity.value = 10;
    sky.material.uniforms.rayleigh.value = 3;
    sky.material.uniforms.mieCoefficient.value = 0.005;
    sky.material.uniforms.mieDirectionalG.value = 0.7;

    // keep time in sync
    onTimeChange.addListener((time) => {
      this.time = time;
    });

    // NOTE: move this out to another system
    const scene = this.world.getSystem(SceneSystem).scene;

    // light
    const hemiLight = new HemisphereLight(0x888888, 0x444444, 1);
    scene.add(hemiLight);

    const dirLight = new DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(1.5, 3, 2.5);
    scene.add(dirLight);

    // const dirLight2 = new DirectionalLight(0xffffff, 0.5);
    // dirLight2.position.set(-1.5, -3, -2.5);
    // scene.add(dirLight2);

    if (import.meta.env.DEV) {
      import("./debug").then((m) => m.setup(this.world));
    }
  }
  animate = () => {
    const now = new Date().valueOf();
    const delta = this.clock.getDelta();
    this.world.execute(delta, now);

    this.time += delta;
    this.setSun();

    if (this.world.enabled) {
      requestAnimationFrame(this.animate);
    }
  };
  setSun() {
    const phi = MathUtils.degToRad(this.time % 360);
    const theta = Math.PI; //MathUtils.degToRad(180);
    this.sky.material.uniforms.sunPosition.value.setFromSphericalCoords(1, phi, theta);
  }
  stop() {
    this.world.stop();
  }
  play() {
    this.world.play();

    // reset clock and start world
    this.clock.getDelta();
    this.animate();
  }

  get domElement() {
    return this.world.getSystem(RenderSystem).renderer.domElement;
  }
}
