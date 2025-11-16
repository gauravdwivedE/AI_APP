const router = require('express').Router();
const authUser = require('../../middlewares/auth.middleware');
const { createChat } = require("../controllers/chat.controller")

router.post('/', authUser, createChat);

module.exports = router