const Document = require('../models/Document')
const Collection = require('../models/Collection')
const fs = require('fs').promises
const path = require('path')
const pdf = require('pdf-parse')

const semanticHost = process.env.semanticHost
const semanticPort = process.env.semanticPort

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }


async function getText(docPath) {
    let fileText = ''
    if (docPath.endsWith('.pdf')) {
        let dataBuffer = await fs.readFile(docPath)
        let data = await pdf(dataBuffer)
        fileText = data.text
        
    }
    else if (docPath.endsWith('.txt')) {
        fileText = await fs.readFile(docPath, 'utf-8')
    }
    if (!fileText.length) {
        fileText = ''
    }
    else {
        fileText = fileText
        .replace(/\xad[\n\r]/g, '')
        .replace(/[\n\r]\xad/g, '')
        .replace(/[\n\r]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }
    
    
    return fileText
}

async function fetchSemantic(method, documents, path='document') {
    const { default: fetch } = await import('node-fetch')
    const url = new URL(`http://${semanticHost}:${semanticPort}/api/${path}`)
    const response = await fetch(
        url,
        {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Array.from(documents))
        }
    )
    return response
}

class documentController {
    async add(req, res) {
        try {
            const rawDocuments = Array.from(req.files)
            if (!req.body.info) {
                return res.status(400).json({message: "Нет информации о документах"})
            }
            const docInfo = JSON.parse(req.body.info)
            if (rawDocuments.length !== docInfo.length) {
                return res.status(400).json({
                    message: "Количество информации о документах не совпадает с количеством документов",
                    errorFiles: rawDocuments.map(doc => doc.filename)
                })
            }
            const errorFiles = []
            const updatedDocInfo = docInfo.map((info, index) => {
                return {
                    ...info,
                    file: rawDocuments[index]
                }
            })
            const documents = updatedDocInfo.reduce((acc, doc) => {
                if (!(doc.file.filename.endsWith('.pdf') || doc.file.filename.endsWith('.txt'))) {
                    errorFiles.push(doc.file.filename)
                }
                else {
                    acc.push(doc)
                }
                return acc
            }, [])
            
            if (!documents.length) {
                return res.status(400).json({message: "Список документов пуст.", errorFiles})
            }    

            const savedDocs = []
            
            for (const doc of documents) {
                try {
                    let docText;
                    try {
                        docText = await getText(doc.file.path);
                    } catch (e) {
                        console.log('Error getting text from file', doc.file.filename, ', error:', e);
                        errorFiles.push(doc.file.filename);
                        continue;
                    }
        
                    const curDocInfo = {...doc};
                    delete curDocInfo.file;
                    const document = new Document({
                        ...curDocInfo,
                        filename: doc.file.filename,
                        text_plain: docText
                    });
                    await document.save()
                    savedDocs.push({
                        id: document._id,
                        title: document.title,
                        gost_number: document.gost_number,
                        filename: doc.file.filename
                    })
                } catch (e) {
                    console.log('Error processing document', doc.file.filename, ', error:', e);
                    errorFiles.push(doc.file.filename);
                }
            }

            if (errorFiles.length === rawDocuments.length) {
                return res.status(400).json({message: "Ни один из файлов не сохранен", errorFiles})
            }
            
            const response = await fetchSemantic('POST', savedDocs)
            const responseData = await response.json()
            if (response.status === 200) {
                return res.status(200).json({message: "OK", errorFiles, savedDocs})
            }
            else {
                return res.status(400).json({
                    message: "Ошибка добавления файлов в векторное хранилище", 
                    responseData
                })
            }
            
            

        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Ошибка при добавлении документа"})
        }
    }


    async getOne(req, res) {
        try {
            const docId = req.params.id
            let doc = await Document.findById(docId)
            if (!doc) {
                return res.status(500).json({message: 'Запрашиваемый файл не найден'})
            }
            return res.status(200).json(doc)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Ошибка загрузки документа'})
        }
    }

    async downloadOne(req, res) {
        try {
            const docId = req.params.id
            const doc = await Document.findById(docId)
            if (!doc) {
                return res.status(404).json({message: 'Запрашиваемый файл не найден'})
            }
            // res.setHeader('Content-Type', 'application/octet-stream')
            // res.setHeader('Content-Disposition', `attachment; filename="${doc.name}.ext"`)
            if (!doc.filename) {
                return res.status(400).json({message: 'Файл с запрашиваемым документом отсутствует'})
            }
            res.sendFile(path.join(__dirname, '..', 'uploads/' + doc.filename))

        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Ошибка при загрузке файла'})
        }
    }

    async update(req, res) {
        try {
            const docId = req.params.id
            const newData = req.body
            const document = await Document.findById(docId)
            
            if (!document) {
                return res.status(404).json({message: "Документ не найден"})
            }
            Object.assign(document, newData)
            
            if (newData.title) {
                const documents = [
                    {
                        id: document._id,
                        title: document.title,
                        gost_number: document.gost_number
                    }
                ]
                const response = await fetchSemantic('PATCH', documents)
                if (!response.ok) {
                    const responseData = await response.json()
                    console.log(responseData)
                    return res.status(400).json({message: "Ошибка при обновлении в семантическом модуле", responseData})
                }
                await document.save()
            }
            sleep(500)
            return res.status(200).json({document})

        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Ошибка обновления документа'})
        }
    }

    async delete(req, res) {
        try {
            const docId = req.params.id
            const deleted = await Document.findByIdAndDelete(docId)
            const documents = [
                {
                    id: deleted._id,
                    title: deleted.title,
                    gost_number: deleted.gost_number
                }
            ]
            const response = await fetchSemantic('DELETE', documents)
            if (!response.ok) {
                const responseData = await response.json()
                console.log(responseData)
                return res.status(400).json({message: "Ошибка при удалении в семантическом модуле", responseData})
            }
            const filter = { documents: docId }
            const update = { $pull: { documents: docId } }
            const result = await Collection.updateMany(filter, update)
            return res.status(200).json(deleted)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Delete brand error'})
        }
    }

}

module.exports = new documentController()