import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeCache } from "./lib/cache";

// Render immediately - don't block on cache initialization
createRoot(document.getElementById("root")!).render(<App />);

// Initialize cache system AFTER React starts rendering (non-blocking)
// This runs in the background and doesn't delay first paint
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initializeCache());
  } else {
    setTimeout(() => initializeCache(), 0);
  }
}
