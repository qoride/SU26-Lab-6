import React, { useState } from 'react';
import './ACMEUniversityApp.css';
import Login from './Login.jsx';
import Teacher from './Teacher';
import StudentDashboard from './StudentDashboard.jsx';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function ACMEUniversityApp() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          {/* 1. Root redirect rule */}
          <Route 
            path="/" 
            element={
              user ? (
                user.role === 'student' ? <Navigate to="/student" /> : <Navigate to="/teacher" />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          {/* 2. Login Route */}
          <Route path="/login" element={<Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />} />
          
          {/* 3. Student Route points to the Dashboard Wrapper */}
          <Route 
            path="/student" 
            element={
              user && user.role === 'student' ? (
                <StudentDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          {/* 4. Teacher Route */}
          <Route 
            path="/teacher" 
            element={
              user && user.role === 'teacher' ? (
                <Teacher user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          {/* Fallback for invalid URLs */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default ACMEUniversityApp;

function RoleBasedRoute({ allowedRoles, children }) {
  const currentRole = localStorage.getItem("role"); 

  // If not logged in at all, go back to login
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return <Navigate to={"/login"} replace />;
  }

  // If role is authorized, render the requested page
  return children;
}
