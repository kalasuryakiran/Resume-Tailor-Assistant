import serverless from "serverless-http";
import { app, start } from "../../server/app";

// Initialize the app
start();

// Export the handler for Netlify
export const handler = serverless(app);