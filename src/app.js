const express = require("express");
const authRoute = require("./routes/authRoutes");
const cookieParser = require("cookie-parser")

const app = express();
app.use(express.json());
app.use(cookieParser())

app.use("/api/auth", authRoute);
module.exports = app