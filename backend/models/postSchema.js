const mongoose =require ("mongoose");

const postSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"User", 
        required:true
    },
    type:{
        type: String,
        enum: ["lost","found"],
        required: true,
    },        
    title:{
        type:String, 
        required:true, 
        trim:true,
        minlength: 3,
        maxlength: 100
    },
    description:{
        type:String, 
        required:true, 
        trim:true,
        minlength: 10,
        maxlength: 1000
    },
    category:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"Category", 
        required:true
    },
    images:[{type: String}],

    city:{
        type: String, 
        required:true,
        enum:["Amman", "Irbid", "Zarqa", "Ajloun", "Jerash", "Mafraq", "Balqa", "Madaba", "Karak", "Tafilah", "Maan", "Aqaba"], 
    },
    area:{
        type: String, 
        required:true, 
        trim:true
    },
    location:{
        address:{type:String, required:true, trim:true},
        lat:{type:Number,}, 
        lng:{type:Number}
    },
    itemDate:{
        type: Date, 
        required:true
    },
    reward:{
        type: Number, 
        default:0,
        min: 0,
        validate: {
            validator: function(value){
                if(this.type==="found"){
                    return value===0;
                }
                return true;
            },
            message: "Reward is only allowed for lost posts";
        },
    },
    contactPhone:{
        type: String,
        trim: true
    },
    isResolved:{
        type: Boolean, 
        default:false
    },
    status:{
        type: String, 
        enum:["pending", "approved", "rejected", "resolved"], 
        default:"pending"},
}, 
{timestamps:true}
);

module.exports=mongoose.model("Post", postSchema);