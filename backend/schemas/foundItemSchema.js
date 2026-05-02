const mongoose =require ("mongoose");

const foundItemSchema=new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    title:{type:String, required:true, trim:true},
    description:{type:String, required:true, trim:true},
    category:{type:mongoose.Schema.Types.ObjectId, ref:"Category", required:true},
    images:[{type:String,}],
    city:{type: String, required:true,enum:["Amman", "Irbid", "Zarqa", "Ajloun", "Jerash", "Mafraq", "Balqa", "Madaba", "Karak", "Tafilah", "Maan", "Aqaba"], trim:true},
    area:{type: String, required:true, trim:true},
    location:{  address:{type:String, required:true, trim:true},
                lat:{type:Number}, 
                lng:{type:Number}},
    foundDate:{type: Date, required:true},
    isResolved:{type: Boolean, default:false},
    status:{type: String, enum:["pending", "approved", "rejected"], default:"pending"},
}, {timestamps:true});

module.exports=mongoose.model("FoundItem", foundItemSchema);