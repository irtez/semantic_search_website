const Router = require('express')
const router = new Router()
const controller = require('../controllers/searchController')

router.get('/text', controller.textSearch)
router.get('/semantic', controller.semanticSearch)

module.exports = router