// Dashboard.js
import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import './Dashboard.css';
import Upload from './Upload';
import UploadedFiles from './UploadedFiles';


//Nikhil
import axios from 'axios';

const DashboardHome = ({ logs, lastUpdated, uploadedFiles, showUploads, handleFilesClick,alerts, mlAlerts }) => (
  <>
    <h1>📈 Admin Overview</h1>

    <div className="cards">
      <div className="card green">
        <h3>Total Users</h3>
        <p>42 registered</p>
      </div>
      <div className="card blue">
        <h3>Active Sessions</h3>
        <p>9 currently online</p>
      </div>
      <div className="card orange" onClick={handleFilesClick} style={{ cursor: 'pointer' }}>
        <h3>Files Uploaded</h3>
        <p>{uploadedFiles.length} uploaded today</p>
      </div>
    </div>

    {showUploads && (
      <div className="uploaded-section">
        <h2>📁 Uploaded Files</h2>
        {uploadedFiles.length === 0 ? (
          <p className="no-files">No files uploaded yet.</p>
        ) : (
          <ul className="uploaded-grid">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="uploaded-card">
                <div className="uploaded-header">
                  <a
                    href={`http://localhost:5000/uploads/${file.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 {file.originalname}
                  </a>
                </div>
                <p className="upload-time">Uploaded at: {new Date(file.uploadedAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    )}

    <div className="grid-container">
      <div className="card-section">
        <h2>👤 Employee Details</h2>
        <p><strong>Name:</strong> Rameshwari Singh</p>
        <p><strong>Department:</strong> IT</p>
        <p><strong>Role:</strong> Intern</p>
        <p><strong>Joined:</strong> March 2024</p>
      </div>

      <div className="card-section">
        <h2>🗂 Folder Monitoring</h2>
        <p><strong>Monitored Folder:</strong> C:/CyberSecure_Workspace</p>
        <p><strong>Status:</strong> ✅ Active</p>
        <p><strong>Last Updated:</strong> {lastUpdated || 'Loading...'}</p>
      </div>
    </div>



   <div className="card full-width" style={{ marginTop: '2rem' }}>
  <h2>🚨 UEBA Alerts</h2>
  {alerts.length > 0 ? (
    <table className="log-table">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>User</th>
          <th>Issue</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((alert, index) => (
          <tr key={index}>
            <td>{alert.timestamp}</td>
            <td>{alert.username}</td>
            <td>{alert.issue}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>✅ No suspicious activity detected.</p>
  )}
</div>



 <div>
  <h2>🤖 ML-Predicted Anomalies</h2>
  {Array.isArray(mlAlerts) && mlAlerts.length > 0 ? (
     <ul style={{ listStyleType: 'none', padding: 0 }}>
  {mlAlerts.map((row, idx) => (
    <li key={idx} className="ml-alert">
      {row.explanation}
    </li>
  ))}
</ul>

  ) : (
    <p>✅ No ML anomalies detected.</p>
  )}
</div>






    <div className="card full-width">
      <h2>📁 Folder Activity Logs</h2>
      {logs.length > 0 ? (
        <table className="log-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Activity</th>
              <th>File Path</th>
            </tr>
          </thead>
          <tbody>

          
            {logs.map((log, index) => {
  if (typeof log !== 'string' || !log.includes('] ')) {
    return (
      <tr key={index}>
        <td colSpan="3">⚠️ Invalid log format</td>
      </tr>
    );
  }

  try {
    const parts = log.split('] ');
    const timestamp = parts[0].replace('[', '');
    const [activityType, filePath] = parts[1].split(': ');
    return (
      <tr key={index}>
        <td>{timestamp}</td>
        <td>{activityType}</td>
        <td>{filePath}</td>
      </tr>
    );
  } catch (err) {
    return (
      <tr key={index}>
        <td colSpan="3">⚠️ Error parsing log</td>
      </tr>
    );
  }
})}

          </tbody>
        </table>
      ) : (
        <p>No folder activity detected yet.</p>
      )}
    </div>

    {/* 🔥 Added Wipe Request Button */}
    <button
      onClick={async () => {
        await fetch('http://localhost:5000/api/admin/wipe-request', { method: 'POST' })
          .then((res) => res.json())
          .then(() => alert('Wipe request sent'));
      }}
      className="bg-red-600 text-white px-4 py-2 rounded"
      style={{ marginTop: '1rem' }}
    >
      🔥 Initiate Wipe
    </button>
  </>
);

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showUploads, setShowUploads] = useState(false);


  const [mlAlerts, setMlAlerts] = useState([]);

  //Nikhil
   const [alerts, setAlerts] = useState([]);
   //nikhil


  useEffect(() => {
    const fetchLogs = () => {
      fetch('http://localhost:5000/api/logs')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLogs(data.logs);
            setLastUpdated(new Date().toLocaleString());
          }
        })
        .catch((err) => console.error('Error fetching logs:', err));
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);
  

  //Nikhil Change
   useEffect(() => {
  const fetchUEBAAlerts = () => {
    fetch('http://localhost:5000/api/ueba-alerts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAlerts(data.alerts);
        }
      })
      .catch((err) => console.error('Error fetching UEBA alerts:', err));
  };

  fetchUEBAAlerts(); // Initial call
  const alertInterval = setInterval(fetchUEBAAlerts, 5000); // Poll every 5s

  return () => clearInterval(alertInterval); // Cleanup on unmount
}, []);


//Nikhil Change
  useEffect(() => {
    axios.get('http://localhost:5000/api/mlpredictions')
  .then(res => setMlAlerts(res.data.anomalies))
  .catch(err => console.error(err));

  }, []);
  

  const handleFilesClick = () => {
    const newState = !showUploads;
    setShowUploads(newState);
    if (newState) {
      fetch('http://localhost:5000/api/upload')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setUploadedFiles(data.files);
        })
        .catch((err) => console.error('Failed to fetch files:', err));
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>🛡 Admin</h2>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="sidebar-link">📊 Dashboard</Link>
          <Link to="/dashboard/upload" className="sidebar-link">📤 Upload</Link>
          <Link to="/dashboard/Logs" className="sidebar-link">📂 Logs</Link>
          <Link to="/dashboard/uploaded-files" className="sidebar-link">📂 Uploaded Files</Link>
        </nav>
        <button className="theme-toggle">🌙 Dark</button>
      </aside>

      <main className="content">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardHome
                logs={logs}
                lastUpdated={lastUpdated}
                uploadedFiles={uploadedFiles}
                showUploads={showUploads}
                handleFilesClick={handleFilesClick}
                 
                //nikhil
                 alerts={alerts}
                  mlAlerts={mlAlerts}
              />
            }
          />
          <Route path="upload" element={<Upload />} />
          <Route path="uploaded-files" element={<UploadedFiles />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
