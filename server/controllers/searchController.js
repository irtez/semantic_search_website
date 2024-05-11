const Document = require('../models/Document')

function escapeRegex(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}


function sortFiles(files, query) {
    return files.map(file => {
        const numberMatches = (file.gost_number.match(new RegExp(query, 'gi')) || []).length;
        const titleMatches = (file.title.match(new RegExp(query, 'gi')) || []).length;
        const nameMatches = numberMatches + titleMatches;
        const textMatches = (file.text_plain.match(new RegExp(query, 'gi')) || []).length;
        return {...file, nameMatches, textMatches};
    }).sort((a, b) => (b.nameMatches + b.textMatches) - (a.nameMatches + a.textMatches));
}

class searchController {
    
    async text(req, res) {
        try {
            const filesPerPage = 5
            const maxLength = 100
            const query = escapeRegex(req.query.query)

            const files = await Document.find({
                $or: [
                    {gost_number: {$regex: query, $options: 'i'}},
                    {title: {$regex: query, $options: 'i'}},
                    {text_plain: {$regex: query, $options: 'i'}}
                ]
            })
            const sortedFiles = sortFiles(files, query)
            const paginatedFiles = []
            let curMaxLength = maxLength
            if (sortedFiles.length < maxLength) {
                curMaxLength = sortedFiles.length
            }
            for (let i = 0; i < curMaxLength; i += filesPerPage) {
                paginatedFiles.push(sortedFiles.slice(i, i + filesPerPage))
            }
            return res.status(200).json({message: 'OK', files: paginatedFiles})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Text search error'})
        }
        
    }

}

module.exports = new searchController()