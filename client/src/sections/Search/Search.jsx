import React, { useState } from 'react'
import classes from './Search.module.css'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';


const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

const Search = () => {
  const [searchType, setSearchType] = useState('text')

  const handleTypeChange = (event) => {
    setSearchType(event.target.value)
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
            />
            <i className='fa fa-search'></i>
          </div>
        </div>
        <div className={classes['search-results']}>
          <div className={classes['search-save']}>
            <div className={classes['search-save-button']}>
              Сохранить результаты поиска
            </div>
          </div>
          <div className={classes['search-result-holder']}>
            <div className={classes['search-result']}>
              <div className={classes['search-result-number']}>
                1
              </div>
              <div className={classes['search-result-doctitle']}>
                Заголовок документа 1
              </div>
              <div className={classes['search-result-doctext']}>
                {text}
              </div>
            </div>
          </div>
          <div className={classes['search-pages']}>
            <Pagination count={10} color="primary" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Search;