const express = require("express");
const router=express.Router();
const passport=require("passport");
const{registerUser, loginUser, googleCallback}=require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
//google login
router.get("/google", passport.authenticate("google", {scope: ["profile", "email"]}));
//googleCallback
router.get("/google/callback", passport.authenticate("google", {session: false, failureRedirect: "/login" }), googleCallback);

module.exports=router;