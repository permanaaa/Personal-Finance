const logger = require('../libs/winston');

const logRequest = (req, res, next) => {
    if (req.url.startsWith('/auth')) {
        return next();
    }

    const method = req.method;
    const url = req.url;
    const body = req.body ? JSON.stringify(req.body) : 'No body';
    const query = req.query ? JSON.stringify(req.query) : 'No query';
    const params = req.params ? JSON.stringify(req.params) : 'No params';

    const logMessage = `Method: ${method}, URL: ${url}, Body: ${body}, Query: ${query}, Params: ${params}`;

    logger.info(logMessage);

    next();
};

module.exports = logRequest;
