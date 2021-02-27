const restful = require('node-restful');
const mongoose = restful.mongoose;

const usersSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, min: 6, required: true },
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date }
    },
    {
        timestamps: true,
    }
);

module.exports = restful.model('users', usersSchema);
