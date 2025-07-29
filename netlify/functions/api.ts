const serverless = require("serverless-http");

// Use dynamic import for ESM modules
let appInstance: any = null;

export const handler = async (event: any, context: any) => {
  if (!appInstance) {
    // Dynamically import the ESM modules
    const { app, start } = await import("../../server/netlify-app");
    await start();
    appInstance = serverless(app);
  }
  
  return appInstance(event, context);
};