const express = require('express');
const auth = require('./auth');

module.exports = function (server) {
    const api = express.Router();
    server.use('/api', api);

    //const Card = require('../api/cards/cardsService');
    //Card.register(api, '/cards');
    /* api.get('/cards', Cards.list);
    api.post('/newcard', Cards.register); */

    const UsersService = require('../api/users/usersService');
    api.post('/login', UsersService.login);
    api.post('/register', UsersService.signup);
    api.post('/validateToken', UsersService.validateToken);
    api.post('/forgotPassword', UsersService.forgotPassword);
    api.post('/resetPassword', UsersService.resetPassword);
};