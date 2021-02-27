const User = require('./users');
const mailer = require('../../config/mailer');

const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

require('dotenv').config();

const emailRegex = /\S+@\S+\.\S+/;
const passwordRegex = /((?=.*$).{6})/;

const sendErrorsFromDB = (res, dbErrors) => {
    const errors = [];

    _.forIn(dbErrors.errors, (error) => errors.push(error.message));
    return res.status(400).json({ errors });
};

const login = (req, res, next) => {
    const email = req.body.email || '';
    const password = req.body.password || '';

    User.findOne({ email }, (err, user) => {
        if (err) {
            return sendErrorsFromDB(res, err);
        } else if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ ...user }, process.env.AUTH_SECRET, {
                expiresIn: '1 day',
            });
            const { name, email, isAdmin } = user;
            res.json({ name, email, token, isAdmin });
        } else {
            return res.status(400).send({ errors: ['Usuário ou Senha inválidos'] });
        }
    });
};

const validateToken = (req, res, next) => {
    const token = req.body.token || '';

    jwt.verify(token, process.env.AUTH_SECRET, function (err, decoded) {
        return res.status(200).send({ valid: !err });
    });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        });

        mailer.sendMail({
            to: email,
            from: 'no_reply@loquei.com',
            template: 'forgot_password',
            context: { token }
        }, (err) => {
            if (err)
                return res.status(400).send({ error: 'Erro ao enviar o email, tente novamente' });

            return res.send();
        });
    } catch (err) {
        res.status(400).send({ error: 'Erro na solicitação, tente novamente' });
    }
};

const resetPassword = async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        console.log(user.passwordResetToken);
        if (token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Token inválido' });

        const now = new Date();
        if (now > user.passwordResetExpires)
            return res.status(400).send({ error: 'Tempo do token foi expirado' });

        const salt = bcrypt.genSaltSync();
        const passwordHash = bcrypt.hashSync(password, salt);

        user.password = passwordHash;
        await user.save();
        res.send();
    } catch (err) {
        res.status(400).send({ error: 'Erro na solicitação, tente novamente' });
    }
};

const signup = (req, res, next) => {
    const { name } = req.body || '';
    const { email } = req.body || '';
    const { password } = req.body || '';
    const { confirmPassword } = req.body || '';
    const { isAdmin } = req.body.isAdmin || false;

    if (!name) {
        return res.status(400).send({ errors: ['Informe seu nome'] });
    }

    if (!email.match(emailRegex)) {
        return res.status(400).send({ errors: ['E-mail inválido'] });
    }

    if (!password.match(passwordRegex)) {
        return res.status(400).send({
            errors: ['Senha precisar ter entre 4-12 caracteres'],
        });
    }

    const salt = bcrypt.genSaltSync();
    const passwordHash = bcrypt.hashSync(password, salt);

    if (!bcrypt.compareSync(confirmPassword, passwordHash)) {
        return res.status(400).send({ errors: ['Senhas não conferem.'] });
    }

    User.findOne({ email }, (err, user) => {
        if (err) {
            return sendErrorsFromDB(res, err);
        } else if (user) {
            return res.status(400).send({ errors: ['Usuário já cadastrado.'] });
        } else {
            const newUser = new User({
                name,
                email,
                password: passwordHash,
                isAdmin,
            });
            newUser.save((err) => {
                if (err) {
                    return sendErrorsFromDB(res, err);
                } else {
                    login(req, res, next);
                }
            });
        }
    });
};

module.exports = { login, signup, validateToken, forgotPassword, resetPassword };