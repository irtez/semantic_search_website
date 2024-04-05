import React, { useState } from 'react'
import classes from './Search.module.css'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';
import { searchText } from '../../http/searchAPI'
import Loading from '../Loading'


const statuses = {
  'present': 'Действует',
  'accepted': 'Принят',
  'cancelled': 'Отменён',
  'replaced': 'Заменён'
}

function escapeRegex(str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

const Search = () => {
  const [searchType, setSearchType] = useState('text')
  const [searchQuery, setSearchQuery] = useState('')
  const [oldQuery, setOldQuery] = useState(null)
  const [foundFiles, setFoundFiles] = useState([])
  const [curPage, setCurPage] = useState(1)
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setLoading] = useState(false)

  const handleTypeChange = (event) => {
    setSearchType(event.target.value)
  }
  
  const getQueryMatch = (text, query, windowSize, ellipsis) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    query = escapeRegex(query)
    
    if (index === -1) {
      return text.slice(0, windowSize*2) + ellipsis
    }
    const queryLength = query.length
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
    if ((!searchQuery) || (searchQuery.length < 0) || (searchQuery === oldQuery)) {
      return
    }
    setLoading(true)
    if (searchType === 'text') {
      const response = await searchText(searchQuery)
      if (response.status === 200) {
        const files = response.data.files
        setOldQuery(searchQuery)
        setFoundFiles(files)
        if (!files.length) {
          setNotFound(true)
        }
        setLoading(false)
      }      
    }
    else {
      alert('Пошел нахуй')
    }
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
            />
            <i onClick={Search} className='fa fa-search'></i>
          </div>
        </div>
        <div className={classes['search-results']}>
          <div className={classes['search-save']}>
            <div className={classes['search-save-button']}>
              Сохранить результаты поиска
            </div>
          </div>
          <div className={classes['search-result-holder']}>
            {isLoading ? (<Loading height='3em' marginTop='6em' spinnerSize='5em'/>) : ('')}
            {((foundFiles.length) && (!isLoading)) ? 
              (foundFiles[curPage - 1].map((file, index) => 
              <div className={classes['search-result']}>
                <div className={classes['search-result-number']} dataAttr={`Совпадений: ${file.nameMatches + file.textMatches}`}>
                  <p>{index + 1}</p>
                </div>
                <div className={classes['search-result-doctitle']}>
                  <p dangerouslySetInnerHTML={{ __html: getQueryMatch(file._doc.name, oldQuery, 150, '') }}/>
                </div>
                <div className={classes['search-result-docstatus']}>
                  <p>{statuses[file._doc.status]}</p>
                </div>
                <div className={classes['search-result-doctext']}>
                  <p dangerouslySetInnerHTML={{ __html: getQueryMatch(file._doc.text, oldQuery, 200, '...') }}/>
                </div>
              </div>
              ))
            :
            (isLoading ? ('') : (notFound ? (<p>Ничего не найдено.</p>) : (<p>Введите запрос.</p>)))
            
            }
          </div>
          <div className={classes['search-pages']}>
            <Pagination 
              count={foundFiles.length || 1} 
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