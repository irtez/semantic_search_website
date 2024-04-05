//const Car = require('../models/Car')
const Document = require('../models/Document')

function escapeRegex(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

class searchController {
    
    async text(req, res) {
        try {
            const filesPerPage = 3
            const query = escapeRegex(req.query.query)
            const files = await Document.find({
                $or: [
                    {name: {$regex: query, $options: 'i'}},
                    {text: {$regex: query, $options: 'i'}}
                ]
            })
            const paginatedFiles = []
            for (let i = 0; i < files.length; i += filesPerPage) {
                paginatedFiles.push(files.slice(i, i + filesPerPage))
            }
            return res.status(200).json({message: 'OK', files: paginatedFiles})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Text search error'})
        }
        
    }

}

module.exports = new searchController()