const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const createAccountController = require("../controllers/accountController");

const router = express.Router();

//POST /api/accounts
//create a new account
router.post("/", authMiddleware, createAccountController)

module.exports = router