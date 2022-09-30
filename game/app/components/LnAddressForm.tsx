import { useCallback, useEffect, useState } from "react";
import Input from "@mui/joy/Input";
import BoltIcon from "@mui/icons-material/Bolt";
import Chip from "@mui/joy/Chip";
import FormControl from "@mui/joy/FormControl";
import Link from "@mui/joy/Link";
import FormHelperText from "@mui/joy/FormHelperText";
import Button from "@mui/joy/Button";
import { Stack } from "./Stack";

export type LnAddressFormProps = {
  onSubmit: (address: string) => void;
};

export const LnAddressForm = ({ onSubmit }: LnAddressFormProps) => {
  const [address, setAddress] = useState("");
  const [valid, setValid] = useState(false);

  const checkAddress = useCallback(
    async (lnAddress: string) => {
      if (!lnAddress) return setValid(false);
      const parts = lnAddress.split("@");
      const username = parts[0];
      const domain = parts[1];
      if (!username || !domain) return setValid(false);

      const res = await fetch(`https://${domain}/.well-known/lnurlp/${username}`);
      setValid(res.ok);
    },
    [setValid]
  );

  useEffect(() => {
    const handler = setTimeout(() => checkAddress(address), 1000);
    return () => clearTimeout(handler);
  }, [address]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit && onSubmit(address);
      }}
    >
      <FormControl>
        <Stack>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Lightning Address"
            color={address && valid ? "success" : "neutral"}
            required
            error={address ? !valid : false}
            startDecorator={<BoltIcon fontSize="small" />}
            endDecorator={address && valid ? <Chip color="success">Valid</Chip> : null}
            size="lg"
            autoFocus
          />
          <Button disabled={!valid} variant="solid" color="primary" size="lg" type="submit">
            Play
          </Button>
        </Stack>
        <FormHelperText>
          <Link href="https://lightningaddress.com/" target="_blank">
            Don't have a lighting address?
          </Link>
        </FormHelperText>
      </FormControl>
    </form>
  );
};
