import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { RuntimeView } from "./technology/RuntimeView";
import { caseById } from "./technology/registry";
const captureId = new URLSearchParams(location.search).get("capture");
const captureCase = captureId ? caseById.get(captureId) : null;
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {captureCase ? (
      <div className="capture-root" style={{ width: 960, height: 540 }}>
        <RuntimeView definition={captureCase} capture />
      </div>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
