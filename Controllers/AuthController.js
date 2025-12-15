const UserModel = require("../models/user.models");
 const bcrypt = require("bcrypt")
const jwt = require(`jsonwebtoken`) 
const signUp = async( req,res)=> {
    try{
        const {name ,email ,password} =   req.body 
        const user = await UserModel.findOne({email})
        if(user ){
            return res.status(409).json({message :  "user is already exist you can login " , success : false});

        }
        const userModel =  new UserModel({ name ,email , password })
        userModel.password = await bcrypt.hash(password , 10 );
        await userModel.save()
        res.status(201).json({message:"sign up successful" , success : true}) 

    }catch (error){
         res.status(500).json({message:"Intenal server error " , success : false}) 

    }

}
// console.log("JWT_SECRET ==>", process.env.JWT_SECRET)


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


    // 

}

const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find().select('-password'); // exclude password
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};



module.exports = {signUp , login ,getAllUsers };