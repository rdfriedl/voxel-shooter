import styled from "@emotion/styled";
import { getRoom, onPlayerHealthChange } from "../../../connection";
import { useForceUpdate } from "../../hooks/use-force-update";
import { useSignal } from "../../hooks/use-signal";

const Progress = styled.progress`
  height: 2rem;
  width: 20vw;
`;

export const HealthBar = () => {
  const update = useForceUpdate();
  useSignal(onPlayerHealthChange, update);

  const room = getRoom();
  const health = room?.state.players.get(room.sessionId)?.health ?? 0;

  return <Progress value={health} max={100} />;
};
