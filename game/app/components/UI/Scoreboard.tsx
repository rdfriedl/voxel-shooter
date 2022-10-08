import Sheet from "@mui/joy/Sheet";
import { useRoomState } from "../../hooks/use-room-state";

export const Scoreboard = () => {
  const state = useRoomState();

  const players = Array.from(state?.players.entries() || []);

  return (
    <Sheet color="neutral" variant="soft">
      {players.map(([id, player]) => (
        <div key={id}>{player.id}</div>
      ))}
    </Sheet>
  );
};
