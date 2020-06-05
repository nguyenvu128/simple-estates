const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const UserModel = require('../models/users.model');
const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const randomString = require('randomstring');


const checkValidatorEmail = (email) => {
    const filter = new RegExp('^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$', 'i');
    return filter.test(email);
};

const isAlphabetAndNumber = (str) => {
    return /[-a-zA-Z0-9]+/.test(str);
};

const getUserLogin = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        if (!checkValidatorEmail(email)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Email không hợp lệ"
            });
        }

        if (!isAlphabetAndNumber(password)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Password không hợp lệ"
            });
        }

        const user = await UserModel.findOne({email: email});
        if (user === null || user === undefined) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Không tìm thấy tài khoản"
            });
        }

        if (bcrypt.compareSync(password, user.hashedPassword) === false) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Password không đúng"
            });
        }

        if (user.status === 2) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Không tìm thấy tài khoản"
            });
        }

        const token = jwt.sign({email: user.email});
        return res.status(HttpStatus.OK).json({
            message: "Đăng nhập thành công",
            token: token
        });
    } catch (e) {
        console.log(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: JSON.stringify(e)
        });
    }
};

const getUserRegister = async (req, res) => {
    try {
        const {
            email,
            password,
            confirmedPassword,
            address,
            name,
            age,
            phone,
            gender,
        } = req.body

        if (!email || !password || !confirmedPassword) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Vui lòng điền đủ thông tin"
            });
        }

        if (!checkValidatorEmail(email)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Email không hợp lệ"
            });
        }

        if (!isAlphabetAndNumber(password) && !isAlphabetAndNumber(confirmedPassword)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Password không hợp lệ"
            });
        }

        if (password !== confirmedPassword) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Hai mật khẩu không giống nhau"
            });
        }

        const user = await UserModel.findOne({email: email});
        if (user !== null && user !== undefined) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Email đã được sử dụng"
            });
        }

        const tokenRegister = randomString.generate(32);
        const saltRounds = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        const userDb = new UserModel({
            email: email,
            passwordSalt: saltRounds,
            hashedPassword: hashedPassword,
            address: address,
            name: name,
            age: age,
            phone: phone,
            gender: gender,
            tokenRegister: tokenRegister,
            status: 2
        });

        await userDb.save();
        return res.status(HttpStatus.OK).json({
            message: "Đăng kí thành công. Vui lòng kiểm tra email để xác thực"
        });
    } catch (e) {
        console.log(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: JSON.stringify(e)
        });
    }
};

const getConfirmUse = async (req, res) => {
    try {
        const {tokenRegister} = req.body;
        if (!tokenRegister) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Lỗi tokenRegister undefined"
            });
        }

        if (!isAlphabetAndNumber(tokenRegister)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Lỗi ký tự và số không hợp lệ"
            });
        }

        if (tokenRegister.length !== 32) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Lỗi tokenRegis không đủ 32 ký tự "
            });
        }

        const updateField = {
            tokenRegister: "",
            status: 1
        };
        const confirmUser = await UserModel.findOneAndUpdate({tokenRegister: tokenRegister}, updateField);
        if (!confirmUser) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Yêu cầu không hợp lệ"
            });
        }

        return res.status(HttpStatus.OK).json({
            message: "Xác thực thành công"
        });

    } catch (e) {
        console.log(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: JSON.stringify(e)
        });
    }
};

module.exports = {
    getUserLogin,
    getUserRegister,
    getConfirmUse
};