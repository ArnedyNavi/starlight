from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash
from .util import *
from .model import *
from datetime import datetime
import time

app = Flask(__name__)
app.secret_key = "akldj92ey2dkwbdkagswu19"

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Connect with Database
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://zoihfvvpxkhvvf:95a34e36e017da1e96e0a6e011d95fbca597a148c1fe760dfda5d5a2c05946f5@ec2-34-233-192-238.compute-1.amazonaws.com:5432/d4u5mqi2bjl6k1"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)
migrate = Migrate(app, db)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "GET":
        return render_template("signup.html")
    else:
        if not request.form.get("username") or not request.form.get("name") or not request.form.get("grade") or not request.form.get("password"):
            flash(f"Please input every information", 'alert')
            return redirect('/signup')
        email = request.form.get("email")
        email = UserModel.query.filter_by(email=email).first()
        if email != None:
            flash(f"You have been registered before. Please log in", 'alert')
            return redirect("/login")
        username = request.form.get("username")
        grade = request.form.get("grade")
        name = request.form.get("name")
        email = request.form.get("email")
        user = UserModel.query.filter_by(username=username).first()
        if user != None:
            flash(f"Username already exists. Please use another username", 'alert')
            return render_template("signup.html", grade=grade, name=name, username=username, email=email)
        password = request.form.get("password")

        new_user = UserModel(name, username, email, grade, password)
        db.session.add(new_user)
        db.session.commit()

        #directory = email
        #parent_dir="static/images/user"
        #path = os.path.join(parent_dir, directory)

        #os.mkdir(path)
        return redirect('/')

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        if session.get("user_id") is None:
            return render_template("login.html")
        else:
            session.clear()
            return render_template("login.html")
    else:
        # Forget any user_id
        session.clear()

        # Ensure username was submitted
        if not request.form.get("username"):
            flash(f"You must include Username", 'alert')
            return redirect('/login')

        # Ensure password was submitted
        elif not request.form.get("password"):
            flash(f"You must include Password", 'alert')
            return redirect('/login')

        username = request.form.get("username")
        password = request.form.get("password")
        # Query database for username
        user = UserModel.query.filter_by(username=request.form.get("username")).first()

        # Ensure username exists and password is correct
        if user == None:
            flash(f"User not found", 'alert')
            return redirect("/login")

        if password != user.password:
            flash(f"Incorrect Password", 'alert')
            return redirect("/login")

        session["user_id"] = user.id
        session["email"] = user.email
        session["username"] = user.username
        # Redirect user to home page

        return redirect("/home")    

@app.route("/home")   
@login_required
def home():
    user = session["user_id"]
    username = session["username"]

    return render_template("home.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")