import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell, PublicLayout } from "./components/Layout";
import Landing from "./pages/Landing";
import ModelPerformance from "./pages/ModelPerformance";
import Analyze from "./pages/Analyze";
import { About, Help, HowItWorks, Privacy } from "./pages/Info";
import { NotFound, Overview, SystemStatus } from "./pages/AppPages";
import "./styles/styles.css";

// Routes for later phases (auth, history, analytics, settings) are added as they are built.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="model-performance" element={<ModelPerformance />} />
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="help" element={<Help />} />
        </Route>
        <Route path="app" element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="analyze" element={<Analyze />} />
          <Route path="system-status" element={<SystemStatus />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
