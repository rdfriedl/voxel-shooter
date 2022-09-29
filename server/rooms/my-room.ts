// rooms/MyRoom.ts (server-side, room file)
import { Client, Room } from "colyseus";
import { Player, State } from "../../common/schema";

export class MyRoom extends Room<State> {
  // number of clients per room
  // (colyseus will create the room instances for you)
  maxClients = 10;

  // room has been created: bring your own logic
  async onCreate(options) {
    console.log("Room created!", options);

    this.setState(new State());

    this.onMessage("position", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.position.x = message.position.x;
        player.position.y = message.position.y;
        player.position.z = message.position.z;
        player.velocity.x = message.velocity.x;
        player.velocity.y = message.velocity.y;
        player.velocity.z = message.velocity.z;
      } else {
        console.log("missing player for " + client.sessionId);
      }
    });

    this.onMessage("shoot", this.handleShoot);
  }

  handleShoot(client: Client, message: any) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    for (const other of this.clients) {
      other.send("new-bullet", message);
    }
  }

  onAuth(client, options, req) {
    return true;
  }

  // client joined: bring your own logic
  async onJoin(client: Client) {
    console.log("creating player for", client.sessionId);
    this.state.players.set(client.sessionId, new Player());

    client.send("hello", `hello ${client.sessionId}`);
  }

  // client left: bring your own logic
  async onLeave(client: Client) {
    console.log(`player ${client.sessionId} left`);
    this.state.players.delete(client.sessionId);
  }

  // room has been disposed: bring your own logic
  async onDispose() {}
}
