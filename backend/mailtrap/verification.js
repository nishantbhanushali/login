import { MailtrapClient } from "mailtrap"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import {client} from "../mailtrap/config.js"
import {sender} from "../mailtrap/config.js"
import {VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE} from "../mailtrap/emailtemplate.js"


export const sendVerificationEmail = async(email, verificationToken) =>{
    const recipient = [{email}]
    try {
		const response = await client.send({
			from: sender,
			to: recipient,
			subject: "Verify your email",
			html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
			category: "Email Verification",
            
		})
        new ApiResponse(200, "Email send for verify")
    }
    catch(error){
        throw new ApiError(402,`Error sending verification email : ${error} ` )

        
    }
}

export const welcomeEmail = async(email, username) =>{
    const recipient = [{email}]
    try {
		const response = await client.send({
			from: sender,
			to: recipient,
            template_uuid: "db19a9d3-730b-4992-b011-e89cdc300629",
    template_variables: {
      "name": username,
      "company_info_name":" Volaire",
      "company_info_address": "sakinaka",
      "company_info_city": "Mumbai",
      "company_info_zip_code": 400072,
      "company_info_country": "India"
    }

})
        new ApiResponse(200, "welcome email send successfully")
    }
    catch(error){
        throw new ApiError(402,`Error sending welcome email : ${error} ` )

        
    }
}
    

export const resetpasswordlink = async(email, url) =>{
    const recipient = [{email}];
    try {
      const response = await client.send({
        from: sender,
        to: recipient,
        subject: "password reset link",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", url),
        category: "password reset",
      });
      console.log("Email sent response:", response); // Log response
      return new ApiResponse(200, "Email sent for password reset");
    } catch (error) {
      console.error("Error in resetpasswordlink:", error);
      throw new ApiError(402, `password reset failed: ${error.message}`);
    }
  };
  
export const passwordResetSuccessfully = async(email) =>{
    const recipient = [{email}];
    try {
      const response = await client.send({
        from: sender,
        to: recipient,
        subject: "password reset sucessfully",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        category: "password reset",
      });
      console.log("Email sent response:", response); // Log response
      return new ApiResponse(200, "password reset successfully");
    } catch (error) {
      console.error("Error in resetpasswordlink:", error);
      throw new ApiError(402, `password reset failed: ${error.message}`);
    }
  };

