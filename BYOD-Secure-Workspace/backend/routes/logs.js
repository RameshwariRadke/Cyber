const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const router = express.Router();
const LOG_FILE_PATH = path.join(__dirname, '../../folder-monitor/folder_log.csv');

router.get('/', (req, res) => {
  const logs = [];

  fs.createReadStream(LOG_FILE_PATH)
    .pipe(csv())
    
      .on('data', (data) => {
        if (data.timestamp && data.action && data.filename) {
        logs.push(data);
       }
      })

       .on('end', () => {
  const formattedLogs = logs
    .reverse()
    .map(log => `[${log.timestamp}] ${log.action}: ${log.filename}`);
    
  res.json({ success: true, logs: formattedLogs });
    })
    .on('error', (err) => {
      res.status(500).json({ success: false, message: 'Error reading log file.' });
    });
});

module.exports = router;