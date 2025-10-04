require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || 'localhost',
  
  zoom: {
    apiKey: process.env.ZOOM_API_KEY,
    apiSecret: process.env.ZOOM_API_SECRET,
    webhookSecret: process.env.ZOOM_WEBHOOK_SECRET,
    apiBaseUrl: process.env.ZOOM_API_BASE_URL || 'https://api.zoom.us/v2',
    oauthUrl: process.env.ZOOM_OAUTH_URL || 'https://zoom.us/oauth/token'
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'pegasus_edtech',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },

  // Validation helper
  validate() {
    const required = {
      'ZOOM_API_KEY': this.zoom.apiKey,
      'ZOOM_API_SECRET': this.zoom.apiSecret,
      'JWT_SECRET': this.jwt.secret
    };

    const missing = Object.entries(required)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0 && this.env === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return true;
  }
};

module.exports = config;

