const dotenv = require('dotenv');

dotenv.config();
module.exports = {
    MONGO_USER: process.env.MONGO_USER,
    MONGO_PW: process.env.MONGO_PW
};