// 📂 routes/upload.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); //  For encryption
const { scanFileForVirus } = require('../utils/virusScan'); //  Virus scan utility

const router = express.Router();

// ✅ Absolute upload directory
const uploadDir = 'C:/CyberSecure_Workspace';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Symmetric encryption config
const ENCRYPTION_KEY = crypto.createHash('sha256').update('byod-secret-key').digest();
const IV_LENGTH = 16;

function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  return Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
}

function decryptBuffer(buffer) {
  const iv = buffer.slice(0, IV_LENGTH);
  const encryptedText = buffer.slice(IV_LENGTH);
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  return Buffer.concat([decipher.update(encryptedText), decipher.final()]);
}

// ✅ Multer config for encrypted (memory)
const uploadEncrypted = multer({ storage: multer.memoryStorage() });

/**
 * @route POST /api/uploads
 * @desc Scan file for viruses, then encrypt and save file
 */
router.post('/', uploadEncrypted.single('file'), async (req, res) => {
  console.log('▶️ Incoming file upload', req.file); // Log the uploaded file

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    // ✅ Ensure temp_uploads exists
    const tempUploadDir = path.join(__dirname, '../temp_uploads');
    if (!fs.existsSync(tempUploadDir)) {
      fs.mkdirSync(tempUploadDir, { recursive: true });
    }

    const tempPath = path.join(tempUploadDir, req.file.originalname);

    // ✅ Write buffer to a temp file
    fs.writeFileSync(tempPath, req.file.buffer);

    // ✅ Scan file for viruses
    const isMalicious = await scanFileForVirus(tempPath);
    if (isMalicious) {
      // ✅ Remove temp file if exists
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      return res.status(400).json({ success: false, message: 'File contains a virus!' });
    }

    // ✅ Encrypt buffer and move to secure workspace
    const encryptedBuffer = encryptBuffer(req.file.buffer);
    const encryptedName = `${Date.now()}-${req.file.originalname}.enc`;
    const filePath = path.join(uploadDir, encryptedName);
    fs.writeFileSync(filePath, encryptedBuffer);

    // ✅ Remove temp file if exists
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    return res.status(200).json({ success: true, message: 'File uploaded and encrypted successfully!', file: encryptedName, path: filePath });

  } catch (err) {
    console.error('Error during file upload:', err);

    // ✅ Clean up temp file if exists
    if (req.file?.originalname) {
      const tempPath = path.join(__dirname, '../temp_uploads', req.file.originalname);
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }

    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

/**
 * @route GET /api/uploads
 * @desc List all encrypted files
 */
router.get('/', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to read upload directory' });

    const fileList = files.map((filename) => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        originalname: filename.split('-').slice(1).join('-'),
        size: stats.size,
        uploadedAt: stats.birthtime,
      };
    });

    res.json({ success: true, files: fileList });
  });
});

/**
 * @route GET /api/uploads/:filename
 * @desc Decrypt and serve file content
 */
router.get('/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  const isDownload = req.query.download === 'true'; // If the file is downloaded or not , use this from frontend

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to read file' });
    }

    try {
      const decrypted = decryptBuffer(data);
       const content = decrypted.toString('utf8'); 

      //  Scanning for sensitive terms
  const sensitiveWords = ['confidential', 'salary', 'aadhaar', 'pan', 'secret'];
  const found = sensitiveWords.find((word) => content.toLowerCase().includes(word));

   if (found) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    sensitive: true,
    message: `❗ This file contains sensitive data ("${found}") and cannot be previewed or downloaded.`,
  });
}

   //  Log the user activity , viewed or downloaded
             const logPath = path.join(__dirname, '../../folder-monitor/folder_log.csv');

          // Add CSV header if not exists
           if (!fs.existsSync(logPath)) {
              fs.writeFileSync(logPath, 'timestamp,action,filename\n');
               }

           const username = 'employee'; // hardcoded by Nikhil 
           const logEntry = `${new Date().toISOString()},${username},${isDownload ? 'Downloaded' : 'Viewed'},${req.params.filename}\n`;
           fs.appendFile(logPath, logEntry, () => {});


      // Set response
        if (isDownload) {
            res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename.replace('.enc', '')}"`);
           return res.send(decrypted); // Send and exit
        } else {
             res.setHeader('Content-Type', 'text/plain');
             return res.send(decrypted); // For preview
          }

    } catch (e) {
      res.status(500).json({ success: false, message: 'Decryption failed' });
    }
  });
});

/**
 * @route DELETE /api/uploads/:filename
 * @desc Delete a file
 */
router.delete('/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found' });

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Delete failed', error: err.message });

    res.json({ success: true, message: 'File deleted' });
  });
});

module.exports = router;