import { Component, Types } from "ecsy";
import { Object3D } from "three";

export class Object3DComponent extends Component<{}> {
  object: Object3D = new Object3D();
}
Object3DComponent.schema = {
  object: { type: Types.Ref },
};
