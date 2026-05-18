import { createRoot } from "react-dom/client";
import { ThirdwebProvider } from "thirdweb/react";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ThirdwebProvider>
      <App />
    </ThirdwebProvider>
  </HelmetProvider>
);
