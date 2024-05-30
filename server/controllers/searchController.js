const Document = require('../models/Document')
require('dotenv').config()

function escapeRegex(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// function sleep(milliseconds) {
//     const date = Date.now();
//     let currentDate = null;
//     do {
//         currentDate = Date.now();
//     } while (currentDate - date < milliseconds);
// }

const docsPerPage = 5
const maxLength = 200
const semanticHost = process.env.semanticHost
const semanticPort = process.env.semanticPort

function enrichDocuments(docs, documentMap) {
    return docs.map(doc => ({
        ...doc,
        ...documentMap[doc.document_id]
    }))
}

const searchDocuments = async (query) => {
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

async function semanticSimilar(docId) {
    const { default: fetch } = await import('node-fetch')
    const url = new URL(`http://${semanticHost}:${semanticPort}/api/similar`)
    const params = new URLSearchParams()
    params.set('id', docId)
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


// function sortDocuments(documents, query) {
//     return documents.map(document => {
//         const numMatches = (document.gost_number.match(new RegExp(escapeRegex(query), 'gi')) || []).length
//         return {...document, numMatches}
//     }).sort((a, b) => (b.numMatches) - (a.numMatches))
// }
// function sortDocsByScores(documents) {
//     return documents.sort((a, b) => (b.score) - (a.score))
// }

function sortDocuments(documents, query) {
    return documents.sort((a, b) => {
        // const isExactMatchA = new RegExp(`^${query_regex}$`, 'i').test(a.gost_number);
        // const isExactMatchB = new RegExp(`^${query_regex}$`, 'i').test(b.gost_number);
        const isExactMatchA = new RegExp(query, 'i').test(a.gost_number)
        const isExactMatchB = new RegExp(query, 'i').test(b.gost_number)
        
        if (isExactMatchA && !isExactMatchB) return -1
        if (!isExactMatchA && isExactMatchB) return 1
        
        return (b.score || 0) - (a.score || 0) // Сортировка по убыванию textScore
    })
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
            if (!query) {
                return res.status(400).json({message: "Поисковый запрос отсутствует"})
            }
            const query_regex = escapeRegex(query)
            const exactMatchDocuments = await Document.find(
                { gost_number: { $regex: new RegExp(query_regex, 'i') } }
            )
            .select('_id gost_number title status text_plain')
            .lean()

            // Находим документы по текстовому поиску
            const textMatchDocuments = await Document.find(
                { $text: { $search: query } },
                { score: { $meta: "textScore" } }
            )
            .limit(maxLength - exactMatchDocuments.length)
            .select('_id gost_number title status text_plain')
            .lean()
         
            // Объединяем оба результата
            const documents = [...exactMatchDocuments, ...textMatchDocuments]

            
            // Удаляем дублирующиеся документы (если один и тот же документ может быть в обоих списках)
            const uniqueDocumentsMap = {}
            documents.forEach(doc => {
                uniqueDocumentsMap[doc._id] = doc
            });
            const uniqueDocuments = Object.values(uniqueDocumentsMap)
            
            // Сортируем результаты так, чтобы точные совпадения по `gost_number` были первыми
            const sortedDocuments = sortDocuments(uniqueDocuments, query_regex)
            
            
            // Нормализуем результаты
            // const maxScore = sortedDocuments.length > 0 ? sortedDocuments[0].score : 1
            // const normalizedResults = sortedDocuments.map(doc => ({
            //     ...doc,
            //     score: Math.round((doc.score / maxScore) * 10000) / 100 || 100.00
            // }))
            
            // Пагинация, если необходимо
            const paginatedDocuments = paginateDocuments(sortedDocuments)
            return res.status(200).json({ documents: paginatedDocuments })
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Text search error'})
        }
    }

    async semanticSearch(req, res) {
        try {
            const query = req.query.query
            if (!query) {
                return res.status(400).json({message: "Поисковый запрос отсутствует"})
            }
            const response = await searchDocuments(query)
            
            if (!response.ok) {
                return res.status(400).json({message: 'Ошибка соединения с модулем семантического поиска'})
            }
            const documents = await response.json()

            const documentIds = documents.map(doc => doc.document_id)
            const foundDocuments = await Document.find(
                { _id: { $in: documentIds } },
                { concurrent: true }
            )
            .select('_id gost_number title status text_plain')
            .limit(maxLength)

            const documentsById = {};
            foundDocuments.forEach(doc => {
                documentsById[doc._id.toString()] = doc._doc
            })

            const docWithScore = documents.map(doc => ({
                ...documentsById[doc.document_id.toString()],
                score: Math.round(doc.similarity_score * 10000) / 100
              }))

            const paginatedDocuments = paginateDocuments(docWithScore)

            return res.status(200).json({documents: paginatedDocuments})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Ошибка семантического поиска'})
        }
    }

    async similar(req, res) {
        try {
            const docId = req.params.id
            const document = await Document.findById(docId)
            if (!document) {
                return res.status(404).json({message: "Документ не найден"})
            }

            const response = await semanticSimilar(docId)
            if (!response.ok) {
                const responseData = await response.json()
                return res.status(400).json({message: "Ошибка при получении похожих документов", responseData})
            }
            const documents = await response.json()
            const textDocumentIds = documents.text.map(doc => doc.document_id)
            const titleDocumentIds = documents.title.map(doc => doc.document_id)
            const allDocumentIds = [...new Set([...textDocumentIds, ...titleDocumentIds])]
            const foundDocuments = await Document.find(
                { _id: { $in: allDocumentIds } },
                { concurrent: true }
            )
            .select('_id gost_number title status')
            .limit(maxLength)

            const documentMap = foundDocuments.reduce((map, doc) => {
                map[doc._id] = doc._doc
                return map
            }, {})

            documents.text = enrichDocuments(documents.text, documentMap)
            documents.title = enrichDocuments(documents.title, documentMap)
            return res.status(200).json(documents)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Ошибка получения похожих документов'})
        }
    }

}

module.exports = new searchController()