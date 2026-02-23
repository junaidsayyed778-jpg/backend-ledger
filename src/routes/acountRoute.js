const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const createAcountController = require("../controllers/acountController");

const router = express.Router();

//POST /api/acounts
//create a new acount
router.post("/", authMiddleware, createAcountController)

module.exports = router