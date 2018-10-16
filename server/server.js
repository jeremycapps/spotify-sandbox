const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());

app.set('port', process.env.PORT || 3000);

app.use('/', express.static(path.join(__dirname, '/../public')));

app.get('/', (req, res) => res.sendFile('/public/index.html'));

app.use('/login', require('./oauth'));

module.exports = app;
