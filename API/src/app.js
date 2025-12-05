const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors')

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);



module.exports = app;