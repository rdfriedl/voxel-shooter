import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import { getRoom, onPlayerJoin, onPlayerLeave } from "../../../connection";
import { useForceUpdate } from "../../hooks/use-force-update";
import { useSignal } from "../../hooks/use-signal";

export const Scoreboard = () => {
  const update = useForceUpdate();
  useSignal(onPlayerJoin, update);
  useSignal(onPlayerLeave, update);

  const room = getRoom();
  const players = Array.from(room?.state?.players.entries() || []);

  return (
    <List variant="outlined">
      {players.map(([id, player]) => (
        <ListItem key={id}>{player.id}</ListItem>
      ))}
    </List>
  );
};
