const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 5000;
const connection = require('./db/connection');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const corsOptions = require('./config/corsOptions');

connection();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const { logger, logEvents } = require('./middleware/logger');

app.use(logger);

app.use('/', express.static(path.join(__dirname, 'public')));

const root = require('./routes/root');
const userRoutes = require('./routes/userRoutes');

app.use('/', root);
app.use('/users', userRoutes);

app.all('*', (req, res) =>
{
    res.status(404);
    if(req.accepts('html'))
    {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    }
    else if(req.accepts('json'))
    {
        res.json({message: '404 Not Found'});
    }
    else
    {
        res.type('txt').send('404 Not found');
    }
});

const errorHandler = require('./middleware/errorHandler');

app.use(errorHandler);

mongoose.connection.once('open', () =>
{
    console.log('Connected to MongoDB');
    app.listen(port, () =>
    {
        console.log(`Server listening to http://localhost:${port}/`);
    });
});

mongoose.connection.on('error', (error) =>
{
    console.log(error);
    logEvents(`${error.no}: ${error.code}\t${error.syscall}\t${error.hostname}`, 'mongoErrLog.log');
});

