import styled from "@emotion/styled";
import { useRoomState } from "../../hooks/use-room-state";

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
  const state = useRoomState();

  return (
    <Layout>
      <PlayerCount>{state?.players.size}</PlayerCount>
    </Layout>
  );
};
