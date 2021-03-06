const User = require('./users');
const path = require('path');
const mailer = require('../../config/mailer');
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

require('dotenv').config();

const emailRegex = /\S+@\S+\.\S+/;
const passwordRegex = /((?=.*$).{6})/;

const transport = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY
    })
);

transport.use('compile', hbs({
    viewEngine: {
        defaultLayout: undefined,
        partialsDir: path.resolve('./src/resources/mail/')
    },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',
}));

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendErrorsFromDB = (res, dbErrors) => {
    const errors = [];

    _.forIn(dbErrors.errors, (error) => errors.push(error.message));
    return res.status(400).json({ errors });
};

const validateToken = (req, res, next) => {
    const token = req.body.token || '';

    jwt.verify(token, process.env.AUTH_SECRET, function (err, decoded) {
        return res.status(200).send({ valid: !err });
    });
};

const generateToken = (params = {}) => {
    return jwt.sign(params, process.env.AUTH_SECRET, {
        expiresIn: '1 day',
    });
};

const login = async (req, res, next) => {
    const { email, password } = req.body || '';
    const user = await User.findOne({ email });

    if (!user)
        return res.status(400).send({ errors: ['E-mail ou senha inválidos'] });

    if (!await bcrypt.compareSync(password, user.password))
        return res.status(400).send({ errors: ['Senha inválida'] });

    res.send({ user, token: generateToken({ id: user.id }) });
};

const register = async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body || '';

    try {
        if (!password.match(passwordRegex))
            return res.status(400).send({
                errors: ['Senha mínimo de 6 caracteres'],
            });

        const passwordHash = bcrypt.hashSync(password, 10);

        if (!bcrypt.compareSync(confirmPassword, passwordHash))
            return res.status(400).send({ errors: ['Senhas não conferem'] });

        if (await User.findOne({ email }))
            return res.status(400).send({ errors: ['Usuário já cadastrado'] });

        const newUser = new User({
            name,
            email,
            password: passwordHash,
        });

        await User.create(newUser);
        return login(req, res, next);

    } catch (err) {
        return sendErrorsFromDB(res, err);
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).send({ errors: ['Usuário não encontrado'] });

        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        });

        const mailOptions = {
            to: email,
            from: process.env.SENDGRID_SENDER,
            template: 'forgot_password',
            subject: 'Recuperar senha',
            context: { token },
        };

        transport.sendMail(mailOptions, (error) => {
            if (error) {
                console.log(error);
                return res.status(400).send({ errors: ['Erro ao enviar o email, tente novamente'] });
            }
            return res.send({ message: 'E-mail enviado com sucesso!' });
        });


        /*  mailer.sendMail(mailOptions, (error) => {
             if (error) {
                 res.status(400).send({ errors: ['Erro ao enviar o email, tente novamente'] });
                 console.log(error);
             }
             console.log('OK');
             res.send({ message: 'E-mail enviado com sucesso!' });

         }); */

    } catch (err) {
        return res.status(400).send({ errors: ['Erro na solicitação, tente novamente'] });
    }
};

const resetPassword = async (req, res) => {
    const { email, token, password } = req.body;

    try {

        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ errors: ['Usuário não encontrado'] });

        if (token !== user.passwordResetToken)
            return res.status(400).send({ errors: ['Token inválido'] });

        const now = new Date();
        if (now > user.passwordResetExpires)
            return res.status(400).send({ errors: ['Token foi expirado, gere um novo'] });

        const salt = bcrypt.genSaltSync();
        const passwordHash = bcrypt.hashSync(password, salt);

        user.password = passwordHash;
        await user.save();
        res.send({ message: 'Senha alterada com sucesso!' });
    } catch (err) {
        res.status(400).send({ errors: ['Erro na solicitação, tente novamente'] });
    }
};

module.exports = { login, register, validateToken, forgotPassword, resetPassword };
