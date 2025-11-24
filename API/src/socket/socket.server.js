const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const {main, generateVector} = require('../services/ai.service')
const {createMessage, fetchChatHistory} = require('../handlers/message.handler')
const {createMemory, queryMemory} = require('../services/vector.service')

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
        role: 'user',
      }
      const userMessage = await createMessage(payload)

      if(userMessage.error){
        return socket.emit("message-error", userMessage.error)
      }

      const vectors = await generateVector(data.content)
     //---> doute
      console.log(await queryMemory({queryVectors: vectors, limit:3, metadata:{}} ));
      
      await createMemory({
        vectors,
        messageId: userMessage._id,
        metadata:{
          chat: data.chat,
          user: socket.user._id,
          text: data.content
        }
      })
    
      const chatHistory = await fetchChatHistory(payload.chat)
      
       if(chatHistory.error){
         return socket.emit("message-error", chatHistory.error)
       }

      const res =  await main(chatHistory)

      //changing message payload
      payload.role = 'model'
      payload.content = res

      const aiMessage = await createMessage(payload)

       
      if(aiMessage.error){
        return socket.emit("message-error", aiMessage.error)
      }

      const resVectors = await generateVector(res)

      await createMemory({
        vectors: resVectors,
        messageId: aiMessage._id,
        metadata:{
          chat: data.chat,
          user: socket.user._id,
          text: res
        }
      })
    
      socket.emit("ai-response", aiMessage.content)
      if(aiMessage.error){
        return socket.emit("message-error", aiMessage.error)
      }
    })
    
  });
}

module.exports = initSocketServer;
