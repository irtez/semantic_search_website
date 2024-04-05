//const Car = require('../models/Car')
const Document = require('../models/Document')

function escapeRegex(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

function sortFiles(files, query) {
    return files.map(file => {
        const nameMatches = (file.name.match(new RegExp(query, 'gi')) || []).length;
        const textMatches = (file.text.match(new RegExp(query, 'gi')) || []).length;
        return {...file, nameMatches, textMatches};
    }).sort((a, b) => (b.nameMatches + b.textMatches) - (a.nameMatches + a.textMatches));
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
            const sortedFiles = sortFiles(files, query)
            const paginatedFiles = []
            for (let i = 0; i < sortedFiles.length; i += filesPerPage) {
                paginatedFiles.push(sortedFiles.slice(i, i + filesPerPage))
            }
            sleep(500)
            return res.status(200).json({message: 'OK', files: paginatedFiles})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Text search error'})
        }
        
    }

}

module.exports = new searchController()