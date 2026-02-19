const UserModel = require("../models/user.models");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
 const bcrypt = require("bcrypt")
const jwt = require(`jsonwebtoken`) 

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass:  process.env.PASS
    }
});

const generateOTP = () => crypto.randomInt(100000, 999999).toString();


const signUp = async( req,res)=> {
    try{
        const {name ,email ,password} =   req.body 
        const user = await UserModel.findOne({email})
        if(user ){
            return res.status(409).json({message :  "user is already exist you can not signup " , success : false});

        }
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        const hashedPassword = await bcrypt.hash(password, 10);
        const userModel =  new UserModel({ name ,email ,  password: hashedPassword,   otp, otpExpiry, isVerified: false  })
     
        await userModel.save()

         await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`
        });
        res.status(201).json({message:"sign up successful . Please verify OTP sent to email."  , success : true}) 

    }catch (error){
         res.status(500).json({message:"Internal server error " , success : false}) 

    }

}


// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        if (user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};

// Resend OTP
 const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Resend OTP Verification',
            text: `Your new OTP is: ${otp}`
        });

        res.json({ message: 'OTP resent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error resending OTP', error });
    }
};


const login = async( req,res)=> {
    try{
        const { email ,password} =   req.body 
      const   errorMessage = "authintication failed email or passsword wrong"
        const user = await  UserModel.findOne({email})
        if(!user ){
            return res.status(403).json({message :  errorMessage , success : false});

        }
        const  isPasswordEql =  await bcrypt.compare( password , user.password  )
        if(!isPasswordEql){
          return res.status(403).json({message :  errorMessage , success : false});
        }
           if (!user.isVerified) {
            return res.status(400).json({ message: 'Email not verified. Please verify OTP.' });
        }


        if(isPasswordEql){
           const jwtToken =  jwt.sign({ email : user.email , _id: user._id} ,
              process.env.JWT_SECRET ,
             { expiresIn : "24h"}

           )

           res.status(201).json({message:"login sucessful" , success : true , jwtToken  , email , name: user.name}) 
          
        }
      

    }catch (error){
         res.status(500).json({message:"Intenal server error " , success : false}) 

    }


    

}

const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find().select('-password'); 
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};



const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        await UserModel.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};






module.exports = {signUp , login ,getAllUsers  , getMe  , deleteAccount  , verifyOTP , resendOTP };