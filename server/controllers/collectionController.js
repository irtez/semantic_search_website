const Collection = require('../models/Collection')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

class collectionController {
    async create(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            const data = jwt.verify(token, process.env.secret)
            if (!data) {
                return res.status(400).json({message: "Bad token"})
            }
            const userId = data.id
            const user = await User.findById(userId)
            if (!user) {
                return res.status(400).json({message: "User not found"})
            }
            const newCollectionName = req.body.collectionName
            const collectionSameName = await Collection.findOne({
                userId: user._id,
                name: newCollectionName
            })
            if (collectionSameName) {
                return res.status(400).json({message: "Коллекция с таким именем уже существует"})
            }
            const newCollection = new Collection({
                userId: user._id,
                name: newCollectionName
            })
            await newCollection.save()
            return res.status(200).json(newCollection)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Create collection error"})
        }
        
    }

    async getCollections(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            const data = jwt.verify(token, process.env.secret)
            if (!data) {
                return res.status(400).json({message: "Bad token"})
            }
            const userId = data.id
            const user = await User.findById(userId)
            if (!user) {
                return res.status(400).json({message: "User not found"})
            }
            
            const collections = await Collection.find({userId})
            return res.status(200).json(collections)
            
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get messages error"})
        }
    }

    // async getAllAdmin(req, res) {
    //     try {
    //         const status = req.params.status
    //         const messages = await Message.find({status})
    //         return res.status(200).json(messages)
            
    //     } catch (e) {
    //         console.log(e)
    //         return res.status(400).json({message: "Get messages error"})
    //     }
    // }

    // async changeStatus(req, res) {
    //     try {
    //         const status = req.body.status
    //         const id = req.params.id
    //         const msg = await Message.findById(id)
    //         if (!msg) {
    //             return res.status(404).json({message: "Message not found"})
    //         }
    //         const newMessage = await msg.updateOne({status: status})
    //         return res.status(200).json(newMessage)
    //     } catch (e) {
    //         console.log(e)
    //         return res.status(400).json({message: "Update error"})
    //     }
    // }

}

module.exports = new collectionController()