import { createServer } from 'http';
import { config } from 'dotenv';
import chatHandler from './api/chat.mjs';
import createCheckoutHandler from './api/lemonsqueezy/create-checkout.mjs';

// Load environment variables from .env.local for local development
config({ path: '.env.local', override: true });

// Set API key directly for local development (NEVER commit this to production)
process.env.AI_GATEWAY_API_KEY = 'vck_0cLGT0yOnAoMIHEXGzjwHDilMGpM5MazeOD2ceFT5MHo0XQy3N2kOwJX';

// Debug: Check if API key is loaded
console.log('🔑 Local Development Environment Check:');
console.log('AI_GATEWAY_API_KEY exists:', !!process.env.AI_GATEWAY_API_KEY);
console.log('AI_GATEWAY_API_KEY length:', process.env.AI_GATEWAY_API_KEY?.length || 0);
console.log('AI_GATEWAY_API_KEY starts with:', process.env.AI_GATEWAY_API_KEY?.substring(0, 10) + '...');

const PORT = 3001;

const parseJsonBody = (req) => new Promise((resolve, reject) => {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    if (!body) {
      req.body = {};
      resolve();
      return;
    }

    try {
      req.body = JSON.parse(body);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
});

const handleRequestWithJson = async (req, res, handler) => {
  try {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      await parseJsonBody(req);
    }
    await handler(req, res);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('❌ Error parsing request body:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    console.error('❌ Error in handler:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};

const server = createServer(async (req, res) => {
  console.log(`📡 Local API Server: ${req.method} ${req.url}`);

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const { url, method } = req;
  const parsedUrl = new URL(url, 'http://localhost');
  const pathname = parsedUrl.pathname.replace(/\/$/, '');

  if (pathname === '/chat' || pathname === '/api/chat') {
    await handleRequestWithJson(req, res, chatHandler);
    return;
  }

  if (
    pathname === '/lemonsqueezy/create-checkout' ||
    pathname === '/api/lemonsqueezy/create-checkout' ||
    pathname === '/lemonsqueezy-checkout'
  ) {
    await handleRequestWithJson(req, res, createCheckoutHandler);
    return;
  }

  console.warn(`⚠️ No handler found for ${method} ${pathname}`);
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Local API Server running on http://localhost:${PORT}`);
  console.log('📝 Chat endpoint: http://localhost:3001/chat');
  console.log('🔑 Using local API key for development only');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down local API server...');
  server.close(() => {
    console.log('✅ Local API server stopped');
    process.exit(0);
  });
});
