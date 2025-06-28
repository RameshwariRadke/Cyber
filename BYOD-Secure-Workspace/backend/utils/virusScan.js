const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data'); // ✅ node's FormData
require('dotenv').config();

const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY;

if (!VT_API_KEY) {
  throw new Error('❌ Missing VIRUSTOTAL_API_KEY in .env file.');
}

async function scanFileForVirus(filePath) {
  try {
    // ✅ Read file
    const fileData = fs.readFileSync(filePath);
    const formData = new FormData();
    formData.append('file', fileData, {
      filename: filePath, // optional
    });

    // ✅ Upload file to VT
    const uploadRes = await axios.post(
      'https://www.virustotal.com/api/v3/files',
      formData,
      { headers: { 'x-apikey': VT_API_KEY, ...formData.getHeaders() } }
    );

    const analysisId = uploadRes.data.data.id;
    console.log(`✅ Uploaded to VirusTotal. Analysis ID: ${analysisId}`);

    // ✅ Poll the analysis report
    let report;
    let attempts = 0;
    do {
      await new Promise((r) => setTimeout(r, 5000));
      report = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        { headers: { 'x-apikey': VT_API_KEY } }
      );
      attempts++;
    } while (report.data.data.attributes.status === 'queued' && attempts < 10);

    // ✅ Check report
    const stats = report.data.data.attributes.stats;
    console.log('🔍 Scan report:', stats);

    return stats.malicious > 0 || stats.suspicious > 0;
  } catch (error) {
    console.error('❌ Error scanning file with VT:', error.message || error);
    return false;
  }
}

module.exports = { scanFileForVirus };
