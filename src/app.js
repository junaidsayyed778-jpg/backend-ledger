const express = require("express");
const authRoute = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes")
const cookieParser = require("cookie-parser")

const app = express();
app.use(express.json());
app.use(cookieParser())

app.use("/api/auth", authRoute);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes)
module.exports = app