const restful = require('node-restful');
const mongoose = restful.mongoose;

const postsSchema = new mongoose.Schema(
    {
        title: { type: String, minLength: [10, 'Título muito curto, mínimo de 10 caracteres'], required: [true, 'A publicação precisa de um título'] },
        description: {
            type: String, required: [true, 'Descreva o imóvel, por favor'], validate: {
                validator: (val) => val.length >= 100,
                message: props => `Descrição muito curta, ainda faltam ${100 - props.value.length} caracteres`
            }
        },
        price: { type: Number, required: [true, 'Informe o valor do aluguel'] },
        iptu: { type: Number, default: 0 },
        condo: { type: Number, default: 0 },
        bedroom: { type: Number, required: [true, 'Informe a quantidade de quartos'] },
        bathroom: { type: Number, required: [true, 'Informe a quantidade de banheiros'] },
        garage: { type: Number, required: [true, 'Informe a quantidade de vagas de garagem'] },
        thumbnail: { type: String },
        pictures: {
            type: [String], validate: {
                validator: (val) => val.length > 0 && val.length <= 9,
                message: `Precisa ter no mínimo 1 e máximo 9 fotos.`
            },
            required: [true, 'Poste ao menos 1 foto'],
            select: false
        },
        mapLocation: {
            lat: { type: Number, required: [true, 'Informe um ponto no mapa'] },
            lon: { type: Number },
        },
        address: {
            cep: {
                type: String, maxLength: [8, 'Tamanho do CEP {VALUE} inválido'], validate: {
                    validator: /([0-9]{7})\w/,
                    message: props => `O CEP ${props.value} não é um valor válido`
                }, required: [true, 'Informe o CEP']
            },
            street: { type: String, required: [true, 'Informe a rua'] },
            neighborhood: { type: String, required: [true, 'Informe o bairro'] },
            city: { type: String, required: [true, 'Informe a cidade'] },
            state: { type: String, required: [true, 'Informe o estado'] },
        },
        contact: {
            name: { type: String, required: [true, 'Informe um nome para contato'] },
            email: {
                type: String, required: [true, 'Informe um e-mail para contato'], validate: {
                    validator: /\S+@\S+\.\S+/,
                    message: props => `O e-mail ${props.value} não é um formato válido`,
                }
            },
            phone: {
                type: String, validate: {
                    validator: /([0-9]{9,10})\w/,
                    message: props => `O telefonce ${props.value} não é um número válido`,
                },
                required: [true, 'Número de telefone obrigatório']
            },
        },
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    },
    {
        timestamps: true,
    },
);

module.exports = restful.model('posts', postsSchema);
