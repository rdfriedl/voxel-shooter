import { useState, ReactNode } from "react";
import { useMemo } from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { createContext } from "react";

export type OptionsShape = {
  lnAddress: string;
};
type OptionsCtx = {
  options: OptionsShape;
  setOptions: (options: Partial<OptionsShape>) => void;
};

const OptionsContext = createContext<OptionsCtx | null>(null);

export function useOptions() {
  const ctx = useContext(OptionsContext);
  if (!ctx) throw new Error("missing provider");

  return ctx;
}

export const OptionsProvider = ({ children }: { children: ReactNode }) => {
  const [value, set] = useState<OptionsShape>({ lnAddress: "" });

  const setOptions = useCallback(
    (options: Partial<OptionsShape>) => {
      set((curr) => ({ ...curr, ...options }));
    },
    [set]
  );

  const ctx = useMemo<OptionsCtx>(
    () => ({
      options: value,
      setOptions,
    }),
    [value, setOptions]
  );

  return <OptionsContext.Provider value={ctx}>{children}</OptionsContext.Provider>;
};
