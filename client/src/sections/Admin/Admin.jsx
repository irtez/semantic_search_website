import React, { useState, useRef } from 'react';
import classes from './Admin.module.css'
import './Admin.css'
import { addDocuments } from '../../http/documentAPI'
import Loading from '../Loading';
import TextField from '@mui/material/TextField';


const Admin = () => {
    const [chosenFiles, setFiles] = useState([])
    const [errorFiles, setErrorFiles] = useState([])
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const fileInput = useRef(null)
    const [invalidFmtWarning, setInvalidFmtWarning] = useState(false)
    const [drop, setDrop] = useState(false)
    const [docsInfo, setDocsInfo] = useState([])

    const handleDocsSubmit = async (e) => {
        setIsLoading(true)
        try {
            
            e.preventDefault()
            const formData = new FormData()
            chosenFiles.forEach((file) => {
                formData.append('files', file)
            })
            formData.append('info', JSON.stringify(docsInfo))

            const response = await addDocuments(formData)
            // console.log(response)
            if (response.status === 200) {
                setFiles([])
                setDocsInfo([])
                if (response.data.errorFiles.length) {
                    setErrorFiles(response.data.errorFiles)
                }
                if (response.data.savedDocs.length) {
                    setUploadedFiles(response.data.savedDocs)
                }
            }
            else {
                setErrorFiles(response.data.errorFiles)
            }
            
        } catch (error) {
            console.error("Error processing files:", error)
        }
        setIsLoading(false)
    }

    const checkFile = (f) => {
        return (f.name.endsWith('.pdf') || f.name.endsWith('.txt'))
    }

    const handleFileDelete = (event) => {
        setInvalidFmtWarning(false)
        const indexToRemove = Number(event.target.dataset.value)
        const newFiles = chosenFiles.slice().filter((_, index) => index !== indexToRemove)
        const newInfo = docsInfo.slice().filter((_, index) => index !== indexToRemove)
        
        setDocsInfo(newInfo)
        setFiles(newFiles)  
        if (newFiles.length === 0) {
            fileInput.current.value = null
            setDocsInfo([])
        }
        
      }


    const getPrettifiedSize = (size) => {
        return Math.round(size / 1024**2 * 100) / 100 + ' MB'
    }
    
    const onDragLeave = (e) => {
        //if (disabled) return;
        e.preventDefault()
        setDrop(false)
    };

    const onDragOver = (e) => {
        //if (disabled) return;
        e.preventDefault()
        setDrop(true)
    };

    const addFiles = (files) => {
        setIsLoading(true)
        if (!files.length) {
            return
        }
        const newFiles = Array.from(files).filter((file) => checkFile(file))
        if (newFiles.length !== files.length) {
            setInvalidFmtWarning(true)
        }
        else {
            setInvalidFmtWarning(false)
        }
        setFiles(chosenFiles.concat(newFiles))
        setUploadedFiles([])
        setErrorFiles([])
        setDocsInfo([...docsInfo, ...Array(newFiles.length).fill({})])
        setIsLoading(false)
    }   

    const handleDrop = (e) => {
        //if (disabled) return;
        e.preventDefault()
        setDrop(false)
        addFiles(e.dataTransfer.files)
    }

    const handlePickFiles = (e) => {
        addFiles(e.target.files)
    }

    const handleDeleteAll = (e) => {
        setInvalidFmtWarning(false)
        setFiles([])
        setDocsInfo([])
    }

    const handleChangeInfo = (e, index) => {
        const tempInfo = [...docsInfo]
        tempInfo[index] = {...tempInfo[index], [e.target.name]: e.target.value}
        setDocsInfo(tempInfo)
    }

    const handleTestClick = (e) => {
        console.log(docsInfo)
    }


  return (
    <section id={classes.admin}>
        <div className={classes.creation}>
            {
                isLoading ? (<Loading height='600px' spinnerSize='120px'/>) : (
                <>
                    <p className={classes['creation-title']}>Добавление файлов</p>
                    <p className={classes['creation-info-text']}>Выберите файлы, которые хотите добавить. Названия файлов будут сохранены в качестве имён документов.</p>
                    <p className={classes['creation-info-text']}>Вы также можете добавить комментарий для отслеживания истории добавления.</p>
                    {/* <form onSubmit={handleDocsSubmit} method='post' encType='multipart/form-data'> */}
                    <form onSubmit={handleDocsSubmit}>
                        <div>
                            <label 
                                htmlFor="doc_upload"
                                className={classes['main-label']}
                                onDrop={handleDrop}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                >
                                <p>Выберите документы (PDF, TXT)<span>*</span></p>
                                <div className={classes['upload-file-dnd-info']}>
                                    <p>Или перетащите сюда файлы</p>
                                    {(drop ? (<p className='fa fa-dropbox'></p>) : (''))}
                                </div>
                            </label>
                            <input
                                onChange={handlePickFiles}
                                type="file"
                                className={classes['upload-file']}
                                id="doc_upload"
                                name="doc_upload"
                                accept=".pdf,.txt"
                                multiple 
                                required
                                ref={fileInput}
                            />
                        </div>
                        <div className={classes.preview}>
                            {!chosenFiles.length ? (<p>Файлы не выбраны.</p>) : 
                            (    
                                <>  
                                <h5 onClick={handleTestClick}>Выбранные файлы ({chosenFiles.length}) {chosenFiles.length ? 
                                    (<span onClick={handleDeleteAll} className={classes['delete-all']}>Убрать все</span>) : ('')}
                                </h5>        
                                {chosenFiles.map((file, index) =>
                                    <div className={classes['chosen-file']}>
                                        <div className={classes['chosen-file-info-block']}>
                                            <p className={classes['chosen-file-info']}><b>{index + 1}. Название: </b>{file.name}</p>
                                            <p className={classes['chosen-file-info']}><b>Размер: </b>{getPrettifiedSize(file.size)}</p>
                                                {/* <select value={docStatuses[index] || 'present'} data-value={index} onChange={handleChangeStatus} name='doc-status'>
                                                    <option value='present' label="Действует"/>
                                                    <option value='cancelled' label="Отменён"/>
                                                    <option value='replaced' label="Заменён"/>
                                                    <option value='accepted' label="Принят"/>
                                                </select> */}
                                            <TextField required name='gost_number' label="Номер документа" onChange={(e) => handleChangeInfo(e, index)} />
                                            <TextField required name='title' label="Название документа" onChange={(e) => handleChangeInfo(e, index)} />
                                            <TextField name='status' label="Статус" onChange={(e) => handleChangeInfo(e, index)} />
                                            <TextField name='date_start' label="Дата введения" onChange={(e) => handleChangeInfo(e, index)} />
                                            <TextField name='date_cancel' label="Дата отмены" onChange={(e) => handleChangeInfo(e, index)} />
                                            <TextField name='replaced_by' label="Заменен на" onChange={(e) => handleChangeInfo(e, index)} />
                                            <TextField name='main_section' label="Основной раздел ОКС" onChange={(e) => handleChangeInfo(e, index)} />
                                            <TextField name='subsection' label="Подраздел ОКС" onChange={(e) => handleChangeInfo(e, index)} />
                                            <TextField name='OKS' label="Номер ОКС" onChange={(e) => handleChangeInfo(e, index)} />
                                        </div>
                                        <div className='fa fa-trash' data-value={index} onClick={handleFileDelete}></div>
                                    </div>
                                )}
                                </>
                            )}
                        </div>
                        <button disabled={!(chosenFiles.length)} className={classes['creation-submit-button']} type="submit">
                            Добавить файлы
                        </button>
                    </form>
                    {invalidFmtWarning ? 
                        (<p className={classes.warning}>Некоторые файлы не были добавлены из-за неподходящего расширения</p>)
                        : 
                        ('') 
                    }
                    {uploadedFiles.length ? 
                        (
                            <div className={classes['new-files-added']}>
                                <p><b>Были добавлены следующие файлы:</b></p>
                                {uploadedFiles.map((file, index) => 
                                    <p>{index + 1}. {file.filename}</p>
                                )}
                            </div>
                        )
                        :
                        ('')
                    }
                    {errorFiles.length ? 
                        (
                            <div className={classes['new-files-error']}>
                                <p><b>Следующие файлы не были загружены из-за ошибок:</b></p>
                                {errorFiles.map((filename, index) => 
                                    <p>{index + 1}. {filename}</p>
                                )}
                            </div>
                        )
                        :
                        ('')
                    }
                </>
                )
            }
            
        </div>
    </section>
  );
};
export default Admin;