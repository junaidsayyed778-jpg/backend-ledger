const express = require("express");
const authRoute = require("./routes/authRoutes");
const acountRoutes = require("./routes/acountRoute")
const cookieParser = require("cookie-parser")

const app = express();
app.use(express.json());
app.use(cookieParser())

app.use("/api/auth", authRoute);
app.use("/api/acounts", acountRoutes)
module.exports = app