const jwt = require('jsonwebtoken')


module.exports = function (roles) {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next()
        }
        try {
            if (!req.headers.authorization) {
                return res.status(403).json({message: "Пользователь не авторизован"})
            }
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return res.status(403).json({message: "Пользователь не авторизован"})
            }
            let userRoles
            try {
                const { roles } = jwt.verify(token, process.env.secret)
                userRoles = roles
            }
            catch (e) {
                if (e.name === 'TokenExpiredError') {
                    return res.status(400).json({message: "Ваш токен истек. Авторизуйтесь заново."})
                } else {
                    throw e
                }
            }   
                
            let hasRole = false
            userRoles.forEach(role => {
                if (roles.includes(role)) {
                    hasRole = true
                }
            })
            if (!hasRole) {
                return res.status(403).json({message: "У вас нет доступа"})
            }
            next()
        } catch (e) {
            console.log(e)
            return res.status(403).json({message: "Пользователь не авторизован"})
        }
    } 
}