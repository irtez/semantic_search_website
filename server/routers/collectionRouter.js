const Router = require('express')
const router = new Router()
const controller = require('../controllers/collectionController')
const roleMiddleware = require('../middleware/roleMiddleware')

router.post('', roleMiddleware(['USER', 'ADMIN']), controller.create)
router.get('', roleMiddleware(['USER', 'ADMIN']), controller.getCollections)
// router.get('/getalladmin/:status', roleMiddleware(['ADMIN']), controller.getAllAdmin)
router.patch('/:id', roleMiddleware(['USER', 'ADMIN']), controller.editCollection)

module.exports = router