import { Component, Entity, Types } from "ecsy";
import { Vector3 } from "three";
import { VectorType } from "./types";

export class Movement extends Component<{}> {
  position: Vector3 = new Vector3();
  velocity: Vector3 = new Vector3();
}
Movement.schema = {
  position: { type: VectorType },
  velocity: { type: VectorType },
};
