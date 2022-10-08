import styled from "@emotion/styled";
import { keyStates, onKeyStatesChange } from "../../utils/key-states";
import { useForceUpdate } from "../hooks/use-force-update";
import { useSignal } from "../hooks/use-signal";
import { Header } from "./UI/Header";
import { Scoreboard } from "./UI/Scoreboard";

import crosshairUrl from "../assets/crosshair.svg";

const Layout = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  pointer-events: none;
`;

const Crosshair = styled.img`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
const StyledHeader = styled(Header)`
  width: 100%;
  pointer-events: initial;
`;
const Empty = styled.div`
  flex: 1;
  pointer-events: none;
`;
const ScoreboardContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

export const GameUI = () => {
  const update = useForceUpdate();
  useSignal(onKeyStatesChange, update);

  return (
    <>
      <Layout>
        <StyledHeader />
        <Empty />
      </Layout>
      <Crosshair src={crosshairUrl} />
      {keyStates["Tab"] && (
        <ScoreboardContainer>
          <Scoreboard />
        </ScoreboardContainer>
      )}
    </>
  );
};
