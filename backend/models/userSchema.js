const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: null,
      validate: {
        validator: (value) =>
          value === null || value === undefined || value.length >= 6,
        message: "Password must be at least 6 characters",
      },
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      enum: [
        "Amman",
        "Irbid",
        "Zarqa",
        "Ajloun",
        "Jerash",
        "Mafraq",
        "Balqa",
        "Madaba",
        "Karak",
        "Tafilah",
        "Maan",
        "Aqaba",
      ],
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: { 
        type: Date, 
        default: null }
        ,
    lastLoginIp: { 
        type: String, 
        default: null 
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
