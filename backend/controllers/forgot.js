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
  
      const url = `${process.env.CLIENT_URL}/reset-url/${resetToken}`;
      await resetpasswordlink(email, url);
  
      res.status(200).json(new ApiResponse(200, "password reset link sent successfully"));
    } catch (error) {
      // Log the error for debugging
      console.error("Error in forgotPassword:", error);
  
      throw new ApiError(400, "password reset link sent failed");
    }
  };
  