import jwt, { type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";
// import bcrypt from "bcryptjs";
import User from "../models/User.ts";
import express from 'express';
import type { Request, Response, NextFunction } from 'express';

const generateToken = (id: string): string => {
    const secret: Secret = process.env.JWT_SECRET as Secret;
    const options: SignOptions = {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    };

    return jwt.sign({ id }, secret, options);
}

// controllers/authController.ts
export const register = async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: existingUser.email === email ? 'Email already exists' : 'Username already exists',
                statusCode: 400
            });
        }

        // Create new user
        const user = new User({ 
            username, 
            email, 
            password  // Password will be hashed by the pre-save middleware
        });
        
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id.toString());

        res.status(201).json({
            success: true, 
            token,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt,
                }
            },
            message: 'User registered successfully',
            statusCode: 201
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Server error',
            statusCode: 500 
        });
        // next(error);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false, 
                error: 'Please provide email and password',
                statusCode: 400
             });
        } 
        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
       
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials',
                statusCode: 401
             });
        }
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid credentials',
                statusCode: 400
             });
        }

        // Check password
        const isMatch = await (user as any).matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid credentials',
                statusCode: 400
             });
        }

        // Generate JWT token
        const token = generateToken(user._id);
        res.json({
            success: true, 
            token,
            // data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt,
                },
                //  token,
            // },
            message: 'User logged in successfully',
            statusCode: 200
        });
        
    } catch (error) {
        next(error);    
    }
 }

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found', 
                statusCode: 404
             });
        }
        // res.json({ success: true, data: user });
        res.json({
            success: true,
            data: {
                id: user._id,
                username: user.username, 
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.createdAt,
             },
             message: 'User profile retrieved successfully', 
             statusCode: 200    
         });
    } catch (error) {
        console.error('Get profile error:', error);
        next(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
}

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation for updating user profile
    const { username, email, profileImage } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found', 
                statusCode: 404
             });
        }

        // Update fields if provided
        if (username) user.username = username;
        if (email) user.email = email;
        if (profileImage) user.profileImage = profileImage;

        await user.save();

        res.json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
             },
             message: 'User profile updated successfully',
             statusCode: 200    
         });
    } catch (error) {
        console.error('Update profile error:', error);
        next(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
}

// @desc Change user password
// @route PUT /api/auth/change-password
// @access Private
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation for changing user password
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
            success: false, 
            error: 'Please provide current and new password', 
            statusCode: 400 
        });
    }

    try {
        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found', 
                statusCode: 404 
            });
        }

        // Check current password
        const isMatch = await (user as any).matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                error: 'Current password is incorrect',
                statusCode: 400 
            });
        }

        // Update to new password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully',
            statusCode: 200    
         });
    } catch (error) {
        console.error('Change password error:', error);
        next(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
}