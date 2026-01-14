import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;

    // Log error details server-side for debugging
    log(`❌ Error ${status}: ${err.message || 'Unknown error'}`, "error");
    if (process.env.NODE_ENV !== "production" && err.stack) {
      log(`   Stack: ${err.stack}`, "error");
    }

    // Don't expose sensitive error details to clients
    const isClientError = status >= 400 && status < 500;
    const message = isClientError
      ? (err.message || "Bad request")
      : "An error occurred. Please try again later.";

    // Send secure error response
    res.status(status).json({
      success: false,
      error: isClientError ? "CLIENT_ERROR" : "SERVER_ERROR",
      message
    });

    // Don't re-throw - it causes issues with error handling
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      const url = `http://localhost:${port}`;
      log(`serving on port ${port}`);
      
      if (process.env.NODE_ENV !== "production") {
        log(`\n✓ Server running at ${url}`);
        log(`  To view in Cursor's browser preview:`);
        log(`  1. Press Ctrl+Shift+V (or View > Open Preview)`);
        log(`  2. Paste this URL: ${url}\n`);
      } else {
        log(`\n✓ Server running at ${url}\n`);
      }
    },
  );
})();
