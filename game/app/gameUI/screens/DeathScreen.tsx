import { useCallback, useEffect } from "react";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";

import { Game } from "../../../game";
import { ControlsSystem } from "../../../systems/controls";
import { getRoom } from "../../../connection";

export const DeathScreen = ({ game }: { game: Game }) => {
  useEffect(() => {
    // on mount make sure the controls are unloaded
    const controls = game.world.getSystem(ControlsSystem).controls;

    if (controls.isLocked) controls.unlock();
  }, []);

  const respawn = useCallback(() => {
    const room = getRoom();
    if (room) {
      room.send("respawn");

      // lock the cursor
      game.world.getSystem(ControlsSystem).controls.lock();
    }
  }, []);

  return (
    <Modal open>
      <ModalDialog>
        <Button variant="solid" color="primary" onClick={respawn}>
          Respawn
        </Button>
      </ModalDialog>
    </Modal>
  );
};
