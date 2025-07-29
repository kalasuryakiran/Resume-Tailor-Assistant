import { Handler } from '@netlify/functions';
import serverless from 'serverless-http';

let appInstance: any = null;

export const handler: Handler = async (event, context) => {
  try {
    // Set longer timeout for Netlify functions
    context.callbackWaitsForEmptyEventLoop = false;
    
    if (!appInstance) {
      console.log('Initializing serverless function...');
      // Dynamically import the ESM modules
      const { app, start } = await import("../../server/netlify-app");
      await start();
      appInstance = serverless(app);
      console.log('Serverless function initialized successfully');
    }
    
    return await appInstance(event, context);
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};