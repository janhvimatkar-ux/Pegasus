import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  zoom: {
    apiKey: process.env.ZOOM_API_KEY || 'mock_zoom_api_key',
    apiSecret: process.env.ZOOM_API_SECRET || 'mock_zoom_api_secret',
    apiBaseUrl: 'https://api.zoom.us/v2',
  },
  mail: {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'your-ethereal-user',
      pass: 'your-ethereal-password'
    }
  }
};

export default config;
