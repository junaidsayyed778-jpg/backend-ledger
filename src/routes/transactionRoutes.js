const express = require("express");
const { authMiddleware, authSytemUserMiddleware } = require("../middlewares/authMiddleware");
const { createTransaction, createInitialFundsTransaction } = require("../controllers/transactionController");

const router = express.Router();

//POST /api/transactions
//create a new transaction
router.post("/", authMiddleware, createTransaction);

//POST /api/transactions/system/initial-funds
//create initial funds transaction fro system user
router.post("/system-initial-funds", authSytemUserMiddleware, createInitialFundsTransaction)
module.exports = router