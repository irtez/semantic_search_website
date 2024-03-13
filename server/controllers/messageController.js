const Message = require('../models/Message')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

class messageController {
    async create(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            const data = jwt.verify(token, process.env.secret)
            if (!data) {
                return res.status(400).json({message: "Bad token"})
            }
            const email = data.email
            const user = await User.findOne({email})
            if (!user) {
                return res.status(400).json({message: "User not found"})
            }
            const newMessage = new Message({
                useremail: email,
                text: req.body.text,
                userphone: user.phone,
                username: user.name,
                title: req.body.title,
                status: 'opened',
                timestamp: req.body.timestamp
            })
            newMessage.save()
            return res.status(200).json(newMessage)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Create message error"})
        }
        
    }

    async getAllUser(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            const data = jwt.verify(token, process.env.secret)
            if (!data) {
                return res.status(400).json({message: "Bad token"})
            }
            const email = data.email
            const user = await User.findOne({email})
            if (!user) {
                return res.status(400).json({message: "User not found"})
            }
            
            const status = req.params.status
            
            const messages = await Message.find({
                useremail: email,
                status
            })
            return res.status(200).json(messages)
            
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get messages error"})
        }
    }

    async getAllAdmin(req, res) {
        try {
            const status = req.params.status
            const messages = await Message.find({status})
            return res.status(200).json(messages)
            
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get messages error"})
        }
    }

    async changeStatus(req, res) {
        try {
            const status = req.body.status
            const id = req.params.id
            console.log(status, id)
            const msg = await Message.findById(id)
            if (!msg) {
                return res.status(404).json({message: "Message not found"})
            }
            const newMessage = await msg.updateOne({status: status})
            return res.status(200).json(newMessage)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Update error"})
        }
    }

}

module.exports = new messageController()