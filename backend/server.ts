import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import errorHandler from "./middleware/errorHandler.ts"
import connectDB from './config/db.ts';
import authRoutes from "./routes/authRoutes.ts";
import documentRoutes from './routes/documentRoutes.ts';
import flashcardRoutes from './routes/flashcardsRoutes.ts';
import aiRoutes from './routes/aiRoutes.ts';
import quizRoutes from './routes/quizRoutes.ts';
import progressRoutes from './routes/progressRoutes.ts';
const app = express();
const PORT = process.env.PORT || 8000; 
console.log(PORT, 'PORT po')
// ES6 Modules fix __dirname alternative
import { fileURLToPath } from 'url';


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
    // origin: '*',
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);



// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    statusCode: 404
 });
});



app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.NODE_ENV} port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Logged Error: ${err}`);
//   app.close(() => process.exit(1));
});
