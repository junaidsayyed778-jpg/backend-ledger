const userModel = require("../models/userModel");
const accountModel = require("../models/accountModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const emailService = require("../services/emailService");
const bcrypt = require("bcrypt");

// REGISTER
async function userRegisterController(req, res) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { name, email, password } = req.body;

    const isExists = await userModel.findOne({ email });

    if (isExists) {
      return res.status(422).json({
        message: "User already exists",
      });
    }

    // 1. create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create(
      [
        {
          name,
          email,
          password: hashedPassword,
        },
      ],
      { session },
    );

    // 2. create account
    const account = await accountModel.create(
      [
        {
          user: user[0]._id,
          balance: 0,
          status: "ACTIVE",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    const token = jwt.sign({ userId: user[0]._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("token", token);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user[0]._id,
        email: user[0].email,
        name: user[0].name,
      },
      account: account[0],
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  } finally {
    session.endSession();
  }
}

// LOGIN
async function userLoginController(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Email or password is invalid",
      });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Email or password is invalid",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("token", token);

    // send email (don’t block response ideally)
    await emailService.sendRegistrationEmail(user.email, user.name);

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
}

module.exports = {
  userRegisterController,
  userLoginController,
};
