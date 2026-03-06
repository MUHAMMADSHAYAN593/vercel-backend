const mongoose = require('mongoose');


const blackListTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'Token is required to be blacklisted.'],
        unique: true,
    },
}
, { timestamps: true });

const TokenBlackListModel = mongoose.model('BlackListToken', blackListTokenSchema);

module.exports = TokenBlackListModel;