const express = require('express');
const auth = require('./auth');

module.exports = function (server) {
    const api = express.Router();
    const protectedApi = express.Router();
    server.use('/api', api);
    server.use('/api', protectedApi);


    protectedApi.use(auth);
    const PostsService = require('../api/posts/postsService');
    //Card.register(api, '/cards');
    api.get('/', PostsService.postList);
    api.get('/:postId', PostsService.postDetail);
    protectedApi.post('/newPost', PostsService.postNew);
    protectedApi.put('/:postId', PostsService.postUpdate);
    protectedApi.delete('/:postId', PostsService.postDelete);

    const UsersService = require('../api/users/usersService');
    api.post('/login', UsersService.login);
    api.post('/register', UsersService.register);
    api.post('/validateToken', UsersService.validateToken);
    api.post('/forgotPassword', UsersService.forgotPassword);
    api.post('/resetPassword', UsersService.resetPassword);
};