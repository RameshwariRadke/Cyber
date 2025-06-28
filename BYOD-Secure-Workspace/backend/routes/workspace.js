// routes/workspace.js
const express = require('express');
// ✅ Updated path to setupTools.js
const { setupToolsForEmployee } = require('../utils/setUpTools'); 

const router = express.Router();

router.post('/setup', async (req, res) => {
  const { employeeID } = req.body; // sent from frontend after login
  if (!employeeID) return res.status(400).json({ success: false, message: 'No employee ID' });

  try {
    const result = await setupToolsForEmployee(employeeID); // <- Called here
    res.status(200).json(result); // e.g. { success: true, toolsCopied: 10, destPath: ... }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
