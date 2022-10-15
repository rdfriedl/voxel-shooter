import styled from "@emotion/styled";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import { keyStates, onKeyStatesChange } from "../../../utils/key-states";
import { Game } from "../../../game";

import { useForceUpdate } from "../../hooks/use-force-update";
import { useSignal } from "../../hooks/use-signal";

import { Header } from "../components/Header";
import { Scoreboard } from "../components/Scoreboard";
import { HealthBar } from "../components/HealthBar";
import { Crosshair } from "../components/Crosshair";

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

const StyledHeader = styled(Header)`
  width: 100%;
  pointer-events: initial;
`;
const Empty = styled.div`
  flex: 1;
  pointer-events: none;
`;
const BottomBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
`;

export const GameOverlayScreen = ({ game }: { game: Game }) => {
  const update = useForceUpdate();
  useSignal(onKeyStatesChange, update);

  return (
    <>
      <Layout>
        <StyledHeader />
        <Empty />
        <BottomBar>
          <HealthBar />
          <Empty />
        </BottomBar>
      </Layout>
      <Crosshair />
      <Modal open={!!keyStates["Tab"]} hideBackdrop>
        <ModalDialog size="lg">
          <Scoreboard />
        </ModalDialog>
      </Modal>
    </>
  );
};
