const User=require("../models/userSchema");
const bcrypt=require("bcrypt");
const generateToken=require("../utils/generateToken");

const registerUser=async(req,res)=>{
    try{
        const {name, email, password}=req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const existingUser=await User.findOne({email: email.toLowerCase()})
        if(existingUser){
            return res.status(409).json({
                success: false,
                message: "User already exists"
            })
        }

        const hashedPassword=await bcrypt.hash(password, 10);


        const user=new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        })
        await user.save();

        const token=generateToken(user._id);
        return res.status(201).json({
            success: true,
            message: "Registered succesfully",
            token,
            user:{
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        })
    }
}

const loginUser=async(req,res)=>{
    try{
        const {email, password}=req.body;
        const user=await User.findOne({email: email.toLowerCase()})
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid informations"
            })
        }

        const isMatch =await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(401).json({
                    success: false,
                    message: "Invalid informations"
                })
            }

            const token =generateToken(user._id);
            res.status(200).json({
                success: true,
                token,
                user: { id: user._id, name: user.name, email: user.email }
            })
    }catch(err){
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        })

    }
}
//login with google
const googleCallback=async(req,res)=>{
    try{
        if(!req.user){
            return res.status(401).json({
                success: false,
                message: "Authentication with Google failed."
            })
        }
        const token=generateToken(req.user._id);
        res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
    }catch(err){
        res.status(500).json({
            success: false,
            message: "Error processing Google login"
        })
    }
}

module.exports={registerUser, loginUser, googleCallback}