const { logEvents } = require('./logger');

function errorHandler(error, req, res, next)
{
    logEvents(`${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log');
    console.log(error.stack);

    const status = res.statusCode ? req.statusCode : 500;

    res.status(status);

    res.json({message: error.message});
}

module.exports = errorHandler;