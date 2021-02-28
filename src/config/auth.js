const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    // CORS preflight request

    /*     const authHeader = req.headers.authorization;

        if (!authHeader)
            return res.status(401).send({ error: 'Token inválido ou não informado' });

        const parts = authHeader.split(' ');

        if (!parts.length === 2)
            return res.status(401).send({ error: 'Token inválido ou não informado' });

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme))
            return res.status(401).send({ error: 'Token inválido ou não informado' });
     */
    if (req.method === 'OPTIONS') {
        next();
    } else {
        const token =
            req.body.token || req.query.token || req.headers['authorization'];
        if (!token) {
            return res.status(403).send({ errors: ['No token provided.'] });
        }
        jwt.verify(token, process.env.AUTH_SECRET, function (err, decoded) {
            if (err) {
                return res.status(403).send({
                    errors: ['Failed to authenticate token.'],
                });
            } else {
                req.userId = decoded.id;
                next();
            }
        });
    }
};
