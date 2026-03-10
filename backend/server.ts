import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import errorHandler from "./middleware/errorHandler.ts"
import mongoose from 'mongoose';
import connectDB from './config/db.ts';
import authRoutes from "./routes/authRoutes.ts";

const app = express();
const PORT = process.env.PORT || 5000;



// ES6 Modules fix __dirname alternative
import { fileURLToPath } from 'url';
import { stat } from 'fs';
import { error } from 'console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// connectDB()
try {
    connectDB();
    console.log('Database connected successfully');
} catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));

// Routes

app.use(errorHandler);
// import authRoutes from './routes/authRoutes.js';
// import documentRoutes from './routes/documentRoutes.js';
// import flashcardRoutes from './routes/flashcardRoutes.js';
// import quizRoutes from './routes/quizRoutes.js';

app.use('/api/auth', authRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/flashcards', flashcardRoutes);
// app.use('/api/quizzes', quizRoutes);


// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    statusCode: 404
 });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.NODE_ENV} port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Logged Error: ${err}`);
//   app.close(() => process.exit(1));
});

// Error handler middleware
// function errorHandler(err, req, res, next) {
//   console.error(err.stack);
//   res.status(500).json({ 
//     success: false,
//     message: 'Server Error',
//     statusCode: 500
//  });
// }

// Database connection