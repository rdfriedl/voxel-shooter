import { useEffect } from "react";
import { Listener, Signal } from "../../../common/utils/emitter";

export function useSignal<T extends any[]>(signal: Signal<any>, listener: Listener<T>, ctx?: any) {
  useEffect(() => {
    signal.addListener(listener, ctx);

    return () => signal.removeListener(listener);
  }, [signal, listener]);
}
