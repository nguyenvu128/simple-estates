const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const UserModel = require('../models/users.model');
const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const uniqueString = require('unique-string');


const isValidatorEmail = (email) => {
    const filter = new RegExp('^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$', 'i');
    return filter.test(email);
};

const isAlphabetAndNumber = (str) => {
    return /[a-zA-Z0-9]+/.test(str);
};

const isValidatorPassword = (str, res) => {
    const {password, confirmPassword} = str;
    if (!isAlphabetAndNumber(password) && !isAlphabetAndNumber(confirmPassword)) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: "Password không hợp lệ"
        });

        return false;
    }

    if (password !== confirmPassword) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: "Hai mật khẩu không giống nhau"
        });

        return false;
    }

};

const userLogin = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        if (!isValidatorEmail(email)) {
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

        const token = jwt.sign({email: user.email}, process.env.private_key);
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


const registerNewUser = async (req, res) => {
    try {
        const {
            email,
            password,
            confirmPassword,
        } = req.body

        if (!email || !password || !confirmPassword) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Vui lòng điền đủ thông tin"
            });
        }

        if (!isValidatorEmail(email)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Email không hợp lệ"
            });
        }

        const checkedPassword = isValidatorPassword(req.body, res);
        if(checkedPassword === false){
            return;
        }

        const user = await UserModel.findOne({email: email});
        if (user !== null && user !== undefined) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Email đã được sử dụng"
            });
        }

        const tokenRegister = uniqueString();
        const saltRounds = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        const userDb = new UserModel({
            email: email,
            passwordSalt: saltRounds,
            hashedPassword: hashedPassword,
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

const confirmUser = async (req, res) => {
    try {
        const {tokenRegister} = req.body;
        if (!tokenRegister) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Yêu cầu không hợp lệ"
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

const forgetPassword = async (req, res) => {
    const {email} = req.body;
    if(!email) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: "Yêu cầu không hợp lệ"
        });
    }

    if (!isValidatorEmail(email)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: "Yêu cầu không hợp lệ"
        });
    }

    const fieldUpdate = {
        forgetPasswordToken: uniqueString(),
        status: 2
    };

    const user = await UserModel.findOneAndUpdate({email: email}, fieldUpdate);

    if(!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: "Yêu cầu không hợp lệ"
        });
    }

    return res.status(HttpStatus.OK).json({
        message: "Hệ thống đã gửi email đổi mật khẩu. Vui lòng kiểm tra"
    });
};

module.exports = {
    userLogin,
    registerNewUser,
    confirmUser,
    forgetPassword
};