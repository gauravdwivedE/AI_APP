const messageModel = require('../models/message.model')

module.exports.getMessages = async(req, res) => {
    try {
        const user = req.user._id
        const chat = req.params.chatId

       if(!chat){
        return res.status(400).json({
            error: 'missing chatId field chat'
        })
       }
        
        const messages = await messageModel.find({chat, user})

        res.status(200).json({
            messages
        })
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
}