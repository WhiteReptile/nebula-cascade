import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Portfolio from "@/pages/Portfolio";
import Landing from "@/pages/Landing";
import WorkCase from "@/pages/WorkCase";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/film" element={<Landing />} />
        <Route path="/work/:slug" element={<WorkCase />} />
        <Route path="/game" element={<Navigate to="/film" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
