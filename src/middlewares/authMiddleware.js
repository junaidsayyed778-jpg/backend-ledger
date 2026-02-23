const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

async function authMiddleware(req, res, next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        res.status(401).json({
            message: "Unathorized access, token is missing"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId)

        req.user = user

        return next();
    }catch(err){
        return res.status(401).json({
            message: "Unathorized acces, token is missing"
        })
    }
}

module.exports = {
    authMiddleware
}