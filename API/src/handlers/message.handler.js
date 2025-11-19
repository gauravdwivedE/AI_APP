const messageModel = require('../models/message.model')

module.exports.createMessage =  async (payload) => {
    const {content, chat, user, role} = payload
    try {
        const message = await messageModel.create({content, chat, user, role})
        return message
    } catch (err) {
        return {error: err.message}
    }
}

module.exports.fetchChatHistory =  async (chatId) => {
    try {
        const chatHistory = await messageModel.find({chat: chatId}).limit(20)
        return chatHistory.map((item) =>{
            return {
               role: item.role,
               content: item.content
            }
        })
    } catch (err) {
        return {error: err.message}
    }
}