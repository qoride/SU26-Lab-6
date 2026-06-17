from flask import Flask, render_template, request, session
from flask_sqlalchemy import SQLAlchemy
import json

app = Flask(__name__)

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

    hepworth = User(username="ahepworth", password="password", name="Dr Hepworth", role="teacher")

    admin = User(username="admin", password="password", name="Jane Smith", role="admin")

    db.session.add_all({anthony,vishnu,prathi,
                        hepworth,
                        admin})
    db.session.commit()

    cse108 = Course(course_name="Full Stack Web Development", teacher_id=hepworth.id, time="MWF 10:00 AM - 12:20 PM", capacity=64)

    db.session.add_all({cse108})
    db.session.commit()

    enrollments = [
        Enrollment(student_id=anthony.id, course_id=cse108.id, grade=100)
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

