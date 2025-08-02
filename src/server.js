const app = require('./app');
const db = require('../config/database');

const PORT = process.env.PORT || 3000;

// Test database connection on startup
async function startServer() {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    console.log('🗄️  Database connection successful');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 ShelFie API server running on http://localhost:${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();