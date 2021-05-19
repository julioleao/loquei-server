const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const path = require('path');
const auth = require('./auth');
const PostsService = require('../api/posts/postsService');
const UsersService = require('../api/users/usersService');
const cacheTime = 86400000 * 30;

module.exports = function (server) {
    const api = express.Router();
    const protectedApi = express.Router();

    server.use(express.static(path.join(__dirname, 'public'), {
        maxAge: cacheTime
    }));
    server.use(helmet());
    server.use(compression());

    server.use('/api', api);
    server.use('/api', protectedApi);

    protectedApi.use(auth);

    api.get('/list', PostsService.postList);

    protectedApi.post('/create', PostsService.postNew);
    protectedApi.post('/profile/posts', PostsService.postsByUser);
    protectedApi.put('/edit', PostsService.postUpdate);
    protectedApi.delete('/profile/posts/delete', PostsService.postDelete);
    api.get('/:postId', PostsService.postDetail);

    api.post('/login', UsersService.login);
    api.post('/register', UsersService.register);
    api.post('/validateToken', UsersService.validateToken);
    api.post('/forgotPassword', UsersService.forgotPassword);
    api.post('/resetPassword', UsersService.resetPassword);
};