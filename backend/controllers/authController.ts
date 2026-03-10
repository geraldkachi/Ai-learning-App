import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
import User from "../models/User.ts";
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import protect from "../middleware/auth.ts";

const generateToken = (userId: string): string => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || '1h'
    })
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                error: user.email === email ? 'Email already exists' : 'Username already exists',
                statusCode: 400
            });
        }

        // Create new user
        user = new User({ username, email, password });
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true, token,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt,
                }, token
            },
            message: 'User registered successfully',
            statusCode: 201
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => { }

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation for updating user profile
}

// @desc Change user password
// @route PUT /api/auth/change-password
// @access Private
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation for changing user password
}