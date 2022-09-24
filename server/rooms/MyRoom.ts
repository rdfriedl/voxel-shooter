// rooms/MyRoom.ts (server-side, room file)
import { Client, Room } from "colyseus";
import { State } from "../../common/schema";

export class MyRoom extends Room<State> {
  // number of clients per room
  // (colyseus will create the room instances for you)
  maxClients = 10;

  // room has been created: bring your own logic
  async onCreate(options) {
    console.log("Room created!", options);

    this.setState(new State());

    // this.onMessage("move", (client, { position, velocity }: { position: Vector; velocity: Vector }) => {
    //   this.state.movePlayer(client.sessionId, position, velocity);
    // });

    this.clock.setInterval(() => {
      this.state.timeLeft -= 1;
      console.log("countdown");
    }, 1000);
  }

  onAuth(client, options, req) {
    return true;
  }

  // client joined: bring your own logic
  async onJoin(client: Client) {
    console.log("creating player");

    this.state.createPlayer(client.sessionId);
  }

  // client left: bring your own logic
  async onLeave(client: Client) {
    this.state.removePlayer(client.sessionId);
  }

  // room has been disposed: bring your own logic
  async onDispose() {}
}
