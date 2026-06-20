import React, { useState, useEffect } from 'react';

export default function Teacher({ user, onLogout }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [gradeInputs, setGradeInputs] = useState({});
  const [error, setError] = useState('');

  // Fetch all classes taught by this teacher
  const fetchTeacherCourses = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/teacher/courses`);
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Error fetching teacher courses:", err);
      setError('Failed to load classes.');
    }
  };

  // Fetch all students enrolled in the selected course
  const fetchCourseRoster = async (course) => {
    setSelectedCourse(course);
    try {
      const res = await fetch(`/api/teacher/course/${course.id}`);
      const data = await res.json();
      setRoster(data);
      
      // Initialize text box states with current grades
      const initialGrades = {};
      data.students.forEach(student => {
        initialGrades[student.enrollment_id] = student.grade;
      });
      setGradeInputs(initialGrades);
    } catch (err) {
      console.error("Error fetching course roster:", err);
    }
  };

  // Submit the grade update to the backend database
  const handleGradeChangeSubmit = async (enrollmentId) => {
    const currentGradeInput = gradeInputs[enrollmentId];
    try {
      const res = await fetch(`/api/teacher/grade/${enrollmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: enrollmentId,
          grade: currentGradeInput
        })
      });
      if (res.ok) {
        alert('Grade updated successfully!');
        if (selectedCourse) fetchCourseRoster(selectedCourse);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update grade');
      }
    } catch (err) {
      console.error("Error updating grade:", err);
    }
  };

  useEffect(() => {
    fetchTeacherCourses();
  }, [user]);

  return (
    <div style={{ width: '100%' }}>
      {/* Universal top layout block */}
      <div className="topBar">
        <p>Welcome {user}!</p>
        <h1>ACME University</h1>
        <a href="#logout" onClick={(e) => { e.preventDefault(); onLogout(); }}>Sign out</a>
      </div>

      <div className="tabs">
        <button className="active" style={{ cursor: 'default' }}>
          Teacher Management Panel
        </button>
      </div>

      {error && <p id="loginError" style={{ margin: '15px' }}>{error}</p>}

      <div className="panel" style={{ minHeight: '400px' }}>
        <h2>Your Taught Courses</h2>
        {courses.length === 0 ? (
          <p style={{ color: 'white', padding: '10px' }}>You are not assigned to teach any classes yet.</p>
        ) : (
          <table className="course-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Time</th>
                <th>Active Enrollments</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} style={{ backgroundColor: selectedCourse?.id === course.id ? '#e2efff' : '' }}>
                  <td>{course.course_name}</td>
                  <td>{course.time}</td>
                  <td>{course.students_enrolled}/{course.capacity}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => fetchCourseRoster(course)}
                      style={{
                        backgroundColor: 'steelblue',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      View Roster
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Dynamic Roster and Grade Editing Display Section */}
        {selectedCourse && (
          <div>
            <h2 style={{ borderTop: '1px dashed white', paddingTop: '20px' }}>
              Student Roster for {selectedCourse.name}
            </h2>
            {roster.length === 0 ? (
              <p style={{ color: 'white', padding: '10px' }}>No students have signed up for this course yet.</p>
            ) : (
              <table className="course-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    {/* <th>Username</th> */}
                    <th style={{ width: '150px' }}>Current Grade</th>
                    <th style={{ width: '160px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.students.map((student) => (
                    <tr key={student.enrollment_id}>
                      <td>{student.student_name}</td>
                      {/* <td>{student.student_username}</td> */}
                      <td>
                        <input 
                          type="text"
                          value={gradeInputs[student.enrollment_id] || ''}
                          onChange={(e) => setGradeInputs({
                            ...gradeInputs,
                            [student.enrollment_id]: e.target.value
                          })}
                          style={{
                            width: '80px',
                            padding: '4px',
                            fontSize: '14px',
                            textAlign: 'center',
                            border: '1px solid gray',
                            borderRadius: '4px'
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleGradeChangeSubmit(student.enrollment_id)}
                          style={{
                            backgroundColor: '#5cb85c',
                            color: 'white',
                            border: 'none',
                            padding: '5px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          Submit Grade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}