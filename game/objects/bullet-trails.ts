import { Group, Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { Bullet, BulletManager } from "../../common/bullets/core";

class BulletObject extends Mesh {
  bullet: Bullet;

  static geometry = new SphereGeometry(0.2);
  static material = new MeshBasicMaterial({ color: 0xffffff });

  constructor(bullet: Bullet) {
    super(BulletObject.geometry, BulletObject.material);
    this.bullet = bullet;
  }

  update() {
    this.position.copy(this.bullet.position);
  }
}
// class BulletObject extends Line2 {
//   bullet: Bullet;

//   static geometry = new LineGeometry().setPositions([0, 0, 0, 0, 3, 0]).setColors([0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
//   static material = new LineMaterial({
//     color: 0xffffff,
//     linewidth: 0.0, // in world units with size attenuation, pixels otherwise
//     vertexColors: true,
//   });

//   constructor(bullet: Bullet) {
//     super(BulletObject.geometry, BulletObject.material);
//     this.bullet = bullet;
//   }

//   update() {
//     this.position.copy(this.bullet.position);
//   }
// }

export class BulletTrails extends Group {
  manager: BulletManager;
  objects: BulletObject[] = [];

  constructor(manager: BulletManager) {
    super();

    this.manager = manager;
  }

  update() {
    for (let i = 0; i < this.manager.bullets.length; i++) {
      const bullet = this.manager.bullets[i];
      let object = this.objects[i];
      if (!object) {
        object = new BulletObject(bullet);
        this.objects[i] = object;
        this.add(object);
      }
      object.bullet = bullet;
      object.visible = true;
      object.update();
    }
    for (let i = this.manager.bullets.length; i < this.objects.length; i++) {
      const object = this.objects[i];
      object.visible = false;
    }
  }
}
