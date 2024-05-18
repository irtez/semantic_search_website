const Router = require('express')
const router = new Router()
const controller = require('../controllers/collectionController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('', authMiddleware, controller.create)
router.get('', authMiddleware, controller.getCollections)
// router.get('/getalladmin/:status', roleMiddleware(['ADMIN']), controller.getAllAdmin)
router.patch('/:id', authMiddleware, controller.editCollection)
router.delete('/:id', authMiddleware, controller.deleteCollection)

module.exports = router