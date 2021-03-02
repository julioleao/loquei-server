const Posts = require('./posts');

const _ = require('lodash');

require('dotenv').config();

const sendErrorsFromDB = (res, dbErrors) => {
    const errors = [];

    _.forIn(dbErrors.errors, (error) => errors.push(error.message));
    return res.status(400).json({ errors });
};

const postNew = async (req, res) => {
    const { title, description, price, bedroom, bathroom, garage, condo, iptu } = req.body || '';
    try {
        if (description.length < 100) {
            const charLeft = 100 - description.length;
            return res.status(401).send({ error: `Descrição muito curta. Informe mais ${charLeft} caracteres` });
        }

        if (title.length < 10) {
            const charLeft = 10 - title.length;
            return res.status(401).send({ error: `Título muito curto. Informe mais ${charLeft} caracteres` });
        }

        if (!price)
            return res.status(401).send({ error: 'Valor do aluguel não informado' });

        if (!bedroom)
            return res.status(401).send({ error: 'Informe a quantidade de quartos' });

        if (!bathroom)
            return res.status(401).send({ error: 'Informe a quantidade de banheiros' });

        if (req.user.post >= 3)
            return res.status(401).send({ error: 'Quantidade máxima de anúncio (3) atingida' });

        if (!req.user.id)
            return res.status(401).send({ error: 'Faça login ou cadastre-se para publicar' });

        const post = await Posts.create({ ...req.body, user: req.user.id });
        return res.send({ post });

    } catch (err) {
        return res.status(400).send({ error: 'Erro ao criar anúncio' });
    }
};

const postList = async (req, res) => {

    try {
        const posts = await Posts.find();
        return res.send({ posts });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao listar anúncios' });
    }
};

const postDetail = async (req, res) => {
    try {
        const post = await Posts.findById(req.params.postId);
        if (!post)
            return res.send({ error: 'Anúncio invalido' });
        return res.send({ post });
    } catch (err) {
        return res.status(400).send({ error: 'Anúncio inválido' });
    }
};

const postUpdate = async (req, res) => {
    const { title, description, price, bedroom, bathroom, garage, condo, iptu } = req.body || '';
    try {
        if (description.length < 100) {
            const charLeft = 100 - description.length;
            return res.status(401).send({ error: `Descrição muito curta. Informe mais ${charLeft} caracteres` });
        }

        if (title.length < 10) {
            const charLeft = 10 - title.length;
            return res.status(401).send({ error: `Título muito curto. Informe mais ${charLeft} caracteres` });
        }

        if (!price)
            return res.status(401).send({ error: 'Valor do aluguel não informado' });

        if (!bedroom)
            return res.status(401).send({ error: 'Informe a quantidade de quartos' });

        if (!bathroom)
            return res.status(401).send({ error: 'Informe a quantidade de banheiros' });

        if (req.user.post >= 3)
            return res.status(401).send({ error: 'Quantidade máxima de anúncio (3) atingida' });

        if (!req.user.id)
            return res.status(401).send({ error: 'Faça login ou cadastre-se para publicar' });

        const post = await Posts.findByIdAndUpdate(req.params.postId, { ...req.body }, { new: true });
        return res.send({ post });

    } catch (err) {
        return res.status(400).send({ error: 'Anúncio inválido' });
    }
};

const postDelete = async (req, res) => {
    try {
        await Posts.findByIdAndRemove(req.params.postId);
        return res.send({ message: 'Anúncio removido com sucesso' });
    } catch (err) {
        return res.status(400).send({ error: 'Anúncio inválido' });
    }
};

module.exports = { postNew, postList, postDetail, postUpdate, postDelete };