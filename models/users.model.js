const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const userSchema = new Schema ({
    email: String,
    passwordSalt  : String,
    hashedPassword: String,
    forgetPasswordToken: String,
    address: String,
    name: String,
    age: Number,
    phone: Number,
    gender: String,
    avatar: String,
    role: Number,
    tokenRegister: String,
    status: Number
});

const User = new mongoose.model("User", userSchema);
module.exports = User;