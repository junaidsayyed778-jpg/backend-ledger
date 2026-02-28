const accountModel = require("../models/accountModel");

async function createAcountController(req, res){
    const user = req.user;

    const acount = await accountModel.create({
        user: user._id
    })

    res.status(201).json({
        acount
    })
}

module.exports = createAcountController