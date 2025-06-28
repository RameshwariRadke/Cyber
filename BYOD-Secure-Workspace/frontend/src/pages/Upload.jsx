import axios from 'axios';
import { useRef, useState } from 'react';
import './Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setStatus('');
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('❗ Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setStatus('🔍 Scanning for viruses...'); // Show scanning message

      const res = await axios.post('http://localhost:5000/api/upload', formData);

      if (res.data.success) {
        setStatus(`✅ File uploaded: ${res.data.filename}`);
        setFile(null);
        fileInputRef.current.value = '';
      } else {
        setStatus('❌ Upload failed.');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Server error during upload.');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="upload-container dark">
      <div className="upload-card">
        <div className="upload-icon">
          <img
            src="https://cdn-icons-png.flaticon.com/512/7249/7249198.png"
            alt="Upload"
          />
        </div>
        <h2 className="upload-title">Upload Your File</h2>
        <p className="upload-subtitle">Only secure work files are allowed.</p>

        <input
          type="file"
          onChange={handleChange}
          ref={fileInputRef}
          className="upload-hidden-input"
        />

        <button className="select-file-button" onClick={triggerFileInput}>
          📁 Select File
        </button>

        {file && <p className="file-name">Selected: {file.name}</p>}

        <button className="upload-button" onClick={handleUpload} disabled={!file}>
          🚀 Upload File
        </button>

        {status && (
          <p className={`upload-status ${status.startsWith('✅') ? 'success' : 'error'}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default Upload;
