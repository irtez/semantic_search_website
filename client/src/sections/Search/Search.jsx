import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../../routes/AppContext'
import classes from './Search.module.css'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';
import { searchDocs } from '../../http/searchAPI'
import Loading from '../Loading'
import { Link } from 'react-router-dom'
import Checkbox from '@mui/material/Checkbox'
import { getCollections, editCollection } from '../../http/collectionAPI'
import Alert from '@mui/material/Alert';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const documentsPerPage = 5
const maxDocuments = 30

function escapeRegex(str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}


const Search = () => {
  const [searchType, setSearchType] = useState('text')
  const [searchQuery, setSearchQuery] = useState('')
  const [oldQuery, setOldQuery] = useState(null)
  const [oldSearchType, setOldSearchType] = useState(null)
  const [searchTime, setSearchTime] = useState(null)
  const [foundDocuments, setFoundDocuments] = useState([])
  const [curPage, setCurPage] = useState(1)
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [docsToSave, setDocsToSave] = useState([])
  const [isChoosingDocs, setIsChoosingDocs] = useState(false)
  const [chosenCollection, setChosenCollection] = useState(null)
  const [isChoosingCollection, setIsChoosingCollection] = useState(false)
  const [userCollections, setUserCollections] = useState([])
  const [noCollectionAlert, setNoCollectionAlert] = useState(false)
  const [isCollectionUpdated, setIsCollectionUpdated] = useState(false)
  const [isUpdatePending, setIsUpdatePending] = useState(false)
  const [tooSmallQueryWarning, setTooSmallQueryWarning] = useState(false)
  const [tooMuchDocsWarning, setTooMuchDocsWarning] = useState(false)

  useEffect(() => {
    getCollections()
      .then(responseData => {
        const collections = responseData.collections.map(({_id, name, documents}) => ({_id, name, documents}))
        setUserCollections(collections)
        if (collections) {
          setChosenCollection(collections[0])
        }
      })
      .catch(error => {
        console.log('Error fetching data:', error)
      })
  }, [])
  
  const {user} = useContext(AppContext)

  const handleTypeChange = (event) => {
    setSearchType(event.target.value)
  }

  const handleChoosingCollection = (e) => {
    if (!userCollections.length ) {
      setNoCollectionAlert(true)
      if (isChoosingDocs) setIsChoosingDocs(false)
      if (isChoosingCollection) setIsChoosingCollection(false)
    }
    else if (!isChoosingDocs & !isChoosingCollection) {
      setIsChoosingDocs(true)
    }
    else if (isChoosingDocs & !isChoosingCollection) {
      if (docsToSave.length) {
        setIsChoosingCollection(true)
      }
      else {
        setIsChoosingDocs(false)
      }
    }
    else if (isChoosingDocs & isChoosingCollection) {
      setDocsToSave([])
      setIsChoosingCollection(false)
      setIsChoosingDocs(false)
    }
  }

  const handleCollectionSave = async (e) => {
    setIsUpdatePending(true)
    try {
      const response = await editCollection({
        collectionId: chosenCollection._id,
        add: docsToSave
      })
      if (response.status === 200) {
        setIsCollectionUpdated(true)
        setDocsToSave([])
        setIsChoosingCollection(false)
        setIsChoosingDocs(false)
        const updatedCollections = userCollections.map(collection =>
          collection._id === chosenCollection._id ? response.data.collection : collection
        )
        setUserCollections(updatedCollections)
      }
    }
    catch (e) {
      console.log(e)
    }
    
    setIsUpdatePending(false)
  }

  const handleDocInclude = (e) => {
    const document_id = e.target.value
    if (e.target.checked) {
      if (docsToSave.length >= maxDocuments) {
        setTooMuchDocsWarning(true)
      }
      else {
        const docs = [...docsToSave]
        docs.push(document_id)
        setDocsToSave(docs)
      }
    }
    else {
      const newDocs = docsToSave.filter(doc => doc !== document_id)
      setDocsToSave(newDocs)
    }
  }
  
  const getTitleMatch = (text, query, maxTitleLength, ellipsis) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) {
      if (text.length > maxTitleLength) {
        return text.slice(0, maxTitleLength) + ellipsis
      }
      return text.slice(0, maxTitleLength)
      
    }
    query = escapeRegex(query)
    const queryLength = query.length
    let newText = ''
    const viewedText = text.slice(0, maxTitleLength)
    const indexes = [...viewedText.matchAll(new RegExp(query, 'gi'))].map(a => a.index)
    let now = 0
    indexes.forEach((index) => {
      newText += viewedText.slice(now, index)
      newText += ('<b>' + viewedText.slice(index, index + queryLength) + '</b>')
      now = index + queryLength
    })
    newText += viewedText.slice(indexes[indexes.length - 1] + queryLength, viewedText.length)
    if (maxTitleLength < text.length) {
      newText += ellipsis
    }
    return newText
  }

  const getQueryMatch = (text, query, windowSize, ellipsis) => {
    if (!text)
      return ''
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) {
      return text.slice(0, windowSize*2) + ellipsis
    }
    const queryLength = query.length
    query = escapeRegex(query)
    let newText = ellipsis
    if (index === 0) { newText = '' }
    let start = index - windowSize
    let end = index + windowSize
    if (start < 0) { 
      end -= start
      start = 0
      newText = ''
    }
    if (end > text.length) {
      start -= (end - text.length)
      end = text.length + 1
    }
    const viewedText = text.slice(start, end)
    const indexes = [...viewedText.matchAll(new RegExp(query, 'gi'))].map(a => a.index)
    let now = 0
    indexes.forEach((index) => {
      newText += viewedText.slice(now, index)
      newText += ('<b>' + viewedText.slice(index, index + queryLength) + '</b>')
      now = index + queryLength
    })
    newText += viewedText.slice(indexes[indexes.length - 1] + queryLength, viewedText.length)
    if (end < text.length) {
      newText += ellipsis
    }
    return newText
  }


  const Search = async (e) => {
    if ((!searchQuery) || (searchQuery.length < 0) || ((searchQuery === oldQuery) && (searchType === oldSearchType))) {
      return
    }
    if (searchQuery.length < 3) {
      setTooSmallQueryWarning(true)
      return
    }
    const startTime = performance.now() / 1000
    setSearchTime(null)
    setLoading(true)
    setFoundDocuments([])
    setCurPage(1)
    setNotFound(false)
    const response = await searchDocs(searchQuery, searchType)
    if (response.status === 200) {
      const documents = response.data.documents

      setOldQuery(searchQuery)
      if (!documents.length) {
        setNotFound(true)
        setFoundDocuments([])
      }
      else {
        setFoundDocuments(documents)
      }
      
      setOldSearchType(searchType)
      const elapsedTime = Math.round((performance.now() / 1000 - startTime) * 100) / 100
      setSearchTime(elapsedTime)
    }
    setLoading(false)
  }

  return (
    <section id={classes.search}>
      <div style={{position: 'absolute', height: '100%', width: '30%'}}>
        {
          noCollectionAlert ? (
            <Alert 
              severity="error" 
              onClose={() => {setNoCollectionAlert(false)}}
              sx={{
                position: 'sticky',
                zIndex: 3,
                top: 60,
                border: '1px solid red'
              }}
            >
              У вас нет созданных коллекций. Вы можете их создать в
               <Link className={classes['warning-link']} to={`/user?section=collections`}>личном кабинете</Link>.
            </Alert>
          ) : ('')
        }
        {
          tooMuchDocsWarning ? (
            <Alert 
              severity="error" 
              onClose={() => {setTooMuchDocsWarning(false)}}
              sx={{
                position: 'sticky',
                zIndex: 3,
                top: 60,
                border: '1px solid red'
              }}
            >
              Вы можете выбрать не более {maxDocuments} документов.
            </Alert>
          ) : ('')
        }
        {
          isCollectionUpdated ? (
            <Alert 
              severity="success" 
              onClose={() => {setIsCollectionUpdated(false)}}
              sx={{
                position: 'sticky',
                zIndex: 3,
                top: 60,
                border: '1px solid green'
              }}
            >
              Коллекция обновлена.
            </Alert>
          ) : ('')
        }
        {
          tooSmallQueryWarning ? (
            <Alert 
              severity="error" 
              onClose={() => {setTooSmallQueryWarning(false)}}
              sx={{
                position: 'sticky',
                zIndex: 3,
                top: 60,
                border: '1px solid red'
              }}
            >
              Минимальная длина запроса - 3 символа.
            </Alert>
          ) : ('')
        }
      </div>
      <div className={classes.main}>
        <div className={classes['main-header']}>
          Поиск документов
        </div>
        <div className={classes['search-main']}>
          <div className={classes['search-type-switch']}>
            <ToggleButtonGroup 
              value={searchType}
              exclusive
              color='info'
            >
              <ToggleButton onClick={handleTypeChange} value="text">Текстовый</ToggleButton>
              <ToggleButton onClick={handleTypeChange} value="semantic">Семантический</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className={classes['search-field']}>
            <TextField
              id="outlined-basic"
              label="Поиск" 
              variant="outlined"
              sx={{width: '60%', backgroundColor: 'white', borderRadius: '10px'}}
              onChange={(e) => { setSearchQuery(e.target.value) }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  Search('')
                }
              }}
              dataAttr={
                (searchTime ? (`Время поиска: ${searchTime} сек.`) 
                : 
                (''))
              }
            />
            <i onClick={Search} className='fa fa-search'></i>
          </div>
        </div>
        <div className={classes['search-results']}>
          <div className={classes['search-save']}>
            <button 
              className={classes['search-save-button']}
              onClick={handleChoosingCollection}
              disabled={!user.isAuth}
              title={!user.isAuth ? "Сохранение доступно только авторизованным пользователям" : ''}
              dataAttr={
                isChoosingCollection ? (
                  'Выберите название коллекции'
                ) : (
                  isChoosingDocs ? (
                    docsToSave.length ? (
                      `Выбрано документов: ${docsToSave.length} `
                    ) : ('Выберите документы для сохранения')
                  ) : ('')
                )
              }
            >
              {!isChoosingCollection ? ('Сохранить результаты поиска') : ('Отменить')}
            </button>
            
            {
                isChoosingCollection ? (
                <div className={classes['choosing-collection']}>
                  {
                    !isUpdatePending ? (
                      <>
                      <FormControl variant="standard" sx={{ width: 120 }}>
                        <InputLabel>Название коллекции</InputLabel>
                        <Select
                          value={chosenCollection ? (chosenCollection._id) : (userCollections[0]._id)}
                          onChange={(e) => {
                            setChosenCollection(
                              userCollections.filter(col => col._id === e.target.value)[0]
                            )
                            }}
                          label="Название"
                        >
                          {userCollections.map(collection => {
                            return <MenuItem value={collection._id}>
                              {collection.name} ({collection.documents.length}/{maxDocuments})
                            </MenuItem>
                          })}
                        </Select>
                      </FormControl>
                      <button 
                        onClick={handleCollectionSave}
                        disabled={
                          (!docsToSave.length) || (chosenCollection.documents.length + docsToSave.length > maxDocuments)
                        }
                        title={docsToSave.length ? 
                          (
                            (chosenCollection.documents.length + docsToSave.length > maxDocuments) ? (
                              'Слишком много документов.'
                            ) : ('')
                          ) : ('Выберите документы.')
                        }
                      >
                        Добавить
                      </button>
                      </>
                    ) : (<Loading height='100px' spinnerSize='50px'/>)
                }
                </div>
                ) : ('')
            }
          </div>
          <div className={classes['search-result-holder']}>
            {isLoading ? (<Loading height='3em' marginTop='6em' spinnerSize='5em'/>) : ('')}
            {((foundDocuments.length) && (!isLoading)) ? 
              (foundDocuments[curPage - 1].map((document, index) => 
              <div className={classes['search-result']}>
                <div 
                  className={classes['search-result-number']} 
                  dataAttr={
                    // ((oldSearchType === 'text') ? (document.numMatches ? (`Совпадений: ${document.numMatches}`) : (''))
                    // : 
                    // (`Совпадает на: ${document.similarity_score}%`))
                    ((oldSearchType === 'text') ? ('') : (`Релевантность: ${document.score}%`))
                  }
                >
                  {isChoosingDocs ? (
                    <div className={classes['choose-document']}>
                      <Checkbox 
                        color="success" 
                        checked={docsToSave.includes(document._id)}
                        onClick={handleDocInclude}
                        value={document._id}
                      />
                    </div>
                  ) : (' ')}
                  <p>{(curPage - 1) * documentsPerPage + index + 1}</p>
                </div>
                <div className={classes['search-result-doctitle']}>
                  <Link
                   dangerouslySetInnerHTML={
                    { __html: getTitleMatch(document.gost_number + '. ' + document.title, oldQuery, 80, '...') }
                  }
                   onClick={() => {
                      window.scrollTo({
                        top: 0
                      })
                    }
                   }
                   to={'/docs/' + document._id}
                  />
                </div>
                <div className={classes['search-result-docstatus']}>
                  <p>{document.status}</p>
                </div>
                <div className={classes['search-result-doctext']}>
                  <p dangerouslySetInnerHTML={{ __html: getQueryMatch(document.text_plain || '', oldQuery, 180, '...') }}/>
                </div>
              </div>
              ))
            :
            (isLoading ? ('') : (notFound ? (<p>Ничего не найдено.</p>) : (<p>Введите запрос.</p>)))
            
            }
          </div>
          <div className={classes['search-pages']}>
            <Pagination 
              count={foundDocuments.length || 1} 
              color="primary" 
              page={curPage}
              onChange={(e, value) => {setCurPage(value)}}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Search;