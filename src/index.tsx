import { serve } from "bun";
import index from "./index.html";

// Start server on PORT or 3000; if that port is in use,
// increment the port number until a free one is found.
async function startServer() {
  let port = Number(process.env.PORT ?? "3000");
  if (!Number.isFinite(port) || port <= 0) port = 3000;

  while (true) {
    try {
      const server = serve({
        port,
        routes: {
          // Serve index.html for all unmatched routes.
          "/*": index,
        },

        development: process.env.NODE_ENV !== "production" && {
          // Enable browser hot reloading in development
          hmr: true,

          // Echo console logs from the browser to the server
          console: true,
        },
      });

      console.log(`🚀 Server running at ${server.url}`);
      break;
    } catch (error) {
      const message = String(
        (error as { message?: string; code?: string })?.message ?? error ??
          "Unknown error",
      );
      const code = (error as { code?: string })?.code;

      // Bun throws EADDRINUSE when port is in use; in that case, retry
      if (code === "EADDRINUSE" || message.includes("EADDRINUSE")) {
        console.warn(
          `⚠️ Port ${port} is in use. Trying port ${
            port + 1
          }...`,
        );
        port += 1;
        continue;
      }

      console.error("❌ Failed to start server:", error);
      throw error;
    }
  }
}

startServer().catch((error) => {
  console.error("❌ Unhandled server startup error:", error);
  process.exit(1);
});

