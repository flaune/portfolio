import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeCache } from "./lib/cache";

// Initialize cache system (cleanup, monitoring, periodic maintenance)
initializeCache();

createRoot(document.getElementById("root")!).render(<App />);
