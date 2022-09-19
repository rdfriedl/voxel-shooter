import { Schema, type } from "@colyseus/schema";

export class MyState extends Schema {
  @type("string") currentTurn: string = "none";
}
