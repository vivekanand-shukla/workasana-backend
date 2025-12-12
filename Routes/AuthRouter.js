const { signUp, login } = require('../Controllers/AuthController');
const { signupValidation, loginValidation   } = require('../Middlewares/AuthValidation');

const router = require('express').Router()




router.post('/signup' ,signupValidation , signUp )
router.post('/login' , loginValidation , login )

module.exports  = router;