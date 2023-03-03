const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

async function logEvents(message, logFileName)
{
    const dateTime = `${format(new Date(), 'ddMMyyyy\tHH:mm:ss')}`;
    const logItem = `\n${dateTime}\t${uuid()}\t${message}`;

    try
    {
        if(!fs.existsSync(path.join(__dirname, '..', 'logs')))
        {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }

        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem);
    }
    catch(error)
    {
        console.log(error);
    }
}

function logger(req, res, next)
{
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
    console.log(`${req.method} ${req.path}`);
    next();
}

module.exports = { logEvents, logger };