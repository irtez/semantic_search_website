class healthCheck {
    async healthCheck(req, res) {
        return res.status(200).json({message: "sucess"})
    }
}

module.exports = new healthCheck()