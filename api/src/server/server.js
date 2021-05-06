const express = require('express');
const http = require('http');

const cors = require('cors');
const bodyParser = require('body-parser');

const setupRouters = require('./routers');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());

setupRouters(app);
module.exports = { server };
