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

module.exports = createAccountController;