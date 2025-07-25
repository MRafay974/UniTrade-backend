const UserModel=require("../models/user")
const jwtToken=require("jsonwebtoken")
const bycrypt=require("bcrypt")

async function SignUp(req,res){

    try {
        const {name,email,password,phone }=req.body
        const user=await UserModel.findOne({email})
        if(user){
            return res.status(409).json({message:"User already Exist",success:false})
        }
        const userModel=new UserModel({name,email,password,phone})
        userModel.password=await bycrypt.hash(password,10)
        await userModel.save()
        res.status(201).json({message:"SignUp Successfully", success:true})
    }
    catch (error) {
        res.status(500).json({message:"Internal Server Error",success:false})
    }
}

async function  Login(req,res){

    try {
        const {email,password}=req.body
        const user=await UserModel.findOne({email})
        if(!user){
            return res.status(403).json({message:"Register yourself first",success:false})
        }
        const isPasswordEqual=await bycrypt.compare(password,user.password)
       if(!isPasswordEqual){
        return res.status(403).json({message:"Email or password is Wrong", success:false})
       }

       const jwtTokenn=jwtToken.sign(
        {email:user.email, _id:user._id},
        process.env.Secret_key,
        {expiresIn:"24h"}
    )



   return res.status(200).json(
        {
            message:"Login Successful",
            success:true,
             jwtTokenn,
             email,
             name:user.name
        }
    )


    }
   catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({message:"Internal Server Error", success:false, error: error.message});
}



}


module.exports={Login,SignUp}