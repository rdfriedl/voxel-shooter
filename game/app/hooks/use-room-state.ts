import { useEffect, useState } from "react";
import { getRoom } from "../../connection";

export function useRoomState() {
  const [state, setState] = useState(getRoom()?.state);

  useEffect(() => {
    const room = getRoom();

    if (room) {
      room.onStateChange(setState);
    }

    return () => room?.onStateChange.remove(setState);
  });

  return state;
}
