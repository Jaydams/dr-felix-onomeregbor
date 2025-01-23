import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Approved from "./components/Approved.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="/approve" element={<Approved />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
