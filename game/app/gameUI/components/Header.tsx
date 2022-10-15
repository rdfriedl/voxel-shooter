import styled from "@emotion/styled";
import { getRoom, onPlayerJoin, onPlayerLeave } from "../../../connection";
import { useForceUpdate } from "../../hooks/use-force-update";
import { useSignal } from "../../hooks/use-signal";

const Layout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlayerCount = styled.span`
  font-weight: bold;
  font-size: 4rem;
`;

export const Header = () => {
  const update = useForceUpdate();

  useSignal(onPlayerJoin, update);
  useSignal(onPlayerLeave, update);

  const room = getRoom();

  return (
    <Layout>
      <PlayerCount>{room?.state?.players.size}</PlayerCount>
    </Layout>
  );
};
