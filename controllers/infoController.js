const packageJson = require('../package.json');

class InfoController {
  static getBaseResponse(additionalProps = {}) {
    return {
      message: 'Welcome to Money Tracker API',
      version: packageJson.version,
      environment: process.env.NODE_ENV || 'development',
      ...additionalProps
    };
  }

  static getApiInfo(req, res) {
    res.json(InfoController.getBaseResponse());
  }

  static getV1ApiInfo(req, res) {
    res.json(InfoController.getBaseResponse({ apiVersion: 'v1' }));
  }
}

module.exports = InfoController;
