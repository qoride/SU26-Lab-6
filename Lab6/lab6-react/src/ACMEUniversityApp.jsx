import './ACMEUniversityApp.css'
import Login from './Login.jsx'
import Teacher from './Teacher';
import Student from './Student';
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

function ACMEUniversityApp() {
  return (
    <div className="container">
      <BrowserRouter>
        <Routes> 
          
          <Route path="/login" element={<Login />} />
          <Route path="/student" element={<RoleBasedRoute allowedRoles={["student"]}>
                                              <Student />
                                          </RoleBasedRoute>} />
          <Route path="/teacher" element={<RoleBasedRoute allowedRoles={["teacher"]}> 
                                              <Teacher /> 
                                          </RoleBasedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default ACMEUniversityApp

function RoleBasedRoute({ allowedRoles, children }) {
  const currentRole = localStorage.getItem("role"); 

  // If not logged in at all, go back to login
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return <Navigate to={"/login"} replace />;
  }

  // If role is authorized, render the requested page
  return children;
}
