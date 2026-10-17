// MSW v2 compatible server setup
// Import from 'msw' instead of 'msw/node' in v2
import { handlers } from './msw-handlers';

// Dynamically import setupServer for Node environment
let server: any;

if (typeof window === 'undefined') {
  // Server-side (Node/Jest environment)
  const { setupServer } = require('msw/node');
  server = setupServer(...handlers);
  
  // Setup/teardown for Jest
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}

export { server };
