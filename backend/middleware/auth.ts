import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { stat } from 'node:fs';
import type { Request, Response, NextFunction } from "express"


const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authorized, user not found',
                    statusCode: 401
                });
            }
            next();
        } catch (error) {
            console.error('Token extraction error:', error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token has expired',
                    statusCode: 401
                });
            } else {
                return res.status(401).json({
                    success: false,
                    error: 'Not authorized, token failed',
                    statusCode: 401
                });
            }
        }
    }


    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized, no token',
            statusCode: 401
        });
    }

}
export default protect; 