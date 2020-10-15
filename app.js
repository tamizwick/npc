const express = require('express');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { MONGO_USER, MONGO_PW } = require('./config');
const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/characters');
const character = require('./models/character');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/auth', authRoutes);
app.use('/characters', characterRoutes);

app.use((err, req, res, next) => {
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data;
    res.status(status).json({ message: message, data: data });
})

mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PW}@cluster0.c43y0.mongodb.net/npc`)
    .then((result) => {
        app.listen(process.env.PORT || 8080);
    })
    .catch((err) => {
        console.log(err);
    });