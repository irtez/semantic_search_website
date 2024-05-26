const Router = require('express')
const router = new Router()
const controller = require('../controllers/collectionController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('', authMiddleware, controller.create)
router.get('', authMiddleware, controller.getCollections)
router.patch('/:id', authMiddleware, controller.editCollection)
router.delete('/:id', authMiddleware, controller.deleteCollection)

module.exports = router