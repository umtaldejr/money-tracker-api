// Test setup file to configure environment variables and global test settings
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';

// Set test environment flag
process.env.NODE_ENV = 'test';
