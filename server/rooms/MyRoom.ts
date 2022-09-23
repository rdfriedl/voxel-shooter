// rooms/MyRoom.ts (server-side, room file)
import { Client, Room } from "colyseus";
import { IncomingMessage } from "http";
import { MyState } from "../../common/schema";

export class MyRoom extends Room<MyState> {
  // number of clients per room
  // (colyseus will create the room instances for you)
  maxClients = 4;

  // room has been created: bring your own logic
  async onCreate(options) {
    this.setState(new MyState());
  }

  // client joined: bring your own logic
  async onJoin(client, options) {}

  // client left: bring your own logic
  async onLeave(client, consented) {}

  // room has been disposed: bring your own logic
  async onDispose() {}
}
