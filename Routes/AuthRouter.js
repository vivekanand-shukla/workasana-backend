const { signUp, login  , getAllUsers , getMe  , deleteAccount   } = require('../Controllers/AuthController');
const { signupValidation, loginValidation   } = require('../Middlewares/AuthValidation');
const  ensureAuthenticated = require("../Middlewares/Auth")
const router = require('express').Router()




router.post('/signup' ,signupValidation , signUp )
router.post('/login' , loginValidation , login )
router.get('/alluser' , ensureAuthenticated , getAllUsers  )
router.get('/me', ensureAuthenticated, getMe)
router.delete( '/delete-account',ensureAuthenticated, deleteAccount);


module.exports  = router;