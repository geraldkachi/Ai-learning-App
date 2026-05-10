import express from "express";
import { body } from "express-validator";
import { login, register, getProfile, updateProfile, changePassword } from "../controllers/authController.ts";
import protect from "../middleware/auth.ts";

const router = express.Router();

const registerValidate = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long') 
];

const loginValidate = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').exists().withMessage('Password is required')
];

// CORRECT ROUTES - Your original had wrong methods!
router.post('/register', registerValidate, register);
router.post('/login', loginValidate, login);

// Protected routes - FIXED: Changed GET to PUT for update, and POST for password change
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);  // Changed from GET to PUT
router.post('/change-password', protect, changePassword);  // Changed from GET to POST

export default router;