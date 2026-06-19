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
          <Route path="/student" element={<Student />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="*" element={<Navigate to="/login" replace />}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default ACMEUniversityApp
