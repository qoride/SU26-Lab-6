import './ACMEUniversityApp.css'
import Login from './Login.jsx'
import Teacher from './Teacher';
import StudentDashboard from './StudentDashboard';
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

function ACMEUniversityApp() {

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = "/login";
    return;
  };

  return (
    <div className="container">
      <BrowserRouter>
        <Routes> 
          
          <Route path="/login" element={<Login />} />
          <Route path="/student" element={<RoleBasedRoute allowedRoles={["student"]}>
                                              <StudentDashboard user={localStorage.getItem("name")} onLogout={handleLogout}/>
                                          </RoleBasedRoute>} />
          <Route path="/teacher" element={<RoleBasedRoute allowedRoles={["teacher"]}> 
                                              <Teacher user={localStorage.getItem("name")} onLogout={handleLogout}/> 
                                          </RoleBasedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default ACMEUniversityApp

function RoleBasedRoute({ allowedRoles, children }) {
  const userRole = localStorage.getItem("role"); 
  // alert("RoleBasedRoute" + userRole);

  // If not logged in at all, go back to login
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={"/login"} replace />;
  }

  // If role is authorized, render the requested page
  return children;
}