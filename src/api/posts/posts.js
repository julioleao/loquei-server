const restful = require('node-restful');
const mongoose = restful.mongoose;

const postsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, min: 100, required: true },
        price: { type: Number, required: true },
        iptu: { type: Number },
        condo: { type: Number },
        bedroom: { type: Number, required: true },
        bathroom: { type: Number, required: true },
        garage: { type: Number, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
        timestamps: true,
    }
);

module.exports = restful.model('posts', postsSchema);
