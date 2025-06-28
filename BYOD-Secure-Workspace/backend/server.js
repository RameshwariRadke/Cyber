// 📂 backend/server.js
require('dotenv').config(); //  Load environment variables
const express = require('express');
const cors = require('cors');
const fs = require('fs'); //  Added
const initFolderWatcher = require('./folderWatcher');

//  Import routes
const deviceRoutes = require('./routes/device'); 
const adminRoutes = require('./routes/admin');   
const logsRoutes = require('./routes/logs');     
const uploadRoutes = require('./routes/upload'); 
const workspaceRoutes = require('./routes/workspace');

//Nikhil 
const uebaRoutes = require('./routes/ueba');

//  Import suspiciousStatus object
const { suspiciousStatus } = require('./folderWatcher');

const app = express();
const PORT = 5000;

//  Middleware
app.use(cors());
app.use(express.json()); // 

//  Mount routes
app.use('/api/device', deviceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/workspace', workspaceRoutes); 

//nikhil
app.use('/api/ueba-alerts', uebaRoutes); 
app.use('/api/mlpredictions', require('./routes/mlpredictions'));

// ✅ API to check device status
app.get('/api/device/status', (req, res) => {
  res.json(suspiciousStatus);
});

// ✅ Folder watcher init — includes wipe on suspicious activity
initFolderWatcher(() => {
  const secureFolder = 'C:\\CyberSecure_Workspace';
  if (fs.existsSync(secureFolder)) {
    fs.rmSync(secureFolder, { recursive: true, force: true });
    console.log(`✅ Wiped ${secureFolder} due to suspicious file copy activity.`);
  }
});

//  Server start
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
