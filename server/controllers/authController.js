const User = require('../models/User')
const Role = require('../models/Role')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')

const generateAccessToken = (id, email, roles) => {
    const payload = {
        id,
        email,
        roles
    }
    return jwt.sign(payload, process.env.secret, {expiresIn: "24h"})
}

class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                console.log(errors)
                return res.status(400).json({message: "Ошибка при регистрации", errors})
            }
            const {email, name, phone, password} = req.body
            const candidate = await User.findOne({email})
            if (candidate) {
                return res.status(400).json({message: "Пользователь с такой почтой уже существует"})
            }
            const hashPass = bcrypt.hashSync(password, 7)
            const userRole = await Role.findOne({value: "USER"})
            const user = new User({email, name, phone, password: hashPass, roles: [userRole.value]})
            await user.save()
            const token = generateAccessToken(user._id, user.email, user.roles)
            return res.json({token: token})
            //return res.status(200).json({message: "Пользователь успешно зарегистрирован"})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Registration error'})
        }
    }

    async login(req, res) {
        try {
            const {email, password} = req.body
            const user = await User.findOne({email})
            if (!user) {
                return res.status(400).json({message: `Пользователь с почтой ${email} не найден`})

            }
            const validPass = bcrypt.compareSync(password, user.password)
            if (!validPass) {
                return res.status(400).json({message: "Неверный пароль"})
            }
            const token = generateAccessToken(user._id, user.email, user.roles)
            return res.json({token: token})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Login error'})
        }
    }

    async check(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            try {
                jwt.verify(token, process.env.secret)
                return res.status(200).json({token: token})
            } catch (e) {
                console.log(e)
                return res.status(400).json({error: "Invalid token"})
            }
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Пользователь не авторизован'})
        }
        
            
    }

    async getMe(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            try {
                const {email} = jwt.verify(token, process.env.secret)
                const user = await User.findOne({email})
                if (!user) {
                    return res.status(400).json({error: "Пользователь не найден"})
                }
                return res.status(200).json({user: user})
            } catch (e) {
                console.log(e)
                return res.status(400).json({message: "Invalid token"})
            }
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Пользователь не авторизован'})
        }
        
        
    }

    async getUsers(req, res) {
        try {
            const users = await User.find()
            return res.status(200).json(users)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Get users error'})
        }
    }

    async updateUser(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            const {email} = jwt.verify(token, process.env.secret)
            try {
                const user = await User.findOne({email: email})
                const field = Object.keys(req.body.newData)[0]
                let newValue = req.body[Object.keys(req.body)[0]]
                if (field === "password") {
                    const oldpass = req.body.newData.oldpass
                    const validPass = bcrypt.compareSync(oldpass, user.password)
                    if (!validPass) {
                        return res.status(400).json({message: "Неверно введен старый пароль"})
                    }

                    let newpass = newValue.password
                    if (newpass.length < 4 || newpass.length > 15) {
                        return res.status(400).json({message: "Новый пароль должен содержать от 4 до 15 символов"})
                    }
                    newValue['password'] = bcrypt.hashSync(newpass)
                }
                const newUser = await user.updateOne(newValue)
                    if (!newUser) {
                        return res.status(400).json({message: "Ошибка обновления пароля"})
                    }
                return res.status(200).json({changed: field})
            } catch (e) {
                console.log(e)
                return res.status(400).json({message: "Ошибка обновления"})
            }
            

        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Пользователь не авторизован"})
        }
    }
}

module.exports = new authController()