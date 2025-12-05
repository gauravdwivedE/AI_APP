const router = require('express').Router();
const authUser = require('../middlewares/auth.middleware');
const { createChat, getChat } = require("../controllers/chat.controller")
const { getMessages } = require("../controllers/message.controller")

router.post('/', authUser, createChat);
router.get('/', authUser, getChat);
router.get('/:chatId/messages', authUser, getMessages);

module.exports = router