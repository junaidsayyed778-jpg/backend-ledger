const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {getUserAccountController,createAccountController, getAccountBalanceController} = require("../controllers/accountController");

const router = express.Router();

//POST /api/accounts
//create a new account
router.post("/", authMiddleware, createAccountController)

//GET /api/accounts
//get users accounts
router.get("/", authMiddleware, getUserAccountController)

//GET /api/accounts/balance/:accountId
router.get("/balance/:accountId", authMiddleware, getAccountBalanceController)
module.exports = router