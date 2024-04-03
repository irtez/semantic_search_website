// eslint-disable-next-line
import React, { useState, useEffect, useRef } from 'react';
import classes from './Admin.module.css'
import './Admin.css'
import { addFiles } from '../../http/fileAPI'
//import { FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material'


const Admin = () => {
    const [chosenFiles, setFiles] = useState([])
    const fileInput = useRef(null)
    const [invalidFmtWarning, setInvalidFmtWarning] = useState(false)
    const [newFilesAdded, setNewFilesAdded] = useState([])
    const [drop, setDrop] = useState(false)
    const [docStatuses, setDocStatuses] = useState({})

    const handleBrandSubmit = async (event) => {
        try {
            event.preventDefault()
            const formData = new FormData()
            chosenFiles.forEach((file) => {
                formData.append('files', file)
            })
            const comment = event.target.comment.value
            formData.append('comment', comment)
            formData.append('statuses', JSON.stringify(docStatuses))

            const response = await addFiles(formData)
            // console.log(response)
            if (response.status === 200) {
                setNewFilesAdded(chosenFiles)
                setFiles([])
                setDocStatuses({})
                fileInput.current.value = ''
            }
        } catch (error) {
            console.error("Error processing files:", error)
        }
    }

    const checkFile = (f) => {
        return (f.name.endsWith('.pdf') || f.name.endsWith('.txt'))
    }

    const handlePickFiles = (event) => {
        const newFiles = Array.from(event.target.files).filter((file) => checkFile(file))
        if (newFiles.length !== event.target.files.length) {
            setInvalidFmtWarning(true)
        }
        else {
            setInvalidFmtWarning(false)
        }
        setFiles(chosenFiles.concat(newFiles))
        setNewFilesAdded([])
    }

    const handleFileDelete = (event) => {
        setInvalidFmtWarning(false)
        const indexToRemove = Number(event.target.dataset.value)
        const newFiles = chosenFiles.slice().filter((_, index) => index !== indexToRemove)
        var tempStatuses = {...docStatuses}
        const oldStatus = tempStatuses[indexToRemove - 1]
        tempStatuses = Object.fromEntries(
            Object.entries(tempStatuses)
                .map(([key, value]) => [Number(key) >= indexToRemove ? Number(key) - 1 : Number(key), value])
        )
        tempStatuses[indexToRemove - 1] = oldStatus
        setDocStatuses(tempStatuses)
        setFiles(newFiles)  
        if (newFiles.length === 0) {
            fileInput.current.value = null
            setDocStatuses({})
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

    const handleDrop = (e) => {
        //if (disabled) return;
        e.preventDefault()
        setDrop(false)
        const newFiles = Array.from(e.dataTransfer.files).filter((file) => checkFile(file))
        if (newFiles.length !== e.dataTransfer.files.length) {
            setInvalidFmtWarning(true)
        }
        else {
            setInvalidFmtWarning(false)
        }
        setFiles(chosenFiles.concat(newFiles))
        setNewFilesAdded([])
    };

    const handleDeleteAll = (e) => {
        setInvalidFmtWarning(false)
        setFiles([])
        setDocStatuses({})
    }

    const handleChangeStatus = (e) => {
        const tempStatuses = {...docStatuses}
        const docIndex = e.target.dataset.value
        const newDocStatus = e.target.value
        tempStatuses[docIndex] = newDocStatus
        setDocStatuses(tempStatuses)
    }

    const handleTestClick = (e) => {
        console.log(docStatuses)
    }

    // useEffect(() => {
    //     getAllBrands()
    //       .then(responseData => {
    //         setavailableBrands(responseData)
    //       })
    //       .catch(error => {
    //         console.log('Error fetching data:', error)
    //       })
    //   }, [])


  return (
    <section id={classes.admin}>
        <div className={classes.creation}>
            <p className={classes['creation-title']}>Добавление файлов</p>
            <p className={classes['creation-info-text']}>Выберите файлы, которые хотите добавить. Названия файлов будут сохранены в качестве имён документов.</p>
            <p className={classes['creation-info-text']}>Вы также можете добавить комментарий для отслеживания истории добавления.</p>
            {/* <form onSubmit={handleBrandSubmit} method='post' encType='multipart/form-data'> */}
            <form onSubmit={handleBrandSubmit}>
                <div>
                    <label 
                        htmlFor="doc_upload"
                        onDrop={handleDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        >
                        <p>Выберите документы (PDF, TXT)<span>*</span></p>
                        <p className={classes['upload-file-dnd-info']}>
                            Или перетащите сюда файлы
                            {(drop ? (<p className='fa fa-dropbox'></p>) : (<p></p>))}
                        </p>
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
                    <input name="comment" id="comment" type="text" placeholder='Комментарий (необязательно)'></input>
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
                                    <p className={classes['chosen-file-status']} htmlFor='doc-status'><b>Статус:</b>
                                        <select value={docStatuses[index] || 'present'} data-value={index} onChange={handleChangeStatus} name='doc-status'>
                                            <option value='present' label="Действует"/>
                                            <option value='cancelled' label="Отменён"/>
                                            <option value='replaced' label="Заменён"/>
                                            <option value='accepted' label="Принят"/>
                                        </select>
                                    </p>
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
            {newFilesAdded.length ? 
                (
                    <div className={classes['new-files-added']}>
                    <p><b>Были добавлены следующие файлы:</b></p>
                    {newFilesAdded.map((file, index) => 
                        <p>{index + 1}. {file.name}</p>
                    )}
                    </div>
                )
                :
                ('')
            }
        </div>
    </section>
  );
};
export default Admin;