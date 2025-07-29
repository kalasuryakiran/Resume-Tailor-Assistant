import { app, start } from "./app";
import { setupVite, serveStatic, log } from "./vite";

(async () => {
  const server = await start();

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
