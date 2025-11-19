const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const {main} = require('../services/ai.service')
const {createMessage} = require('../handlers/message.handler')

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {

    // cookie.parse is dividing token to key value pair
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    if (!cookies.token) {
      next(new Error("Authentication error: Token is missing"));
    }
    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id).select("-password");
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication Failed"));
    }
  });

  io.on("connection", (socket) => {
    
    socket.on("ai-message",  async (data) => {
      const payload = {
        content: data.content,
        chat: data.chat,
        user: socket.user._id,
        role: 'user'
      }
      const userMessage = await createMessage(payload)

      if(userMessage.error){
        return socket.emit("message-error", userMessage.error)
      }
      
      const res =  await main(userMessage)

      //changing message payload
      payload.role = 'model'
      payload.content = res

      const aiMessage = await createMessage(payload)

      socket.emit("ai-response", aiMessage.content)
      if(aiMessage.error){
        return socket.emit("message-error", aiMessage.error)
      }
    })

  });
}

module.exports = initSocketServer;
