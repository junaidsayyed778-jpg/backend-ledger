const accountModel = require("../models/accountModel");

async function createAccountController(req, res) {
  try {
    const userId = req.user._id;

    // 🔒 Check if account already exists
    const existingAccount = await accountModel.findOne({ user: userId });

    if (existingAccount) {
      return res.status(400).json({
        message: "Account already exists for this user",
      });
    }

    // ✅ Create account
    const account = await accountModel.create({
      user: userId,
      balance: 0,
      status: "ACTIVE",
    });

    return res.status(201).json({
      message: "Account created successfully",
      account,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getUserAccountController(req, res){
  const accounts = await accountModel.find({ user: req.user._id});

  return res.status(200).json({
    accounts,
    userId: req.user._id
  })
}

async function getAccountBalanceController(req, res){
  const { accountId } = req.params;

  const account = await accountModel.findOne({_id: accountId, user: req.user._id});


  if(!account){
    return res.status(404).json({
      message: "Account not found"
    })
  }

  const balance = await account.getBalance();

  return res.status(200).json({
    accountId: account._id,
    balance
  })
}
module.exports = {
  createAccountController,
  getUserAccountController, 
  getAccountBalanceController
};