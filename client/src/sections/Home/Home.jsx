import React, { useState, useEffect } from 'react'
import classes from './Home.module.css'
import { getAllCars } from '../../http/carAPI';
import { getAllBrands, delBrand, editBrand } from '../../http/brandAPI';
import Loading from '../Loading';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { AppContext } from '../../routes/AppContext';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';

const Brands = observer((props) => {
  const { user } = useContext(AppContext);
  const [isEditing, setIsediting] = useState(null)
  const [photo, setPhoto] = useState(null)
  const handleDelete = async (event) => {
    const brand = event.target.value;
    const data = await delBrand(brand);
    if (data) {
      window.location.reload()
    }
  };
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0
    });
  };
  const handleChange = (event) => {
    const name = event.target.value
    setIsediting(null)
    if (!(isEditing === name)) {
      setIsediting(name)
    }
  };
  const chooseBrandPhoto = (event) => {
    setPhoto(event.target.files[0])
  }
  const changeBrandPhoto = async (event) => {
    try {
      event.preventDefault()
      const brandName = event.target.value
      const formData = new FormData()
      formData.append('image', photo)
      formData.append('name', brandName)
      const newBrand = await editBrand(formData)
      if (newBrand) {
        window.location.reload()
      } else {
        console.log('error in server request to change photo')
      }
    } catch (e) {
      console.log('Error changing photo', e)
    }
  }
  return (
    <div className={classes.brandinfo}>
          {user.isAdmin ? (
            <div className={classes.adminButtons}>
              <button style={{ backgroundColor: "green" }} className='fa fa-edit' value={props.brand.name} onClick={handleChange}></button>
              <button style={{ backgroundColor: "red" }} className='fa fa-trash' value={props.brand.name} onClick={handleDelete}></button>
            </div>
          ) : ("")}
          <h3>{props.brand.name}</h3>
          {(isEditing === props.brand.name) ? (
            <>
            <input type="file" onChange={chooseBrandPhoto}/>
            <button value={props.brand.name} onClick={changeBrandPhoto}>Изменить фото</button>
            </>) : (
            <Link onClick={handleScrollToTop} to={'/cars?brand=' + props.brand.name}><img alt={props.brand.name + " logo"} 
              src={props.brand.img}/></Link>)}
          
        </div>
    
  );
})

const Home = () => {
  const [cars, setCars] = useState(null)
  const [brands, setBrands] = useState(null)

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

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0
    })
  }

  if (!cars || !brands) {
    return <Loading/>
  }

  const carsShuffled = shuffleArray(cars)

  return (
    <section id={classes.home}>
      <h1><Link onClick={handleScrollToTop} to='/cars'>Автомобили в наличии</Link></h1>
      <div className={classes.cars}>
        {carsShuffled.slice(0,3).map(car =>  {
        //const car = cars[index]
        return (
          <Card sx={{ width: 500 }} style={{
            borderRadius: "20px",
            boxShadow: "0px 0px 3px 3px rgba(255, 255, 255, 0.2)"
          }}>
            <Link onClick={handleScrollToTop} style={{color: 'black'}} to={'/cars/' + car._id}>
            <CardActionArea>
              <CardMedia
                component="img"
                width="auto"
                height="240"
                image={car.img}
                alt={car.name + " photo"} 
                
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {car.brand} {car.name} {car.year}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <br/>
                  <p>Двигатель: {car.engine}</p>
                  <p>Пробег: {car.mileage} км</p>
                  <h5>{car.price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽</h5>
                </Typography>
              </CardContent>
            </CardActionArea>
            </Link>
          </Card>
        // <div className={classes.carinfo}>
        //   <h3>{car.brand} {car.name} {car.year}</h3>
        //   <img alt={car.brand + " " + car.name + " photo"} src={car.img}/>
        //   <p>{car.price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽</p>
        // </div>
        )
      })}
      </div>
      <h1>Представленные производители</h1>
      <div className={classes.brands}>
      {brands.map( brand => {
        return <Brands brand={brand}/>
      })}
      </div>
      <h1>Информация о нас</h1>
      <div className={classes.dealerinfo}>
        <p>Мы являемся крупным автодилером, предлагающим широкий выбор автомобилей различных марок и
        моделей. С нашими высококвалифицированными сотрудниками и дружественным обслуживанием мы
        гарантируем отличный опыт покупки автомобиля.</p>
        <img src="https://slanews.ru/wp-content/uploads/2022/11/1667995560_GEELY-predstavila-v-KNR-semimestnyiy-krossover-GEELY-Haoyue-L-po-cene-LADA-Vesta_2.jpg" alt="dealer"/>
      </div>
    </section>
  );
};



export default Home;