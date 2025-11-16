const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../src/models/user.model");
const {main} = require('../services/ai.service')

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
      const user = await userModel.findById(decoded.id);
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication Failed"));
    }
  });

  main()

  io.on("connection", (socket) => {
    socket.on("ai-message", (data) => {
      console.log('====================================');
      console.log(data);
      console.log('====================================');
    })
  });
}

module.exports = initSocketServer;
