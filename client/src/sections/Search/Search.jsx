import React, { useState, useContext } from 'react'
import { AppContext } from '../../routes/AppContext'
import classes from './Search.module.css'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';
import { searchDocs } from '../../http/searchAPI'
import Loading from '../Loading'
import { Link } from 'react-router-dom'

const documentsPerPage = 5

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
  const [docsToSave, setDocToSave] = useState([])
  
  const {user} = useContext(AppContext)

  const handleTypeChange = (event) => {
    setSearchType(event.target.value)
  }

  const handleCollectionSave = (e) => {
    console.log(user.isAuth)
  }
  
  const getTitleMatch = (text, query, maxTitleLength, ellipsis) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) {
      return text.slice(0, maxTitleLength) + ellipsis
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
    if (maxTitleLength > text.length) {
      newText += '...'
    }
    return newText
  }

  const getQueryMatch = (text, query, windowSize, ellipsis) => {
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
      newText += '...'
    }
    return newText
  }


  const Search = async (e) => {
    if ((!searchQuery) || (searchQuery.length < 0) || ((searchQuery === oldQuery) && (searchType === oldSearchType))) {
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
              onClick={handleCollectionSave}
              disabled={!user.isAuth}
              title={!user.isAuth ? "Сохранение доступно только авторизованным пользователям" : ''}
            >
              Сохранить результаты поиска
            </button>
          </div>
          <div className={classes['search-result-holder']}>
            {isLoading ? (<Loading height='3em' marginTop='6em' spinnerSize='5em'/>) : ('')}
            {((foundDocuments.length) && (!isLoading)) ? 
              (foundDocuments[curPage - 1].map((document, index) => 
              <div className={classes['search-result']}>
                <div 
                  className={classes['search-result-number']} 
                  dataAttr={
                    ((oldSearchType === 'text') ? (`Совпадений: ${document.numMatches}`) 
                    : 
                    (`Совпадает на: ${document.similarity_score}%`))
                  }
                >
                  <p>{(curPage - 1) * documentsPerPage + index + 1}</p>
                </div>
                <div className={classes['search-result-doctitle']}>
                  <Link
                   dangerouslySetInnerHTML={
                    { __html: getTitleMatch(document._doc.gost_number + '. ' + document._doc.title, oldQuery, 80, '...') }
                  }
                   onClick={() => {
                      window.scrollTo({
                        top: 0
                      })
                    }
                   }
                   to={'/docs/' + document._doc._id}
                  />
                </div>
                <div className={classes['search-result-docstatus']}>
                  <p>{document._doc.status}</p>
                </div>
                <div className={classes['search-result-doctext']}>
                  <p dangerouslySetInnerHTML={{ __html: getQueryMatch(document._doc.text_plain, oldQuery, 180, '...') }}/>
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