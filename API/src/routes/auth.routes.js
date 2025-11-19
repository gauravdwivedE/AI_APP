const router = require('express').Router();
const authUser = require('../middlewares/auth.middleware');
const {register, login} = require("../controllers/auth.controller")

router.post('/register', register);
router.post('/login', login);

module.exports = router