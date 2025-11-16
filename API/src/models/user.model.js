const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    fullName:{
        firstName: { type: String, required: true, trim: true},
        lastName: { type: String, required: true, trim: true}
    },
    password: {
        type: String
    }
    
},{timestamps: true});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
