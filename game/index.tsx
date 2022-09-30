import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { AllProviders } from "./app/providers/all";

const root = createRoot(document.getElementById("root") || document.createElement("div"));
root.render(
  <AllProviders>
    <App />
  </AllProviders>
);
