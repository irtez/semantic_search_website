import { Routes, Route } from 'react-router-dom'
// import Home from '../sections/Home/Home';
// import About from '../sections/About/About';
// import Cars from '../sections/Cars/Cars';
// import Service from '../sections/Service/Service';
// import Car from '../sections/Car/Car';
import Login from '../sections/Login';
import Register from '../sections/Register';
import NotFound from '../sections/404/NotFound';
import User from '../sections/User/User';
import Admin from '../sections/Admin/Admin';
import Search from '../sections/Search/Search';
import Document from '../sections/Document/Document'
import { AppContext } from './AppContext.js'
import { useContext } from 'react'
import { observer } from 'mobx-react-lite';


const publicRoutes = [
    {path: '/', Component: Search},
    {path: '/login', Component: Login},
    {path: '/register', Component: Register},
    {path: '/docs/:id', Component: Document}
]

const userRoutes = [
    {path: '/user', Component: User},
]

const adminRoutes = [
    {path: '/admin', Component: Admin},
]

const AppRouter = observer(() => {
    const {user} = useContext(AppContext)
    return (
        
        <Routes>
            {publicRoutes.map(({path, Component}) =>
                <Route key={path} path={path} element={<Component/>} />
            )}
            {user.isAuth && userRoutes.map(({path, Component}) =>
                <Route key={path} path={path} element={<Component/>} />
            )}
            {user.isAdmin && adminRoutes.map(({path, Component}) =>
                <Route key={path} path={path} element={<Component/>} />
            )}
            <Route path='/*' element={<NotFound/>} />
        </Routes>
    )
})

export default AppRouter;