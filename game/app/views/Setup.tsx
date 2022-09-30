import { useState } from "react";
import styled from "@emotion/styled";
import { WebLNProvider } from "webln";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";

import { WebLnConnect } from "../components/WebLnConnect";
import { LnAddressForm } from "../components/LnAddressForm";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
`;

type SubmitData = {
  address?: string;
  webln?: WebLNProvider;
};
export type SetupViewProps = {
  onSubmit: (data: SubmitData) => void;
};

export const SetupView = ({ onSubmit }: SetupViewProps) => {
  const [selected, setSelected] = useState("none");

  const options = (
    <>
      <Divider>Login with</Divider>
      <Button onClick={() => setSelected("address")} startDecorator={<AlternateEmailIcon fontSize="small" />}>
        Lightning Address
      </Button>
      <WebLnConnect onSuccess={(provider) => onSubmit({ webln: provider })} />
      <Divider>Or</Divider>
      <Button variant="soft" onClick={() => onSubmit({})}>
        Play without lightning
      </Button>
    </>
  );

  const renderContent = () => {
    switch (selected) {
      case "address":
        return <LnAddressForm onSubmit={(address) => onSubmit({ address })} />;
    }
  };

  return (
    <Layout>
      <h1>Voxel Shooter</h1>
      {selected === "none" ? options : renderContent()}
    </Layout>
  );
};
