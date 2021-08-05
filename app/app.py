from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash
from .util import *
from .csv_read import *
from datetime import datetime
import time

app = Flask(__name__)
app.secret_key = "akldj92ey2dkwbdkagswu19"

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Connect with Database
#app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://zoihfvvpxkhvvf:95a34e36e017da1e96e0a6e011d95fbca597a148c1fe760dfda5d5a2c05946f5@ec2-34-233-192-238.compute-1.amazonaws.com:5432/d4u5mqi2bjl6k1"
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:ALF30102501@127.0.0.1:5432/hsk_app"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)
migrate = Migrate(app, db)

@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

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
        session["name"] = user.name
        # Redirect user to home page

        return redirect("/home")    

@app.route("/home")   
@login_required
def home():
    user = session["user_id"]
    username = session["username"]
    name = session["name"]

    if name =="admin":
        return redirect("/admin")
    return render_template("home.html", name=name)

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

@app.route("/admin")
@admin_required
def admin():
    name = session["username"]
    return render_template("admin.html", name=name)


@app.route("/decks")
@admin_required
def decks():
    name = session["username"]
    decks = DeckModel.query.order_by(DeckModel.name).all()
    db.session.remove()
    return render_template("decks.html", name=name, decks=decks)


@app.route("/decks/edit/<db_id>", methods=['GET', 'POST'])
@admin_required
def edit_deck(db_id):
    if request.method == "POST":
        data_edited = request.form.get("data_id")
        hanzi = request.form.get("hanzi")
        pinyin = request.form.get("pinyin")
        meaning = request.form.get("meaning")

        db.session.query(WordsModel).filter_by(id=data_edited).update({"hanzi":hanzi, "pinyin":pinyin, "meaning":meaning})
        db.session.commit()

        url_redirect = "/decks/edit/" + db_id
        return redirect(url_redirect)
    else:
        name = session["username"]
        deck = WordsModel.query.filter_by(database_id=db_id).order_by(WordsModel.pinyin).all()
        db_deck = DeckModel.query.filter_by(database_id=db_id).first()
        db.session.remove()
        return render_template("edit.html", name=name, deck=deck, db_deck=db_deck)

@app.route("/decks/add/<db_id>", methods=['POST'])
@admin_required
def add_data_deck(db_id):
    hanzi = request.form.get("hanzi")
    pinyin = request.form.get("pinyin")
    meaning = request.form.get("meaning")
    database_id = db_id

    word = WordsModel(database_id, hanzi, pinyin, meaning)

    db.session.add(word)
    db.session.commit()
    
    deck_info = DeckModel.query.filter_by(database_id=db_id).first()
    total_words = deck_info.total_words + 1

    db.session.query(DeckModel).filter_by(database_id=db_id).update({'total_words' : total_words})
    db.session.commit()
    
    url_redirect = "/decks/edit/" + db_id
    return redirect(url_redirect)

@app.route("/decks/delete/<db_id>", methods=['POST'])
@admin_required
def delete_data_deck(db_id):
    data_id = request.form.get("data_id")

    delete_word = WordsModel.query.filter_by(id=data_id).first()
    db.session.delete(delete_word)
    db.session.commit()

    total_words = len(WordsModel.query.filter_by(database_id=db_id).all())
    db.session.query(DeckModel).filter_by(database_id=db_id).update({'total_words' : total_words})
    db.session.commit()

    url_redirect = "/decks/edit/" + db_id
    return redirect(url_redirect)

@app.route("/decks/edit/info/<db_id>", methods=['POST'])
@admin_required
def edit_info_deck(db_id):
    title = request.form.get("title")
    banner = request.form.get("banner")
    words = request.form.get("words")
    desc = request.form.get("desc")

    db.session.query(DeckModel).filter_by(database_id=db_id).update({"name":title, "desc": desc, "banner":banner, "total_words":words})
    db.session.commit()

    url_redirect = "/decks/edit/" + db_id
    return redirect(url_redirect)

@app.route("/decks/import")
@admin_required
def file_import():
    return render_template("import.html")

@app.route("/import", methods=['GET'])
@admin_required
def import_data():
    # file_name = request.form.get("file_name")
    file_name = "hsk.csv"
    data_file = open_csv(file_name)
    for data in data_file:
        new_data = WordsModel(data["db_id"], data["hanzi"], data["pinyin"], data["meaning"])
        db.session.add(new_data)
        db.session.commit()
    return redirect("/admin")

@app.route("/learn/<level>")
@login_required
def learn(level):
    return redirect("/")

@app.route("/account")
@login_required
def account():
    user_id = session["user_id"]
    username = session["username"]
    return redirect("/")




# Models

class UserModel(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String())
    email = db.Column(db.String())
    password = db.Column(db.String())
    username = db.Column(db.String())
    grade = db.Column(db.Integer())

    def __init__(self, name, username, email, grade, password):
        self.name = name
        self.username = username
        self.email = email
        self.grade = grade
        self.password = password

class DeckModel(db.Model):
    __tablename__ = 'decks'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String())
    desc = db.Column(db.String())
    total_words = db.Column(db.Integer())
    banner = db.Column(db.Integer())
    database_id = db.Column(db.String())

    def __init__(self, name, desc, total_words, banner, database_id):
        self.name = name
        self.desc = desc
        self.total_words = total_words
        self.banner = banner
        self.db_id = database_id

class WordsModel(db.Model):
    __tablename__ = 'words'

    id = db.Column(db.Integer, primary_key=True)
    database_id = db.Column(db.String())
    hanzi = db.Column(db.String())
    pinyin = db.Column(db.String())
    meaning = db.Column(db.String())

    def __init__(self, database_id, hanzi, pinyin, meaning):
        self.database_id = database_id
        self.hanzi = hanzi
        self.pinyin = pinyin
        self.meaning = meaning