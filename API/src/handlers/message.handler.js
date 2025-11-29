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

module.exports.fetchChatHistory = async (chatId) => {
  try {
    const chatHistory = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 })
      .limit(25)
      .lean();

    return chatHistory.map((item) => ({
      role: item.role,
      parts: [{ text: item.content }],
    }));

  } catch (err) {
    return { error: err.message };
  }
};
