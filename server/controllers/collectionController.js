const Collection = require('../models/Collection')
const User = require('../models/User')
const jwt = require('jsonwebtoken')


function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

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


    async editCollection(req, res) {
        try {
            const collectionId = req.params.id
            const collection = await Collection.findById(collectionId)
            if (!collection) {
                return res.status(400).json({message: "Выбранная коллекция не найдена"})
            }
            const presentDocs = collection.documents
            const docsToAdd = req.body.add
            const docsToDelete = req.body.delete
            if (docsToAdd) {
                docsToAdd.forEach((docId) => {
                if (!presentDocs.includes(docId)) {
                    presentDocs.push(docId);
                }
                })
            }
            if (docsToDelete) {
                presentDocs.filter((docId) => !docsToDelete.includes(docId))
            }
            collection.documents = presentDocs
            await collection.save()

            return res.status(200).json({collection})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Update error"})
        }
    }

}

module.exports = new collectionController()