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