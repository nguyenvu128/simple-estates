const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const tokenSchema = new Schema({
    userId: ObjectId,
    token: String
}, {timestamps: true});

const Token = new mongoose.model('Token', tokenSchema);
module.exports = Token;