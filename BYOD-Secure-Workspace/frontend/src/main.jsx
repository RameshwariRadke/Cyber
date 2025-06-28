

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import DeviceCheckPage from './pages/DeviceCheckPage';
import EmployeePage from './pages/EmployeePage'; // added this line to the previous code

import LoginPage from './pages/LoginPage';



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/device-check" element={<DeviceCheckPage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/employee" element={<EmployeePage />} />  {/*added this line to the previous code*/} 
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
