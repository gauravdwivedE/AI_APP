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
        console.log(err);
        
        res.status(500).json({
            error: err
        })
    }
}