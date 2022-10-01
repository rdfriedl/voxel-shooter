import styled from "@emotion/styled";
import CircularProgress from "@mui/joy/CircularProgress";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
`;

export const LoadingView = ({ title }: { title: string }) => (
  <Layout>
    <h1>{title}</h1>
    <CircularProgress variant="soft" size="lg" />
  </Layout>
);
