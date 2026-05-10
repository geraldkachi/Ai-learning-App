import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from 'fs';
import type { Request } from 'express';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadDir = path.join(__dirname, '../upload/documents');
if(!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

// configure storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) { 
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
})

// file filter - only pdf
// const fileFilter = (req: any, file: any, cb: any) => {
//     // const allowedTypes = ['application/pdf'];
//     // if (!allowedTypes.includes(file.mimetype)) {
//     //     return cb(new Error('Only PDF files are allowed'));
//     // }
//     if (file.mimetype === 'application/pdf') {
//         cb(null, true);
//     } else {
//         cb(new Error('Only PDF files are allowed'), false);
//     }
//     cb(null, true);
// }

// FIXED: Proper file filter - only PDF
// const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//     // Check if file is PDF
//     if (file.mimetype === 'application/pdf') {
//         // Accept the file
//         cb(null, true);
//     } else {
//         // Reject the file with error
//         cb(new Error('Only PDF files are allowed'));
//     }
//     // ❌ REMOVED the extra cb(null, true) that was causing the issue
// }
// Even more robust version with multiple checks
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Log what's being uploaded for debugging
    console.log('File upload attempt:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });
    
    // Check MIME type
    const allowedMimeTypes = ['application/pdf', 'application/octet-stream'];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF files are allowed.`));
    }
    
    // Check file extension as backup validation
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
        return cb(new Error(`Invalid file extension: ${ext}. Only .pdf files are allowed.`));
    }
    
    // If all checks pass, accept the file
    cb(null, true);
}

// configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
        //  fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: fileFilter

})

export default upload