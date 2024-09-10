import { Router } from 'express';
import { signup, verifyEmail, loginUser,  logoutUser, forgotPassword,resertPassword  } from '../controllers/users.controller.js';
import { upload } from '../utils/multer.js';

let router = Router();

router.route('/signup').post(signup);
router.route('/verify-email').post(verifyEmail);
router.route("/login").post(loginUser)
router.route("/logout").get(logoutUser)
router.route("/forgot").post(forgotPassword)
router.route("/reset-password/:token").post(resertPassword)

export { router };
