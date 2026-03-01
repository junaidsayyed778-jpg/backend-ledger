const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { createTransaction } = require("../controllers/transactionController");

const router = express.Router();

//POST /api/transaction
//create a new transaction

router.post("/", authMiddleware, createTransaction)
module.exports = router