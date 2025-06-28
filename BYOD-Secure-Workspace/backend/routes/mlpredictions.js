const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const router = express.Router();
const PREDICTIONS_PATH = path.join(__dirname, '../../folder-monitor/ml/ueba_predictions.csv');

function generateExplanation(row) {
  const hour = parseInt(row.hour);
  const role = row.role;
  const filename = row.filename.toLowerCase();
  const location = row.location;

  // Explanations based on multiple features
  if (role === 'intern' && filename.includes('confidential')) {
    return `🚨 Intern "${row.username}" tried to access a confidential file: "${row.filename}".`;
  } else if (hour < 6 || hour > 20) {
    return `🌙 Unusual login time by ${row.username} at ${hour}:00 hours.`;
  } else if (location.startsWith('203.') || location.startsWith('103.')) {
    return `🌐 Access by ${row.username} from unusual location/IP: ${location}`;
  } else if (row.action === 'Deleted') {
    return `⚠ ${row.username} deleted a file unusually: "${row.filename}"`;
  } else if (row.action === 'Downloaded' && filename.includes('salary')) {
    return `📥 ${row.username} downloaded sensitive file "${row.filename}";`
  } else {
    return `🔍 Anomalous behavior by ${row.username} on file "${row.filename}";`
  }
}

router.get('/', (req, res) => {
  const predictions = [];
 
    
  fs.createReadStream(PREDICTIONS_PATH)
    .pipe(csv())
    .on('data', (row) => {
      if (parseInt(row.anomaly) === -1) {
        row.explanation = generateExplanation(row); // Add sentence
        predictions.push(row);
      }
    })
    .on('end', () => {
       console.log(`✅ ML predictions loaded. Anomalies found: ${predictions.length}`);
        const locationAnomalies = predictions.filter(p => p.explanation.includes('unusual location/IP'));
  const otherAnomalies = predictions.filter(p => !p.explanation.includes('unusual location/IP'));
  const sorted = [...locationAnomalies, ...otherAnomalies];
         res.json({ success: true, anomalies: sorted.slice(0, 10) }); // Show top 10
   })
    .on('error', (err) => {
      res.status(500).json({ success: false, message: 'Error reading ML predictions.' });
    });
});

module.exports = router;