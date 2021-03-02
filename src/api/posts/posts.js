const restful = require('node-restful');
const mongoose = restful.mongoose;

const postsSchema = new mongoose.Schema(
    {
        title: { type: String, min: 10, required: true },
        description: { type: String, min: 100, required: true },
        price: { type: Number, required: true },
        iptu: { type: Number, default: 0 },
        condo: { type: Number, default: 0 },
        bedroom: { type: Number, required: true },
        bathroom: { type: Number, required: true },
        garage: { type: Number, default: 0 },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    },
    {
        timestamps: true,
    }
);

module.exports = restful.model('posts', postsSchema);
