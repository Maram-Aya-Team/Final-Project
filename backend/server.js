const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const userSchema = require("./models/userSchema");
const refreshTokenSchema = require("./models/refresh-token.schema");
const emailOTPSchema = require("./models/email-otp.schema");
const passport=require("./config/google");
const userRouter=require("./routers/userRouter");

const app = express();

app.use(cors());
app.use(express.json());

app.use(passport.initialize());
app.use("/api/auth", userRouter)

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.json({
        success: true,
        message:"Backend is running"
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});