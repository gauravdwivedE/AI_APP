const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function validateCredential(args) {
   const error = [];
   for (const key in args) {
      if(!args[key]) {
         error.push(key);
      }
   }
   return error;
}

module.exports.register = async(req, res) => {
 try {
    const { email, password, fullName} = req.body || {};
    const error = validateCredential({email, password, fullName});
    if(error.length) {
        return res.status(400).json({
            error: `Missing required fields`,
            fields : error
        });
    }

    let user = await userModel.findOne({ email });
    if(user) {
        return res.status(409).json({
            error: 'User already exists'
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user = await userModel.create({ email, password: hashedPassword, fullName });
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.cookie('token', token )
    res.status(201).json({
        message: 'User registered successfully',
        token,
        user:{
         id: user._id,
         email: user.email,
         fullName: user.fullName,
        }
    });

 } catch (err) {
    res.status(500).json({
        error: err.message
    })
 }   

}

module.exports.login = async(req, res) => {
    const {email, password} = req.body || {}
    const error = validateCredential({email, password})
    if(error.length) {
        return res.status(400).json({
            error: `Missing required fields`,
            fields : error
        });
    }
    const user = await userModel.findOne({email})
    if(!user){
        return res.status(401).json({
             error: `Invalid email or password`,
        })
    }

    const isMatched = await bcrypt.compare(password, user.password)
    if(!isMatched){
        return res.status(401).json({
             error: `Invalid email or password`,
        })
    }

     const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.cookie('token', token )
    res.status(200).json({
        message: 'User loggedin successfully',
        token,
        user:{
         id: user._id,
         email: user.email,
         fullName: user.fullName,
        }
    });
}