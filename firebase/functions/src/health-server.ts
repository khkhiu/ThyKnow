// firebase/functions/src/health-server.ts

import * as http from 'http';

/**
 * Creates and starts a minimal HTTP server for Cloud Run health checks
 * 
 * Cloud Run needs an HTTP server listening on $PORT (default: 8080)
 * This is required even for non-HTTP functions like Pub/Sub triggers
 */
export function startHealthCheckServer(): void {
  // Get port from environment variable or use 8080 as default
  const port = parseInt(process.env.PORT || '8080', 10);
  
  // Create a simple HTTP server
  const server = http.createServer((req, res) => {
    // For health checks
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'healthy' }));
      return;
    }
    
    // For any other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });
  
  // Start the server
  server.listen(port, () => {
    console.log(`Health check server listening on port ${port}`);
  });
  
  // Handle errors
  server.on('error', (error) => {
    console.error('Health check server error:', error);
    // Don't exit the process - this would cause the container to restart
    // which could lead to a restart loop
  });
}