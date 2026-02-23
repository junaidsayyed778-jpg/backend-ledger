const acountModel = require("../models/acountModel");

async function createAcountController(req, res){
    const user = req.user;

    const acount = await acountModel.create({
        user: user._id
    })

    res.status(201).json({
        acount
    })
}

module.exports = createAcountController