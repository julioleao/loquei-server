const Posts = require('./posts');
const Auth = require('../../config/auth');

const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const express = require('express');

const router = express.Router();

router.use(Auth);

require('dotenv').config();

const sendErrorsFromDB = (res, dbErrors) => {
    const errors = [];

    _.forIn(dbErrors.errors, (error) => errors.push(error.message));
    return res.status(400).json({ errors });
};

const postNew = async (req, res) => {
    try {
        const post = await Posts.create(req.body);

        return res.send({ post });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao criar um novo anúncio' });
    }
};

const postList = async (req, res) => {
    res.send({ user: req.userId });
};

const postDetail = async (req, res) => {
    res.send({ user: req.user });
};

const postUpdate = async (req, res) => {
    try {


        return res.send();
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao atualizar anúncio' });
    }
};

const postDelete = async (req, res) => {
    res.send({ user: req.user });
};

module.exports = { postNew, postList, postDetail, postUpdate, postDelete };