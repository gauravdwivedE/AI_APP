require('dotenv').config();
const app = require('./src/app');
const http = require('http')
const dbConnect = require('./src/db/db');
const initSocketServer = require('./src/socket/socket.server')

const httpServer = http.createServer(app)

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  dbConnect();
  initSocketServer(httpServer)
  console.log(`Server is running on port ${PORT}`);
});
