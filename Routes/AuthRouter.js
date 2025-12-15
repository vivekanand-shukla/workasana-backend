const { signUp, login  , getAllUsers  } = require('../Controllers/AuthController');
const { signupValidation, loginValidation   } = require('../Middlewares/AuthValidation');
const  ensureAuthenticated = require("../Middlewares/Auth")
const router = require('express').Router()




router.post('/signup' ,signupValidation , signUp )
router.post('/login' , loginValidation , login )
router.get('/alluser' , ensureAuthenticated , getAllUsers  )

module.exports  = router;