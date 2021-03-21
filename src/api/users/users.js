const restful = require('node-restful');
const mongoose = restful.mongoose;

const usersSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Informe seu nome, por favor'] },
        email: {
            type: String, required: [true, 'Preciso de um e-mail'], lowercase: true, validate: {
                validator: /\S+@\S+\.\S+/,
                message: props => `O e-mail ${props.value} não é válido`
            }
        },
        password: { type: String, min: [6, 'A senha deve ter no mínimo 6 caracteres'], required: [true, ' Informe a senha, por favor'] },
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
        postCount: { type: Number, default: 0 }
    },
    {
        timestamps: true,
    }
);

module.exports = restful.model('users', usersSchema);
