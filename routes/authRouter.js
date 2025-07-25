const router=require("express").Router()
const {signupValidation,loginValidation}= require("../middleware/authValidation")
const {Login,SignUp} = require("../controller/authController")

router.post("/signup",signupValidation,SignUp)
router.post("/login",loginValidation,Login)

module.exports=router