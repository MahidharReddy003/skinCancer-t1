import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell, PublicLayout } from "./components/Layout";
import Landing from "./pages/Landing";
import ModelPerformance from "./pages/ModelPerformance";
import { NotFound, Overview, SystemStatus } from "./pages/AppPages";
import "./styles/styles.css";

// Routes for later phases (how-it-works, auth, analyze, history, analytics, settings, privacy, help) are added as they are built.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="model-performance" element={<ModelPerformance />} />
        </Route>
        <Route path="app" element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="system-status" element={<SystemStatus />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
