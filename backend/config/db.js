const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("DB Connected Sucessfully"))
    .catch((err) =>{ console.log(err); });