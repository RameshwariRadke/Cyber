const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const router = express.Router();

const ALERT_FILE_PATH = path.join(__dirname, '../../folder-monitor/ueba_alerts.csv');

router.get('/', (req, res) => {
  const alerts = [];

  // If the file doesn't exist, return empty array
  if (!fs.existsSync(ALERT_FILE_PATH)) {
    return res.json({ success: true, alerts: [] });
  }

  fs.createReadStream(ALERT_FILE_PATH)
    .pipe(csv())
    .on('data', (row) => alerts.push(row))
    .on('end', () => {
      // Most recent alerts first
      res.json({ success: true, alerts: alerts.reverse() });
    })
    .on('error', (err) => {
      res.status(500).json({ success: false, message: 'Error reading alerts file.' });
    });
});

module.exports = router;