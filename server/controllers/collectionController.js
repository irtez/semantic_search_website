const Collection = require('../models/Collection')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const Document = require('../models/Document')

const maxCollections = 5 
const maxDocuments = 30

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
            
            const collections = await Collection.find({
                user_id: user._id
            })
            if (collections.length >= maxCollections) {
                return res.status(400).json({message: `Вы можете создать не более ${maxCollections} коллекций`})
            }
            const newCollectionName = req.body.collectionName

            const collectionsSameName = collections.filter(col => col.name === newCollectionName)
            if (collectionsSameName.length > 0) {
                return res.status(400).json({message: "Коллекция с таким именем уже существует"})
            }
            const newCollection = new Collection({
                user_id: user._id,
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
            
            const collections = await Collection.find({user_id: userId})
            const updatedCollections = await Promise.all(collections.map(async (collection) => {
                // Находим документы по идентификаторам из массива documents
                const documents = await Document.find(
                    { _id: { $in: collection.documents } }
                )
                .select('_id gost_number title status')
                
                // Преобразуем массив документов в массив объектов с нужными полями
                const documentObjects = documents.map(doc => ({
                  id: doc._id,
                  gost_number: doc.gost_number,
                  title: doc.title,
                  status: doc.status
                }))
          
                // Возвращаем обновленную коллекцию с массивом объектов документов
                return {
                  ...collection.toObject(),
                  documents: documentObjects
                }
              }))

            return res.status(200).json({collections: updatedCollections})
            
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Ошибка получения коллекция"})
        }
    }


    async editCollection(req, res) {
        try {
            const collectionId = req.params.id
            const collection = await Collection.findById(collectionId)
            if (!collection) {
                return res.status(400).json({message: "Выбранная коллекция не найдена"})
            }
            var presentDocs = collection.documents
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
                presentDocs = presentDocs.filter((docId) => !docsToDelete.includes(docId))
            }
            if (presentDocs.length > maxDocuments) {
                return res.status(400).json(
                    {message: `Количество документов ${presentDocs.length} превышает максимум в ${maxDocuments}`}
                )
            }
            collection.documents = presentDocs
            await collection.save()
            sleep(1000)
            return res.status(200).json({collection})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Ошибка обновления коллекции"})
        }
    }

    async deleteCollection(req, res) {
        try {
            const collectionId = req.params.id
            const collection = await Collection.findById(collectionId)
            if (!collection) {
                return res.status(400).json({message: "Коллекция не найдена"})
            }
            const token = req.headers.authorization.split(' ')[1]
            const data = jwt.verify(token, process.env.secret)
            if (!data) {
                return res.status(400).json({message: "Пользователь не авторизован"})
            }
            const userId = data.id
            const userRoles = data.roles

            if ((!userRoles.includes('ADMIN')) & (collection.user_id !== userId)) {
                return res.status(400).json({message: "У вас нет прав для удаления этой коллекции"})
            }

            await collection.deleteOne()
            sleep(1000)
            return res.status(200).json({message: "OK"})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Ошибка удаления коллекции"})
        }
    }

}

module.exports = new collectionController()