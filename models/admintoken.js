const mongoose = require('mongoose');

const admintoken = new mongoose.Schema({
    adminid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'admin',
    },
    token:{
        type:String,
        required:true,
    },
    expire:{
        type:Date,
        required:true,
    }

})

admintoken.index({expire:1},{expireAfterSeconds:0})

module.exports = mongoose.model('admin_token',admintoken)