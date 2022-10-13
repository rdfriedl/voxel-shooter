import Sheet from "@mui/joy/Sheet";
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
    <Sheet color="neutral" variant="soft">
      {players.map(([id, player]) => (
        <div key={id}>{player.id}</div>
      ))}
    </Sheet>
  );
};
