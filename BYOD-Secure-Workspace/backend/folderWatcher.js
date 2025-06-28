// folderWatcher.js
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

// The secure folder
const secureFolder = 'C:\\CyberSecure_Workspace';

let copyAttemptTime = null;

function initFolderWatcher(wipeCallback) {
  const watcher = chokidar.watch(secureFolder, { persistent: true });

  watcher.on('readable', (pathRead) => {
    const now = Date.now();
    if (copyAttemptTime && now - copyAttemptTime < 20000) {
      console.warn('⚠️ Second suspicious read detected within 20s — triggering wipe...');
      wipeCallback();
    } else {
      copyAttemptTime = now;
      console.warn('⚠️ Warning: File read access detected — first attempt.');
    }
  });

  watcher.on('error', (error) => console.error('Watcher error:', error));
}

module.exports = initFolderWatcher;
