const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const tokenBlacklistModel = require("../models/blacklistModel");

async function authMiddleware(req, res, next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        res.status(401).json({
            message: "Unathorized access, token is missing"
        })
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({ token });

    if(isBlacklisted){
        return res.status(401).json({
            message: "Unathorized access, token is invalid"
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

async function authSytemUserMiddleware(req, res, next){

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message: "Unathorized access, token is missing"
        })
    }

    
    const isBlacklisted = await tokenBlacklistModel.findOne({ token });

    if(isBlacklisted){
        return res.status(401).json({
            message: "Unathorized access, token is invalid"
        })
    }
    
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select("+systemUser")
        if(!user.systemUser){
            return res.status(403).json({
                message: "Forbidden access, not a system user"
            })
        }
        req.user = user
        return next();
    }catch(err){
        return res.status(401).json({
            message: "Unathorized access, token is invalid"
        })
    }
}

module.exports = {
    authMiddleware,
    authSytemUserMiddleware
}