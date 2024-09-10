import{ User} from "../model/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import  JsonWebToken  from "jsonwebtoken";
import jwt from "jsonwebtoken"
import  {sendVerificationEmail, welcomeEmail, resetpasswordlink, passwordResetSuccessfully } from "../mailtrap/verification.js"
import bcrypt from "bcryptjs/dist/bcrypt.js";

const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// generate acess and refresh token

const generateAccessAndRefreshToken = async(userId) => {
  try {
    let user = await User.findOne({ _id: userId });
    console.log(userId);
    
    
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    
    let accessToken = user.generateAccessToken();
    console.log("Access Token:", accessToken);
    
    let refreshToken = user.generateRefreshToken();
    console.log("Refresh Token:", refreshToken);
    
    // Store the refresh token in the user's document
    user.refreshToken = refreshToken;
    await user.save();
    
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Something went wrong when generating tokens");
  }
};






const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  
  try {
    if (!username) {
   res.send("username required")
    }
    if (!password) {
      throw new ApiError(400, "Password is required");
    }
    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new ApiError(400, "Email already exists");
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new ApiError(400, "Username already exists");
    }
    const  verificationcode = generateVerificationCode()
    const verificationcodeExpires = Date.now() + 3600000


    // Create a new user
    const user = await User.create({ 
      username,
       password, 
       email,
       verificationcode,
       verificationcodeExpires,

       });

    // Fetch the created user
    const newUser = await User.findById(user._id).select("-password -verificationcode");
    console.log(newUser);


   
    if (!newUser) {
       throw new ApiError(500, "User not registered");
    }
    await user.save()


// send verification email

const verifyEmail = await sendVerificationEmail(user.email, verificationcode)


    return res.status(200).json(new ApiResponse(200, "User successfully registered"));
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).send('Internal server error');
  }
};

const verifyEmail = async (req, res) => {
  const { code } = req.body;
  if(!code){
    throw new ApiError(401, "code not found")
  }
  try {
    let user = await User.findOne({
      verificationcode: code,
      verificationcodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error("Wrong or expired verification code");
    }

    user.isverifed = true;
    user.verificationcode = undefined;
    user.verificationcodeExpires = undefined;
    await user.save();

    await welcomeEmail(user.email, user.username);

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    console.log("Error in verifyEmail:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const loginUser = async(req,res) =>{
  let {username , email, password} = req.body;
  try{
  if(!username && !email){
    throw new ApiError(404, "please provide username or email")
  }
  let user = await User.findOne({
    $or: [
      { email },
      { username}
    ]
  });
  if(!user){
    throw new ApiError(402, "user not found")
  }

  let isPasswordCorrects = await user.isPasswordCorrect(password)

  if(!isPasswordCorrects){
    throw new ApiError("password incorrect")
  }
    
        
const options = {
  httpOnly: true,
  secure: true
}

// genrate acessa and refresh token

const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
console.log(accessToken, refreshToken);
console.log(req.cookies)

  res.status(200)
      .cookie("accessToken", accessToken, options )
      .cookie("refreshToken", refreshToken ,options)
      .json(new ApiResponse(200, "User successfully login"))
  
}catch(error){
  res.status(400)
  .json(new ApiResponse( 400, `user not successfully login : ${error.message}`))
}
}




const logoutUser = async (req, res) => {
  try {
    // Extract the token from cookies or headers
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    // Check if token is provided
    if (!token) {
      return res.status(400).json({ success: false, message: "Access token is required" });
    }

    // Verify and decode the access token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired access token" });
    }

    const userId = decoded._id;

    // Find the user by ID
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Invalidate the refresh token if it's stored in the user document
    user.refreshToken = undefined; // or set it to null or an empty string
    await user.save();

    // Clear the authentication cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({ success: true, message: "User successfully logged out" });
  } catch (error) {
    console.error("Error in logoutUser:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const forgotPassword = async(req, res) => {
  const {email} = req.body;
  try {
    if (!email) {
      throw new ApiError(404, "please provide the email");
    }

    let user = await User.findOne({email});
    if (!user) {
      throw new ApiError(402, "user not found");
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiresAt = resetTokenExpiresAt;
    await user.save();

    let  url = `${process.env.CLIENT_URL}/reset-url/${resetToken}`;
    await resetpasswordlink(email, url);

    res.status(200).json(new ApiResponse(200, "password reset link sent successfully"));
  } catch (error) {
    // Log the error for debugging
    console.error("Error in forgotPassword:", error);

    throw new ApiError(400, "password reset link sent failed");
  }
};



 const resertPassword = async(req, res) =>{
  let { token} = req.params;
  let {newPassword, confirmPassword} = req.body;
  try{

  let user = await User.findOne({resetToken:token})
  if(!user){
    throw new ApiError(402, "user not found")
  }
  if(!newPassword){
    throw new ApiError(402 ,"please enter new password")
  }
  if(!confirmPassword){
    throw new ApiError(402 ,"please enter old password")
  }

  const hashpassword = await bcrypt.hash(confirmPassword, 10)

  user.password = hashpassword
  user.resetToken = undefined
  user.resetTokenExpiresAt = undefined
  user.save()

  await passwordResetSuccessfully(user.email)
  res.status(200)
  .json(new ApiResponse(200,  "password reset successfully"))
}
catch(error){
  throw new ApiError(400, `reset unsucessfull ${error.message}`)

}


}

    



export { signup, 
         verifyEmail,
         loginUser,
         logoutUser,
         forgotPassword,
         resertPassword
        
 };