const bodyParser = require('body-parser');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const server = express();

const port = 3003;

server.use(express.urlencoded({ extended: true, limit: '10mb' }));
server.use(express.json({ limit: '10mb' }));
server.use(cors());

server.listen(process.env.PORT || port, () => {
    console.log(`Backend is running on port ${port}.`);
});

module.exports = server;