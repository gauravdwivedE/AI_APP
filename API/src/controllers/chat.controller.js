const chatModel = require("../models/chat.model");

module.exports.createChat = async (req, res) => {
    try {
        const {title} = req.body || {}
        let user = req.user._id
        const chat = await chatModel.create({user, title })

        res.status(201).json({
            message: "Chat created successfully",
            chat
        })
    } catch (err) {        
        res.status(500).json({
            error: err
        })
    }
}

module.exports.getChat = async (req, res) => {
    try {
        let user = req.user._id
        const chats = await chatModel.find({user}).sort({createdAt: -1})

        res.status(200).json({
            message: "Chat fetch successfully",
            chats
        })
    } catch (err) {
     
        res.status(500).json({
            error: err
        })
    }
}