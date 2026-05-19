// File: uploadMiddleware.js
// Description: Multer Upload Middleware: Manages incoming file multi-part streams, keeping uploaded photos safely in memory.

import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/',
        'video/',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'audio/',
        'text/plain'
    ];

    if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Supported: Images, Videos, PDFs, Docs, Audio, and Text.'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit for videos
    }
});
