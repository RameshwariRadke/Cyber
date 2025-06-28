import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './EmployeePage.css';

const EmployeePage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [warningIssued, setWarningIssued] = useState(false);
  const [wipeTriggered, setWipeTriggered] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showFileManager, setShowFileManager] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [statusError, setStatusError] = useState('');
  const fileInputRef = useRef(null);
  const countdownRef = useRef(null);

  const recentActivities = [
    { action: 'Uploaded Q2 report.pdf', time: '9:00 AM', status: '✅ Completed' },
    { action: 'Meeting with manager at 3 PM', time: '10:00 AM', status: '📌 Scheduled' },
    { action: 'Submitted weekly timesheet', time: '11:00 AM', status: '✅ Completed' },
  ];

  const profileData = {
    name: "John Doe",
    employeeId: "EMP12345",
    department: "Engineering",
    position: "Senior Developer",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    joinDate: "January 15, 2020",
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
    profilePic: "https://i.pravatar.cc/150?img=3"
  };

  // Security restrictions
  useEffect(() => {
    const blockActions = (e) => e.preventDefault();
    document.addEventListener("copy", blockActions);
    document.addEventListener("cut", blockActions);
    document.addEventListener("paste", blockActions);
    document.addEventListener("contextmenu", blockActions);

    const handlePrint = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        alert("🛑 Printing is disabled in secure workspace.");
      }
    };

    const detectScreenshot = (e) => {
      if (e.key === "PrintScreen") {
        alert("📸 Screenshot attempt detected and blocked!");
      }
    };

    window.addEventListener("keydown", handlePrint);
    window.addEventListener("keyup", detectScreenshot);

    return () => {
      document.removeEventListener("copy", blockActions);
      document.removeEventListener("cut", blockActions);
      document.removeEventListener("paste", blockActions);
      document.removeEventListener("contextmenu", blockActions);
      window.removeEventListener("keydown", handlePrint);
      window.removeEventListener("keyup", detectScreenshot);
    };
  }, []);

  // Device status monitoring with robust error handling
  // useEffect(() => {
  //   const checkDeviceStatus = async () => {
  //     try {
  //       const resp = await fetch('http://localhost:5000/api/device/status');
        
  //       if (resp.status === 204) { // No Content
  //         setStatusError('');
  //         setWarningIssued(false);
  //         setWipeTriggered(false);
  //         return;
  //       }

  //       if (!resp.ok) {
  //         throw new Error(`Server returned ${resp.status}`);
  //       }

  //       const contentType = resp.headers.get('content-type');
  //       if (!contentType || !contentType.includes('application/json')) {
  //         throw new Error('Invalid content type');
  //       }

  //       const data = await resp.json();
  //       if (!data) {
  //         throw new Error('Empty response data');
  //       }

  //       setStatusError('');
  //       setWarningIssued(data.warningIssued || false);
  //       setWipeTriggered(data.wipeTriggered || false);

  //       if (data.warningIssued && !data.wipeTriggered && countdown === 10) {
  //         startCountdown();
  //       }
  //     } catch (e) {
  //       console.error('Device status check failed:', e.message);
  //       setStatusError('Status update unavailable - working offline');
  //       setWarningIssued(false);
  //       setWipeTriggered(false);
  //     }
  //   };

  //   const intervalId = setInterval(checkDeviceStatus, 3000);
  //   checkDeviceStatus(); // Initial check

  //   return () => clearInterval(intervalId);
  // }, [countdown]);

  // const startCountdown = () => {
  //   if (countdownRef.current) return;
  //   countdownRef.current = setInterval(() => {
  //     setCountdown((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(countdownRef.current);
  //         countdownRef.current = null;
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);
  // };

  useEffect(() => {
    if (wipeTriggered && countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
      setCountdown(0);
    }
  }, [wipeTriggered]);

  // Fetch files on load
  // useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/upload');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setFiles(data.files || []);
        setLoading(false);
      } catch (error) {
        setError('Could not load files. Please try again later.');
        setLoading(false);
      }
    };
    useEffect(() => {
    fetchFiles();
  }, []);


  // }, []);

  const handleFileSelect = async (filename) => {
    setSelectedFile(filename);
    setFileContent('Loading file...');

    try {
      const res = await fetch(`http://localhost:5000/api/upload/${filename}`);
      const contentType = res.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        setFileContent(json.sensitive ? '❗ Confidential file' : json.message || '⚠ Unknown response');
      } else {
        setFileContent(await res.text());
      }
    } catch (error) {
      setFileContent('Error loading file content');
    }
  };

    // ✅ Added download logic with scanning detection from previous code
  const handleDownload = async () => {
    if (!selectedFile) return;

    setScanning(true);

    // 🛠 Force a tiny delay to allow UI to update and show popup
  await new Promise((resolve) => setTimeout(resolve, 50));

    const start = Date.now();

    try {
      const res = await fetch(`http://localhost:5000/api/upload/${selectedFile}?download=true`);
      const elapsed = Date.now() - start;
      const waitTime = Math.max(1500 - elapsed, 0);
      const contentType = res.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();

        if (json.sensitive === true) {
          setTimeout(() => {
            setScanning(false);
            alert('❗ This file contains confidential data and cannot be downloaded.');
          }, waitTime);
          return;
        }

        setTimeout(() => {
          setScanning(false);
          alert(json.message || 'Download blocked by system.');
        }, waitTime);
        return;
      }

      const blob = await res.blob();
      setTimeout(() => {
        setScanning(false);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = selectedFile.replace('.enc', '');
        link.click();
      }, waitTime);
    } catch (err) {
      const elapsed = Date.now() - start;
      const waitTime = Math.max(1500 - elapsed, 0);

      setTimeout(() => {
        setScanning(false);
        alert('Something went wrong during download.');
      }, waitTime);
    }
  };
  //added till here

  
  const handleBackToFiles = () => {
    setSelectedFile(null);
  };

  const handleBackToDashboard = () => {
    setShowProfile(false);
    setShowFileManager(false);
    setShowUploadSection(false);
    setSelectedFile(null);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setShowFileManager(false);
    setShowUploadSection(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
    setUploadStatus('');
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadStatus('❗ Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      setUploadStatus('🔍 Scanning for viruses...');
      setLoading(true);

      const res = await axios.post('http://localhost:5000/api/upload', formData);

      if (res.data.success) {
        setUploadStatus(`✅ File uploaded: ${res.data.filename}`);
        await fetchFiles();
        setUploadFile(null);
        setShowUploadSection(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setUploadStatus('❌ Upload failed.');
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('❌ Server error during upload.');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUploadWorkClick = () => {
    setShowFileManager(true);
    setShowUploadSection(true);
    setShowProfile(false);
    setSelectedFile(null);
  };

  const handleWorkspaceFilesClick = () => {
    setShowFileManager(true);
    setShowUploadSection(false);
    setShowProfile(false);
    setSelectedFile(null);
  };

  return (
    <div className={`employee-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="sidebar">
        <div>
          <h2 className="logo">BYOD</h2>
          <ul className="sidebar-menu">
            <li 
              className={`menu-item ${!showProfile && !showFileManager ? 'active' : ''}`}
              onClick={handleBackToDashboard}
            >
              🏠 Dashboard
            </li>
            <li 
              className={`menu-item ${showProfile ? 'active' : ''}`}
              onClick={handleProfileClick}
            >
              👤 Profile
            </li>
            <li className="menu-item">📊 Performance</li>
            <li 
              className={`menu-item ${showUploadSection ? 'active' : ''}`}
              onClick={handleUploadWorkClick}
            >
              📤 Upload Your Work
            </li>
            <li 
              className={`menu-item ${showFileManager && !showUploadSection ? 'active' : ''}`}
              onClick={handleWorkspaceFilesClick}
            >
              📁 Workspace Files
            </li>
            <li className="menu-item logout">🚪 Logout</li>
          </ul>
        </div>
        <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="dashboard-content">
        {showProfile ? (
          <div className="profile-view">
            <div className="profile-header">
              <button className="back-button" onClick={handleBackToDashboard}>
                ← Back to Dashboard
              </button>
              <h2>Employee Profile</h2>
            </div>
            
            <div className="profile-card">
              <div className="profile-picture-container">
                <img src={profileData.profilePic} alt="Profile" className="profile-picture" />
              </div>
              
              <div className="profile-info">
                <h3>{profileData.name}</h3>
                <p><strong>Employee ID:</strong> {profileData.employeeId}</p>
                <p><strong>Department:</strong> {profileData.department}</p>
                <p><strong>Position:</strong> {profileData.position}</p>
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Phone:</strong> {profileData.phone}</p>
                <p><strong>Join Date:</strong> {profileData.joinDate}</p>
                
                <div className="profile-skills">
                  <h4>Skills</h4>
                  <div className="skills-container">
                    {profileData.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : showFileManager ? (
          showUploadSection ? (
            <div className="upload-section">
              <div className="upload-card">
                <h2>Upload Your File</h2>
                <p className="upload-subtitle">Only secure work files are allowed</p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="file-input"
                />

                <button 
                  className="select-file-button" 
                  onClick={triggerFileInput}
                >
                  Select File
                </button>

                {uploadFile && <p className="file-name">Selected: {uploadFile.name}</p>}

                <button 
                  className="upload-button" 
                  onClick={handleUpload} 
                  disabled={!uploadFile || loading}
                >
                  Upload File
                </button>

                {uploadStatus && (
                  <p className={`upload-status ${
                    uploadStatus.startsWith('✅') ? 'success' : 'error'
                  }`}>
                    {uploadStatus}
                  </p>
                )}
              </div>
            </div>
          ) : selectedFile ? (
            <div className="file-preview-view">
              <div className="preview-header">
                <button className="back-button" onClick={handleBackToFiles}>
                  ← Back to files
                </button>
                <h2>{selectedFile}</h2>
              </div>
              <div className="file-content-container">
                <pre>{fileContent}</pre>
                <button
          onClick={handleDownload}
          className="download-button"
        >
          ⬇ Download File
        </button>
              </div>
            </div>
          ) : (
            <div className="file-manager-view">
              <h2>Workspace Files</h2>
              {loading ? (
                <p>Loading files...</p>
              ) : error ? (
                <p className="error">{error}</p>
              ) : (
                <div className="file-list">
                  {files.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="file-item"
                      onClick={() => handleFileSelect(file.filename)}
                    >
                      <span className="file-icon">📄</span>
                      <div className="file-info">
                        <div className="file-name">{file.originalname}</div>
                        <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          <>
            <div className="dashboard-header">
              <div>
                <h1>Welcome, <span className="username">{profileData.name}</span></h1>
                <p>Employee ID: <strong>{profileData.employeeId}</strong></p>
              </div>
              <div className="profile-pic" onClick={handleProfileClick}>
                <img src={profileData.profilePic} alt="Profile" />
              </div>
            </div>

            {statusError && (
              <div className="status-error-banner">
                {statusError}
              </div>
            )}

            {warningIssued && !wipeTriggered && (
              <div className="warning-banner">
                ⚠ Suspicious activity detected! Workspace will be wiped in {countdown}s.
              </div>
            )}
            {wipeTriggered && (
              <div className="wipe-banner">
                🔥 Workspace wiped due to suspicious activity.
              </div>
            )}

            <div className="dashboard-stats">
              <div className="stat-card"><h3>Projects Assigned</h3><p>5</p></div>
              <div className="stat-card"><h3>Tasks In Progress</h3><p>3</p></div>
              <div className="stat-card"><h3>Completed</h3><p>12</p></div>
              <div className="stat-card"><h3>Warnings</h3><p>{warningIssued ? 1 : 0}</p></div>
            </div>

            <div className="section-grid">
              <div className="activity-section timeline-enhanced">
                <h2>📋 Recent Activity Timeline</h2>
                <div className="timeline">
                  {recentActivities.map((activity, index) => (
                    <div className="timeline-item" key={index}>
                      <div className="timeline-content">
                        <div className="timeline-text-group">
                          <p className="activity-title">{activity.action}</p>
                          <span className="activity-time">🕒 {activity.time}</span>
                        </div>
                        <span className="activity-status-tag">{activity.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {scanning && (
          <div className="scanning-popup-overlay">
            <div className="scanning-popup-content">
              <div className="spinner"></div>
              <h3>🔍 Scanning workspace...</h3>
              <p>Analyzing files for sensitive data. Please wait.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePage;