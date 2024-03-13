import React from 'react';
import Header from './header/Header';
import Footer from './footer/Footer';
import CheckAuth from '../routes/checkAuth'

const headerData = {
    nav : [
        {'link' : "/cars", 'text' : "Автомобили в наличии"},
        {'link' : "/service", 'text' : "Сервис"},
        {'link' : "/about", 'text' : "Наши контакты"}
    ]
  };

const Layout = ({ children }) => {
  return (
    <>
      <Header data={headerData}/>
        <CheckAuth>
          {children}
        </CheckAuth>
      <Footer />
      
    </>
  );
};

export default Layout;