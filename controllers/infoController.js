class InfoController {
  static getBaseResponse(additionalProps = {}) {
    return {
      message: 'Welcome to Money Tracker API',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.COMMIT_HASH,
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
