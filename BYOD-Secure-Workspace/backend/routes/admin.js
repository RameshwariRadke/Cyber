// routes/admin.js
const express = require('express');
const router = express.Router();

let wipeRequested = false;

router.post('/wipe-request', (req, res) => {
  wipeRequested = true;
  console.log('📢 Wipe request triggered by admin');
  return res.status(200).json({ success: true, message: 'Wipe requested' });
});

router.get('/wipe-status', (req, res) => {
  return res.status(200).json({ wipeRequested });
});

router.post('/wipe-reset', (req, res) => {
  wipeRequested = false;
  return res.status(200).json({ success: true, message: 'Wipe status reset' });
});


// ✅ NEW: Secure file upload section
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { scanFileForVirus } = require('../utils/virusScan'); // your scan utility

const tempUploadPath = path.join(__dirname, '../temp_uploads');

// Ensure temp_uploads exists
if (!fs.existsSync(tempUploadPath)) {
  fs.mkdirSync(tempUploadPath, { recursive: true });
}

// Use multer to handle incoming file as buffer
const upload = multer({ dest: tempUploadPath });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;

    // ✅ Scan file for viruses
    const infected = await scanFileForVirus(filePath);
    if (infected) {
      fs.unlinkSync(filePath); // delete temp file
      return res.status(400).json({ success: false, message: 'File contains a virus!' });
    }

    // ✅ Move file to your secure workspace
    const destination = path.join('C:/CyberSecure_Workspace', req.file.originalname);
    fs.renameSync(filePath, destination);

    return res.status(200).json({ success: true, message: 'File uploaded securely!' });
  } catch (err) {
    console.error('Error uploading file:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
