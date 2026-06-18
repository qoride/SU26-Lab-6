from flask import Flask, render_template, request, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lab6.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(100), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    time = db.Column(db.DateTime, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    teacher = db.relationship("User", backref="courses")

class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    grade = db.Column(db.Float, nullable=True)
    student = db.relationship("User", backref="enrollments")
    course = db.relationiship("Course", backref="enrollments")

def course_to_dict(course):
    enrolled = Enrollment.query.filter_by(course_id=course.id).count()

    return{
        "id": course.id,
        "course_name": course.course_name,
        "teacher": course.teacher.name,
        "time": course.time,
        "students_enrolled": enrolled,
        "capacity": course.capacity
    }

def seed_data():
    if User.query.first():
        return

    anthony = User(username="aliu", password="password", name="Anthony Liu", role="student")
    vishnu = User(username="vdeva", password="password", name="Vishnu Devarapalli", role="student")
    prathi = User(username="psatti", password="password", name="Prathi Sattiamoorthy", role="student")
    natii = User(username="gnatiiol", password="password", name="Natiiol Gurmessa", role="student")

    hepworth = User(username="ahepworth", password="password", name="Dr Hepworth", role="teacher")
    keith = User(username="tkeith", password="password", name="Keith Thompson", role="teacher")

    admin = User(username="admin", password="password", name="Jane Smith", role="admin")

    db.session.add_all({anthony,vishnu,prathi,natii,
                        hepworth,keith,
                        admin})
    db.session.commit()

    cse108 = Course(course_name="Full Stack Web Development", teacher_id=hepworth.id, time="MWF 10:00 AM - 12:20 PM", capacity=64)
    math032 = Course(course_name="Probability and Statistics", teacher_id=keith.id, time="MWF 1:30 PM - 3:20 PM", capacity=128)

    db.session.add_all({cse108,math032})
    db.session.commit()

    enrollments = [
        Enrollment(student_id=anthony.id, course_id=cse108.id, grade=100),
        Enrollment(student_id=anthony.id, course_id=math032.id, grade=100)
    ]

    db.session.add_all(enrollments)
    db.session.commit()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"], password=data["password"]).first()

    if user:
        session["user_id"] = user.id
        return json.dumps({"success": True, "name": user.name, "role": user.role})
    
    return json.dumps({"success": False, "error": "Invalid username or password"})

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return json.dumps({"success": True})

@app.route("/current_user", methods=["GET"])
def current_user():
    if "user_id" not in session:
        return json.dumps({"logged_in": False})

    user = User.query.get(session["user_id"])

    return json.dumps({
        "logged_in": True,
        "id": user.id,
        "name": user.name,
        "role": user.role
    })

@app.route("/student/courses", methods=["GET"])
def student_courses():
    if "user_id" not in session:
        return json.dumps([])

    enrollments = Enrollment.query.filter_by(student_id=session["user_id"]).all()
    courses = []

    for enrollment in enrollments:
        courses.append(course_to_dict(enrollment.course))

    return json.dumps(courses)

@app.route("/courses", methods=["GET"])
def all_courses():
    courses = Course.query.all()
    result = []

    for course in courses:
        data = course_to_dict(course)

        if "user_id" in session:
            enrollment = Enrollment.query.filter_by(student_id=session["user_id"], course_id=course.id).first()
            data["already_enrolled"] = enrollment is not None
        else:
            data["already_enrolled"] = False

        result.append(data)

    return json.dumps(result)

@app.route("/enroll/<int:course_id>", methods=["POST"])
def enroll(course_id):
    if "user_id" not in session:
        return json.dumps({"success": False, "error": "Not logged in"})

    user = User.query.get(session["user_id"])

    if user.role != "student":
        return json.dumps({"success": False, "error": "Only students can enroll"})

    course = Course.query.get(course_id)

    if not course:
        return json.dumps({"success": False, "error": "Course not found"})

    enrollment = Enrollment.query.filter_by(student_id=user.id, course_id=course.id).first()

    if enrollment:
        return json.dumps({"success": False, "error": "Already enrolled"})

    enrolled = Enrollment.query.filter_by(course_id=course.id).count()

    if enrolled >= course.capacity:
        return json.dumps({"success": False, "error": "Class is full"})

    new_enrollment = Enrollment(student_id=user.id, course_id=course.id, grade=None)
    db.session.add(new_enrollment)
    db.session.commit()

    return json.dumps({"success": True})

@app.route("/teacher/courses", methods=["GET"])
def teacher_courses():
    if "user_id" not in session:
        return json.dumps([])

    courses = Course.query.filter_by(teacher_id=session["user_id"]).all()
    result = []

    for course in courses:
        result.append(course_to_dict(course))

    return json.dumps(result)

@app.route("/teacher/course/<int:course_id>", methods=["GET"])
def teacher_course_students(course_id):
    enrollments = Enrollment.query.filter_by(course_id=course_id).all()
    course = Course.query.get(course_id)
    result = []

    for enrollment in enrollments:
        result.append({
            "enrollment_id": enrollment.id,
            "student_name": enrollment.student.name,
            "grade": enrollment.grade
        })

    return json.dumps({
        "course_name": course.course_name,
        "students": result
    })

@app.route("/teacher/grade/<int:enrollment_id>", methods=["PUT"])
def update_grade(enrollment_id):
    data = request.get_json()
    enrollment = Enrollment.query.get(enrollment_id)

    if enrollment:
        enrollment.grade = data["grade"]
        db.session.commit()

    return json.dumps({"success": True})

@app.route("/admin/users", methods=["GET"])
def admin_users():
    users = User.query.all()
    result = []

    for user in users:
        result.append({
            "id": user.id,
            "username": user.username,
            "password": user.password,
            "name": user.name,
            "role": user.role
        })

    return json.dumps(result)

@app.route("/admin/courses", methods=["GET"])
def admin_courses():
    courses = Course.query.all()
    result = []

    for course in courses:
        result.append(course_to_dict(course))

    return json.dumps(result)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        seed_data()

    app.run(debug=True)