import multer from "multer";

const storage = multer.memoryStorage();

// File filter to accept only PDF files
const fileFilter = (req, file, cb) => {
    console.log("File being uploaded:", file);
    
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

export const singleUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
}).single("file");