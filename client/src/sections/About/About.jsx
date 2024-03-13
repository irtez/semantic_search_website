import React from 'react'
import classes from './About.module.css'

const About = () => {
  return (
    <section id={classes.about}>
      <h1>Контакты</h1>
      <div className={classes.contactsmain}>
        <div className={classes.address} style={{position: "relative", overflow: "hidden"}}>
          <a 
            href="https://yandex.ru/maps/org/rtu_mirea/1084832794/?utm_medium=mapframe&utm_source=maps"
            style={{color: "#eee", fontSize:"12px", position:"absolute", top:"0px"}}>
          РТУ МИРЭА
          </a>
          <a 
            href="https://yandex.ru/maps/213/moscow/category/university/184106140/?utm_medium=mapframe&utm_source=maps"
            style={{color:"#eee", fontSize:"12px", position:"absolute", top:"14px"}}>
            ВУЗ в Москве
          </a>
            <iframe
              title="adress"
              src="https://yandex.ru/map-widget/v1/?ll=37.680919%2C55.728919&mode=poi&poi%5Bpoint%5D=37.480147%2C55.670016&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D1084832794&z=10.8"
              width="560"
              height="400"
              frameborder="1"
              allowfullscreen="true"
              style={{position: "relative"}}>
            </iframe>
          </div>
        <div className={classes.contacts}>
          <p>Мы находимся по адресу г. Москва, проспект Вернадского, 78.</p>
          <a href="tel: 79871234567"><i className='fa fa-phone'> +7 987 123-45-67</i></a>
          <a href="tel: 79871234567"><i className='fa fa-phone'> +7 987 123-45-67</i></a>
          <a href="mailto: germanautopoint@ga.ru"><i className='fa fa-envelope'> germanautopoint@ga.ru</i></a>
        </div>
      </div>
    </section>
  );
};

export default About;