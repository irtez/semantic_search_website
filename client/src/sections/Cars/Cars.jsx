import React, { useState, useEffect } from 'react'
import { getAllCars } from '../../http/carAPI'
import { getAllBrands } from '../../http/brandAPI'
import Loading from '../Loading'
import { FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import classes from './Cars.module.css'



const Cars = () => {
  const [cars, setCars] = useState(null)
  const [brands, setBrands] = useState(null)
  const [filtersLoading, setFiltersLoading] = useState(true)

  const navigate = useNavigate()
  const location = useLocation()
  const [categoryFilter, setCategoryFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [mileageFilter, setMileageFilter] = useState('')

  useEffect(() => {
    getAllCars()
      .then(responseData => {
        setCars(responseData)
      })
      .catch(error => {
        console.log('Error fetching data:', error)
      })
  }, [])

  useEffect(() => {
    getAllBrands()
      .then(responseData => {
        setBrands(responseData)
      })
      .catch(error => {
        console.log('Error fetching data:', error)
      })
  }, [])
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const brand = params.get('brand')
    const bodytype = params.get('bodytype')
    const mileage = params.get('mileage')
    setBrandFilter(brand || '')
    setCategoryFilter(bodytype || '')
    setMileageFilter(mileage || '')
    setFiltersLoading(false)
  }, [location.search])
  
  
  
  if (!cars || !brands || filtersLoading) {
    return <Loading/>
  }

  const bodytypes = []

  cars.map(car => {
    let bodytype = car.body
    if (!bodytypes.includes(bodytype)) {
      bodytypes.push(bodytype);
    }
    return bodytypes
  })

  const handleCategoryChange = (event) => {
    const { value } = event.target
    setCategoryFilter(value)
    const params = new URLSearchParams(window.location.search)
    value ? (params.set('bodytype', value)) : (params.delete('bodytype'))
    navigate(`?${params.toString()}`, { replace: true })
  }

  const handleBrandChange = (event) => {
    const { value } = event.target
    setBrandFilter(value)
    const params = new URLSearchParams(window.location.search)
    value ? (params.set('brand', value)) : (params.delete('brand'))
    navigate(`?${params.toString()}`, { replace: true })
  }

  const handleMileageChange = (event) => {
    const { value } = event.target
    setMileageFilter(value)
    const params = new URLSearchParams(window.location.search)
    value ? (params.set('mileage', value)) : (params.delete('mileage'))
    navigate(`?${params.toString()}`, { replace: true })
  }

  const handleResetFilters = () => {
    setCategoryFilter('')
    setBrandFilter('')
    setMileageFilter('')
    navigate('/cars', { replace: true })
  }

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0
    });
  };

  const filteredGoods = cars.filter((car) => {
    let isMileage = true
    if (!mileageFilter) {
      isMileage = true
    } else if (mileageFilter === "new") {
      isMileage = (car.mileage === "0")
    } else if (mileageFilter === "used") {
      isMileage = (car.mileage !== "0")
    }
    return (
      (!categoryFilter || car.body === categoryFilter) &&
      (!brandFilter || car.brand === brandFilter) &&
      isMileage
    )
  })

  
  return (
    
    <section id={classes.carssection}>
      <div className={classes.filters}>
        <h4>Автомобили в наличии</h4>
        <FormControl sx={{ m: 1, minWidth: 140 }}>
          <InputLabel id="category-filter-label">Тип кузова</InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter"
            value={categoryFilter}
            onChange={handleCategoryChange}
          >
            <MenuItem value="">Все</MenuItem>
            {bodytypes.map(bodytype => {
              return <MenuItem value={bodytype}>{bodytype}</MenuItem>
            })}
            
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 220 }}>
          <InputLabel id="brand-filter-label">Производитель</InputLabel>
          <Select
            labelId="brand-filter-label"
            id="brand-filter"
            value={brandFilter}
            onChange={handleBrandChange}
          >
            <MenuItem value="">Все</MenuItem>
            {brands.map(brand => {
              return <MenuItem value={brand.name}>{brand.name}</MenuItem>
            })}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 220 }}>
          <InputLabel id="mileage-filter-label">Пробег</InputLabel>
          <Select
            labelId="mileage-filter-label"
            id="mileage-filter"
            value={mileageFilter}
            onChange={handleMileageChange}
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="new">Новые</MenuItem>
            <MenuItem value="used">С пробегом</MenuItem>
          </Select>
        </FormControl>
        <Button style={{backgroundColor: "white", color: "black"}} variant="outlined" onClick={handleResetFilters}>Сбросить фильтры</Button>
      </div>
      <div className={classes.carcontainer}>
        { filteredGoods.length ? (
        filteredGoods.map( item =>
            <Link onClick={handleScrollToTop} to={'/cars/' + item._id} className={classes.carcard}>
              <div className={classes.carimage}>
                <img src={item.img} alt={item.brand + item.name + " photo"} />
              </div>
              <div className={classes.cardetails}>
                <h2 className={classes.cartitle}>{item.brand} {item.name}</h2>
                <p>Производитель: <span>{item.brand}</span></p>
                <p>Год выпуска: <span>{item.year}</span></p>
                <p>Комплектация: <span>{item.configuration}</span></p>
                <p>Двигатель: <span>{item.engine}</span></p>
                <p>Трансмиссия: <span>{item.transmission}</span></p>
                <p>Цвет: <span>{item.color}</span></p>
                <p>Тип кузова: <span>{item.body}</span></p>
                <p>Пробег: <span>{item.mileage} км</span></p>
                <p className={classes.carprice}><span>{item.price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽</span></p>
              </div>
            </Link> )) : (<p>По вашему запросу ничего не найдено.</p>)
        }
      </div>
    </section>
  )
}

export default Cars