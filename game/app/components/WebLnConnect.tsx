import { useCallback, useState } from "react";
import { WebLNProvider, requestProvider } from "webln";

import Button from "@mui/joy/Button";
import BoltIcon from "@mui/icons-material/Bolt";
import CircularProgress from "@mui/joy/CircularProgress";

export type WebLnConnectProps = {
  onSuccess?: (provider: WebLNProvider) => void;
  onFail?: (err: Error) => void;
};

export const WebLnConnect = ({ onSuccess, onFail }: WebLnConnectProps) => {
  const [loading, setLoading] = useState(false);

  const connect = useCallback(async () => {
    try {
      setLoading(true);
      const provider = await requestProvider();
      if (onSuccess) onSuccess(provider);
    } catch (err) {
      if (onFail) onFail(err as Error);
    }
    setLoading(false);
  }, [setLoading, onSuccess, onFail]);

  return (
    <Button
      color="warning"
      variant="solid"
      startDecorator={loading ? <CircularProgress size="sm" color="warning" variant="plain" /> : <BoltIcon fontSize="small" />}
      disabled={loading}
      onClick={connect}
    >
      Use WebLN
    </Button>
  );
};
