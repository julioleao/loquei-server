const Posts = require('./posts');

const _ = require('lodash');
const Users = require('../users/users');

require('dotenv').config();

const sendErrorsFromDB = (res, dbErrors) => {
    const errors = [];

    _.forIn(dbErrors.errors, (error) => errors.push(error.message));
    return res.status(400).json({ errors });
};

const postNew = async (req, res) => {
    const user = await Users.findById(req.user.id);
    try {
        if (user.postCount >= 3) {
            return res.status(400).send({ errors: ['Quantidade máxima de publicação atingida'] });
        }
        const post = await Posts.create({ ...req.body, ownerId: req.user.id });
        await Users.findByIdAndUpdate(req.user.id, { $inc: { 'postCount': 1 } }, { new: true });
        res.status(201).json(post);

    } catch (err) {
        return sendErrorsFromDB(res, err);
    }
};

const postList = async (req, res) => {
    await Posts.find({}, (err, docs) => {
        if (!err)
            res.json(docs);
        else
            res.status(400).send({ errors: ['Erro ao listar anúncios'] });
    });

};

const postDetail = async (req, res) => {
    try {
        const post = await Posts.findById(req.params.postId).select('+pictures');

        return res.send({ post });
    } catch (err) {
        return res.status(400).send({ errors: ['Anúncio inválido'] });
    }
};

const postsByUser = async (req, res) => {

    await Posts.find({ ownerId: req.body.userId }, (err, docs) => {
        console.log(req.body);
        if (!err)
            res.json(docs);
        else
            res.status(400).send({ errors: ['Não há conteúdo publicado'] });
    });
};

const postUpdate = async (req, res) => {
    try {
        const post = await Posts.findByIdAndUpdate(req.params.postId, { ...req.body }, { new: true, runValidators: true, context: 'query' });
        return res.send({ post });

    } catch (err) {
        return sendErrorsFromDB(res, err);
    }
};

const postDelete = async (req, res) => {
    try {
        await Posts.findByIdAndRemove(req.params.postId);
        await Users.findByIdAndUpdate(req.user.id, { $inc: { 'postCount': -1 } }, { new: true });
        return res.send({ message: 'Anúncio removido com sucesso' });
    } catch (err) {
        return res.status(400).send({ errors: ['Anúncio inválido'] });
    }
};

module.exports = { postNew, postList, postDetail, postUpdate, postDelete, postsByUser };