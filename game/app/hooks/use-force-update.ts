import { useCallback, useState } from "react";

export function useForceUpdate() {
  const [_, update] = useState<Object>();

  return useCallback(() => update({}), [update]);
}
