import type { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    statusCode?: number;
    code?: number | string;
    name: string;
    message: string;
    stack?: string;
    keyValue?: Record<string, any>;
    errors?: Record<string, { message: string }>;
}

interface ErrorResponse {
    success: boolean;
    error: string;
    statusCode: number;
    stack?: string;
}

const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode: number = err.statusCode || 500;
    let message: string = err.message || 'Server Error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        message = 'Resource not found';
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError' && err.errors) {
        const errorMessages = Object.values(err.errors).map((val: any) => val.message);
        message = errorMessages.join(', ');
        statusCode = 400;
    }

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File size exceeds the maximum limit of 10MB';
        statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        statusCode = 401;
    }
    
    if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
        statusCode = 401;
    }

    // Log error details
    console.error(`[Error] ${statusCode}: ${message}`, {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Prepare response
    const errorResponse: ErrorResponse = {
        success: false,
        error: message,
        statusCode,
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };

    // Add stack trace in development only
    if (process.env.NODE_ENV === 'development' && err.stack) {
        errorResponse.stack = err.stack;
    }

    // Send response
    res.status(statusCode).json(errorResponse);
};

export default errorHandler;
