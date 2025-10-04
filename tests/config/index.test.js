const config = require('../../src/config');

describe('Config', () => {
  describe('configuration values', () => {
    it('should have default values', () => {
      expect(config).toHaveProperty('env');
      expect(config).toHaveProperty('port');
      expect(config).toHaveProperty('host');
      expect(config).toHaveProperty('zoom');
      expect(config).toHaveProperty('database');
      expect(config).toHaveProperty('jwt');
      expect(config).toHaveProperty('logging');
      expect(config).toHaveProperty('rateLimit');
    });

    it('should have zoom configuration', () => {
      expect(config.zoom).toHaveProperty('apiKey');
      expect(config.zoom).toHaveProperty('apiSecret');
      expect(config.zoom).toHaveProperty('webhookSecret');
      expect(config.zoom).toHaveProperty('apiBaseUrl');
      expect(config.zoom).toHaveProperty('oauthUrl');
    });

    it('should have database configuration', () => {
      expect(config.database).toHaveProperty('host');
      expect(config.database).toHaveProperty('port');
      expect(config.database).toHaveProperty('name');
      expect(config.database).toHaveProperty('user');
      expect(config.database).toHaveProperty('password');
    });

    it('should have logging configuration', () => {
      expect(config.logging).toHaveProperty('level');
      expect(config.logging).toHaveProperty('file');
    });
  });

  describe('validate', () => {
    it('should have a validate method', () => {
      expect(typeof config.validate).toBe('function');
    });

    it('should validate successfully in development mode', () => {
      // In development mode, missing required vars should not throw
      expect(() => config.validate()).not.toThrow();
    });
  });
});

