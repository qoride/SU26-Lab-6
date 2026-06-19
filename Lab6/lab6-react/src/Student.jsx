import React from 'react';

// Table for the "Your Courses" tab
export function EnrolledCoursesTable({ courses }) {
  if (!courses || courses.length === 0) {
    return <p className="empty-msg" style={{ color: 'white', padding: '15px' }}>You are not enrolled in any courses yet.</p>;
  }

  return (
    <table className="course-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Course Name</th>
          <th>Teacher</th>
          <th>Time</th>
          <th>Students Enrolled</th>
        </tr>
      </thead>
      <tbody>
        {courses.map((course) => (
          <tr key={course.id}>
            <td>{course.name}</td>
            <td>{course.teacher}</td>
            <td>{course.time}</td>
            <td>{course.enrolled}/{course.capacity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Table for the "Add Courses" tab supporting Add and Remove Buttons
export function AvailableCoursesTable({ courses, myCourses, onEnroll, onDrop }) {
  if (!courses || courses.length === 0) {
    return <p className="empty-msg" style={{ color: 'white', padding: '15px' }}>No courses available at this time.</p>;
  }

  return (
    <table className="course-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ width: '25%' }}>Course Name</th>
          <th style={{ width: '25%' }}>Teacher</th>
          <th style={{ width: '25%' }}>Time</th>
          <th style={{ width: '13%' }}>Students Enrolled</th>
          <th style={{ width: '12%', textAlign: 'center' }}>Add/Remove</th>
        </tr>
      </thead>
      <tbody>
        {courses.map((course) => {
          const isEnrolled = myCourses.some(myCourse => myCourse.id === course.id);
          const isFull = course.enrolled >= course.capacity;

          return (
            <tr key={course.id}>
              <td>{course.name}</td>
              <td>{course.teacher}</td>
              <td>{course.time}</td>
              <td>{course.enrolled}/{course.capacity}</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>
                {isEnrolled ? (
                  <button 
                    className="removeButton" 
                    onClick={() => onDrop(course.id)}
                    style={{ 
                      backgroundColor: '#d9534f', 
                      color: 'white', 
                      padding: '6px 12px', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      display: 'inline-block',
                      width: '80px'
                    }}
                  >
                    Remove
                  </button>
                ) : isFull ? (
                  <span style={{ color: 'gray', fontStyle: 'italic' }}>Full</span>
                ) : (
                  <button 
                    className="addButton" 
                    onClick={() => onEnroll(course.id)}
                    style={{ 
                      backgroundColor: '#5cb85c', 
                      color: 'white', 
                      padding: '6px 12px', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      display: 'inline-block',
                      width: '80px'
                    }}
                  >
                    Add
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}