import serverless from "serverless-http";
import { app, start } from "../../server/app";

// Initialize the app for Netlify
let initialized = false;

export const handler = serverless(app, {
  async request(req: any, event: any, context: any) {
    if (!initialized) {
      await start();
      initialized = true;
    }
  }
});