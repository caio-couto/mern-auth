const { connect, set } = require('mongoose');
const dotenv = require('dotenv').config();

set('strictQuery', true);

async function connection()
{
    try
    {
        await connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true});
    }
    catch(error)
    {
        console.error(error);
    }
}

module.exports = connection;

