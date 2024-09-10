import { User } from "./backend/model/user.model";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    let user = await User.findOne({ _id: userId });
    console.log(userId);
    
    
    if (!user) {
     
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
    
  }
};

let a  = generateAccessAndRefreshToken("66dd2e914732399eb14b8b57")



let a  = generateAccessAndRefreshToken(2144849)

