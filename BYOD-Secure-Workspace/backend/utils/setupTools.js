// backend/utils/setupTools.js
const fs = require('fs');
const path = require('path');

async function setupToolsForEmployee(employeeID) {
  const companyToolsPath = 'C:\\Company_Tools';
  const employeeToolsPath = path.join('C:\\CyberSecure_Workspace', employeeID, 'tools');

  // ✅ Check companyToolsPath exists
  if (!fs.existsSync(companyToolsPath)) {
    throw new Error(`Company_Tools path does not exist: ${companyToolsPath}`);
  }

  // ✅ Ensure destination path exists
  fs.mkdirSync(employeeToolsPath, { recursive: true });

  // ✅ List files in companyToolsPath
  const files = fs.readdirSync(companyToolsPath);
  if (files.length === 0) {
    throw new Error(`Company_Tools folder is empty.`);
  }

  let copiedCount = 0;
  for (const file of files) {
    const srcFile = path.join(companyToolsPath, file);
    const destFile = path.join(employeeToolsPath, file);

    // ✅ Debug log
    console.log(`Copying ${srcFile} to ${destFile}...`);

    fs.copyFileSync(srcFile, destFile);
    copiedCount++;
  }

  return { success: true, toolsCopied: copiedCount, destPath: employeeToolsPath };
}

module.exports = { setupToolsForEmployee };
