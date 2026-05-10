import jwt, { type JwtPayload } from 'jsonwebtoken';
import User from '../models/User.ts';
import type { Request, Response, NextFunction } from "express"

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
            
            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authorized, user not found',
                    statusCode: 401
                });
            }
            
            next();
        } catch (error: any) {
            console.error('Token verification error:', error.name, error.message);
            
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token has expired',
                    statusCode: 401,
                    needRefresh: true // Add this flag to indicate token needs refresh
                });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token',
                    statusCode: 401
                });
            } else {
                return res.status(401).json({
                    success: false,
                    error: 'Not authorized',
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