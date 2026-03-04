const express = require("express");
const authRoute = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(morgan("dev"))
app.get("/", (req, res) =>{
    res.send("Ledger services is up and running!")
})
app.use("/api/auth", authRoute);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes)
module.exports = app