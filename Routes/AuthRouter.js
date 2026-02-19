const { signUp, login  , getAllUsers , getMe  , deleteAccount , verifyOTP , resendOTP   } = require('../Controllers/AuthController');
const { signupValidation, loginValidation   } = require('../Middlewares/AuthValidation');
const  ensureAuthenticated = require("../Middlewares/Auth")
const router = require('express').Router()




router.post('/signup' ,signupValidation , signUp )
router.post('/login' , loginValidation , login )


router.post('/verify-otp' , verifyOTP )
router.post('/resend-otp' , resendOTP )

router.get('/alluser' , ensureAuthenticated , getAllUsers  )
router.get('/me', ensureAuthenticated, getMe)
router.delete( '/delete-account',ensureAuthenticated, deleteAccount);


module.exports  = router;