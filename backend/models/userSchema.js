const mongoose =require ("mongoose");

const userSchema=new mongoose.Schema({
    name:{type:String,required:true, trim:true},
    email:{type:String,required:true, trim:true, unique:true, lowercase:true},
    password:{type:String,required:true, minlength:6 }, 
    phone:{type:String, trim:true},
    city:{type:String, enum:["Amman", "Irbid", "Zarqa", "Ajloun", "Jerash", "Mafraq", "Balqa", "Madaba", "Karak", "Tafilah", "Maan", "Aqaba"], trim:true},
    role:{type:String, required:true, enum:["user","admin"], default:"user"},
    isVerified:{type:Boolean, default:false}
}, {timestamps:true});

module.exports=mongoose.model("User", userSchema);