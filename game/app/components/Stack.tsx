import styled from "@emotion/styled";

type Props = {
  direction?: "column" | "row";
  gap?: number | string;
};

export const Stack = styled.div<Props>`
  display: flex;
  flex-direction: ${(p) => p.direction || "row"};
  gap: ${(p) => (typeof p.gap === "number" ? p.gap + "px" : p.gap) || "1rem"};
`;
