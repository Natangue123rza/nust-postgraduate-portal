// backend/routes/uploads.js
const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')

// Configure where files are stored and how they are named
const storage = multer.diskStorage({

  // Save files to backend/uploads folder
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },

  // Give each file a unique name
  // Format: timestamp-originalname
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }

})

// Only allow PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are allowed'), false)
  }
}

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
})

// POST /api/uploads/file
// Handle single file upload
router.post('/file', upload.single('file'), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  // Return the saved filename
  res.json({
    message: 'File uploaded successfully',
    fileName: req.file.filename,
    originalName: req.file.originalname
  })

})

// GET /api/uploads/:filename
// Serve a file for viewing/downloading
router.get('/:filename', (req, res) => {
  const { filename } = req.params
  const filePath = path.join(__dirname, '../uploads/', filename)
  res.sendFile(filePath)
})

module.exports = router