const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

//POST /api/transaction
//create a new transaction

router.post("/", authMiddleware, )
module.exports = router