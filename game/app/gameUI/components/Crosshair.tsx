import styled from "@emotion/styled";
import crosshairUrl from "../../assets/crosshair.svg";

const Image = styled.img`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const Crosshair = () => <Image src={crosshairUrl} />;
