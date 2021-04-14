const express = require('express');
const auth = require('./auth');
const PostsService = require('../api/posts/postsService');
const UsersService = require('../api/users/usersService');

module.exports = function (server) {
    const api = express.Router();
    const protectedApi = express.Router();

    server.use('/api', api);
    server.use('/api', protectedApi);

    protectedApi.use(auth);

    api.get('/list', PostsService.postList);

    protectedApi.post('/create', PostsService.postNew);
    protectedApi.post('/profile/posts', PostsService.postsByUser);
    protectedApi.put('/:postId', PostsService.postUpdate);
    protectedApi.delete('/:postId', PostsService.postDelete);
    api.get('/:postId', PostsService.postDetail);

    api.post('/login', UsersService.login);
    api.post('/register', UsersService.register);
    api.post('/validateToken', UsersService.validateToken);
    api.post('/forgotPassword', UsersService.forgotPassword);
    api.post('/resetPassword', UsersService.resetPassword);
};