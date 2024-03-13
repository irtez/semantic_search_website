import { AppContext } from './AppContext.js'
import { check } from '../http/userAPI.js'
import { useContext, useEffect, useState } from 'react'
import Loading from '../sections/Loading.jsx'


const CheckAuth = (props) => {
    const { user } = useContext(AppContext)
    const [checking, setChecking] = useState(true)
    
    useEffect(() => {
        check()
            .then(data => {
                if (data) {
                    user.login(data)
                }
            })
            .finally(
                () => setChecking(false)
            )
    }, [user])

    if (checking) {
        return (
            <Loading/>
        )
    }

    return props.children
}

export default CheckAuth