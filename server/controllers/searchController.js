const Document = require('../models/Document')
require('dotenv').config()

function escapeRegex(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}


const docsPerPage = 5
const maxLength = 200
const semanticHost = process.env.semanticHost
const semanticPort = process.env.semanticPort

const getSimilarDocuments = async (query) => {
    const { default: fetch } = await import('node-fetch')
    const url = new URL(`http://${semanticHost}:${semanticPort}/api/search/titles`)
    const params = new URLSearchParams()
    params.set('query', query)
    params.set('score_threshold', 0.1)
    params.set('document_limit', 200)
    url.search = params.toString()
    const response = await fetch(
        url,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
    return response
}

function sortDocuments(documents, query) {
    return documents.map(document => {
        const numberMatches = (document.gost_number.match(new RegExp(query, 'gi')) || []).length;
        const titleMatches = (document.title.match(new RegExp(query, 'gi')) || []).length;
        const textMatches = (document.text_plain.match(new RegExp(query, 'gi')) || []).length;
        const numMatches = numberMatches + titleMatches + textMatches;
        return {...document, numMatches};
    }).sort((a, b) => (b.numMatches) - (a.numMatches));
}

function paginateDocuments(documents) {
    const paginatedDocuments = []
    let curMaxLength = maxLength
    if (documents.length < maxLength) {
        curMaxLength = documents.length
    }
    for (let i = 0; i < curMaxLength; i += docsPerPage) {
        paginatedDocuments.push(documents.slice(i, i + docsPerPage))
    }
    return paginatedDocuments
}

class searchController {
    
    async textSearch(req, res) {
        try {
            const query = req.query.query

            // const documents = await Document.find({
            //     $or: [
            //         {gost_number: {$regex: query, $options: 'i'}},
            //         {title: {$regex: query, $options: 'i'}},
            //         {text_plain: {$regex: query, $options: 'i'}}
            //     ]
            // })
            const documents = await Document.find(
                { $text: { $search: query } }
            )
            .select('_id gost_number title status text_plain')
            .limit(maxLength)
            
            const sortedDocuments = sortDocuments(documents, query)
            const paginatedDocuments = paginateDocuments(sortedDocuments)
            
            return res.status(200).json({message: 'OK', documents: paginatedDocuments})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Text search error'})
        }
        
    }

    async semanticSearch(req, res) {
        try {
            
            const query = req.query.query

            const response = await getSimilarDocuments(query)
            
            if (!response.ok) {
                return res.status(400).json({message: 'Cant connect to semantic search module'})
            }
            const documents = await response.json()

            const documentIds = documents.map(doc => doc.document_id)
            const foundDocuments = await Document.find(
                { _id: { $in: documentIds } }
            )
            .select('_id gost_number title status text_plain')
            .limit(maxLength)

            const documentsById = {};
            foundDocuments.forEach(doc => {
                documentsById[doc._id.toString()] = doc
            })

            const docWithScore = documents.map(doc => ({
                _doc: documentsById[doc.document_id.toString()],
                similarity_score: Math.round(doc.similarity_score * 10000) / 100
              }))

            const paginatedDocuments = paginateDocuments(docWithScore)

            return res.status(200).json({message: 'OK', documents: paginatedDocuments})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Text search error'})
        }
    }

}

module.exports = new searchController()