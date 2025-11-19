const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")

async function authUser(req, res, next) {
    try {
        const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1]

        if(!token){
            return res.status(401).json({
                error : "Token missing"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
       
        const user = await userModel.findById(decoded.id).select("-password")
        
        if(!user){
            return res.status(401).json({
                error : "Unauthenticated"
            })
        }
        req.user = user
        next()
    } catch (err) {
        
        res.status(401).json({
            error: "Unauthenticated"
        })
    }   
}

module.exports = authUser
