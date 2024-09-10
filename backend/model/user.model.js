import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Automatically convert email to lowercase
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum length for passwords
  },
  photo: {
    type: String, // URL or path to the user's photo
  },
  username: {
    type: String,
    required: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now, // Default to the current date and time
  },
  isverifed : {
    type:Boolean,
    default:false
  },
  resetToken: {
    type: String, // Token for password reset
  },
  resetTokenExpiresAt: {
    type: Date, // Expiry date for the password reset token
  },
  verificationcode: {
    type: String, // Token for email verification
  },
  verificationcodeExpires: {
    type: Date, // Expiry date for the verification token
  },
  refreshToken: {
    type:String
  }
});



userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
      this.password = await bcrypt.hash(this.password, 10);
      next();
  } catch (err) {
      next(err);
  }
});


userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
// generate acess token

userSchema.methods.generateAccessToken = function() {
  const user = this;
  const accessToken = jwt.sign(
    { _id: user._id.toString(), username: user.username, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }  // Access token expires in 1 hour
  );
  return accessToken;
};

// Method to generate a refresh token
userSchema.methods.generateRefreshToken = function() {
  const user = this;
  const refreshToken = jwt.sign(
    { _id: user._id.toString() },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }  // Refresh token expires in 7 days
  );
  return refreshToken;
};

// Create and export the model
const User = mongoose.model('User', userSchema);
export {User};
