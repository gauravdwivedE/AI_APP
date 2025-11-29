const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { main, generateVector } = require("../services/ai.service");
const {
  createMessage,
  fetchChatHistory,
} = require("../handlers/message.handler");
const { createMemory, queryMemory } = require("../services/vector.service");

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
    socket.on("ai-message", async (data) => {
      const payload = {
        content: data.content,
        chat: data.chat,
        user: socket.user._id,
        role: "user",
      };

      const [userMessage, vectors] = await Promise.all([
         createMessage(payload),
         generateVector(data.content)

      ])
 
      const [vMemory, i, chatHistory] = await Promise.all([
        queryMemory({
          queryVectors: vectors,
          limit: 6,
          metadata: {
            user: socket.user._id
          },
        }),
        createMemory({
        vectors,
        messageId: userMessage._id,
        metadata: {
          chat: data.chat,
          user: socket.user._id,
          text: data.content,
        },
      }),
       fetchChatHistory(data.chat)
      ])


      const ltm = [
                {
                    role:"user",
                    parts:[{
                        text:`These are some previous message from the chat use then to get response:\n
                        ${vMemory?.map(item => item.metadata.text).join('\n')}
                        `
                    }]
                }
      ]
      const res = await main([...ltm, ...chatHistory]);

      //changing message payload
      payload.role = "model";
      payload.content = res;

      const[aiMessage, resVectors] = await Promise.all([
        createMessage(payload),
        generateVector(res)

      ])

      await createMemory({
        vectors: resVectors,
        messageId: aiMessage._id,
        metadata: {
          chat: data.chat,
          user: socket.user._id,
          text: res,
        },
      });

      socket.emit("ai-response", {
        content: res,
        chat: payload.chat
      });
    });
  });
}

module.exports = initSocketServer;
