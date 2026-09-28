/* global document, Office */
import * as React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { useSettings } from "../state";

Office.onReady(() => {
  useSettings.getState().load();
  createRoot(document.getElementById("root")!).render(<App />);
});
