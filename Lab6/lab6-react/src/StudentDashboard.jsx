import React, { useState, useEffect } from 'react';
import { EnrolledCoursesTable, AvailableCoursesTable } from './Student';

export default function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('your-courses');
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [error, setError] = useState('');

  // Fetch data from Flask backend using Vite Proxy relative routes
  const fetchData = async () => {
    if (!user?.username) return;
    try {
      // Fetch student's enrolled courses
      const enrolledRes = await fetch(`/api/student/${user.username}/courses`);
      const enrolledData = await enrolledRes.json();
      setMyCourses(enrolledData);

      // Fetch all courses offered by school
      const allRes = await fetch('/api/courses');
      const allData = await allRes.json();
      setAllCourses(allData);
    } catch (err) {
      console.error("Error fetching course data:", err);
      setError('Failed to load course data.');
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle enrolling in a new class
  const handleEnroll = async (courseId) => {
    try {
      // FIX: Changed endpoint from '/api/courses/drop' to '/api/courses/enroll'
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user?.username, course_id: courseId }),
      });
      
      const data = await response.json();
      if (response.ok) {
        // Refresh data to update enrollment counts and tables dynamically
        fetchData(); 
      } else {
        alert(data.message || 'Enrollment failed');
      }
    } catch (err) {
      console.error("Enrollment error:", err);
    }
  };

  // Handle dropping an enrolled class
  const handleDrop = async (courseId) => {
    try {
      const response = await fetch('/api/courses/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user?.username, course_id: courseId }),
      });
      
      const data = await response.json();
      if (response.ok) {
        fetchData(); // Refresh table enrollment figures instantly
      } else {
        alert(data.message || 'Failed to drop course');
      }
    } catch (err) {
      console.error("Drop course connection error:", err);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Bar matching lab design mockup exactly */}
      <div className="topBar">
        <p>Welcome {user?.displayName || user?.username || 'Student'}!</p>
        <h1>ACME University</h1>
        <a href="#logout" onClick={(e) => { e.preventDefault(); onLogout(); }}>Sign out</a>
      </div>

      {/* Tab Controls layout container */}
      <div className="tabs">
        <button 
          className={activeTab === 'your-courses' ? 'active' : 'inactive'} 
          onClick={() => setActiveTab('your-courses')}
        >
          Your Courses
        </button>
        <button 
          className={activeTab === 'add-courses' ? 'active' : 'inactive'} 
          onClick={() => setActiveTab('add-courses')}
        >
          Add Courses
        </button>
      </div>

      {error && <p id="loginError" style={{ margin: '15px' }}>{error}</p>}

      {/* Main Panel Content Area */}
      <div className="panel">
        <h2>{activeTab === 'your-courses' ? 'Your Current Enrollments' : 'Available Course Catalog'}</h2>
        {activeTab === 'your-courses' ? (
          <EnrolledCoursesTable courses={myCourses} />
        ) : (
          <AvailableCoursesTable 
            courses={allCourses} 
            myCourses={myCourses} 
            onEnroll={handleEnroll} 
            onDrop={handleDrop} 
          />
        )}
      </div>
    </div>
  );
}