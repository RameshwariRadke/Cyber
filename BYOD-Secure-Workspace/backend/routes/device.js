const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const { getOSInfo, checkAntivirus } = require('../utils/systemCheck');
const { createSecureFolder, folderPath } = require('../utils/folderControl');

// ✅ Device check route
router.post('/check', (req, res) => {
  const osInfo = getOSInfo();

  checkAntivirus((status) => {
    const { isAntivirusRunning, productName } = status;

    if (!isAntivirusRunning) {
      return res.status(403).json({
        success: false,
        reason: 'No active antivirus found. Please enable an antivirus product.',
      });
    }

    createSecureFolder((err) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Failed to create secure folder' });
      }

      res.json({
        success: true,
        message: 'Device check passed. Secure folder created.',
        osInfo,
        antivirus: `Running (${productName})`,
        folder: folderPath,
      });
    });
  });
});

router.post('/perform-wipe', (req, res) => {
  const secureFolder = 'C:\\CyberSecure_Workspace';
  console.log(`Received wipe request for ${secureFolder}`); // 🔍 Debug log

  if (!fs.existsSync(secureFolder)) {
    console.warn('⚠️ Folder does not exist:', secureFolder);
    return res.status(404).json({ success: false, error: 'Secure folder not found' });
  }

  try {
    fs.rmSync(secureFolder, { recursive: true, force: true }); // Delete the folder
    console.log(`✅ Successfully deleted ${secureFolder}`);
    return res.status(200).json({ success: true, message: 'Wipe complete' });
  } catch (err) {
    console.error(`❌ Error wiping folder ${secureFolder}:`, err);
    return res.status(500).json({ success: false, error: 'Wipe failed' });
  }
});

module.exports = router;