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
import json

app = Flask(__name__)
app.secret_key = "akldj92ey2dkwbdkagswu19"

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Connect with Database
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://zoihfvvpxkhvvf:95a34e36e017da1e96e0a6e011d95fbca597a148c1fe760dfda5d5a2c05946f5@ec2-34-233-192-238.compute-1.amazonaws.com:5432/d4u5mqi2bjl6k1"
# app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:ALF30102501@127.0.0.1:5432/hsk_app"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)
migrate = Migrate(app, db)

@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# Serialize 
###################

from sqlalchemy.ext.declarative import DeclarativeMeta

class AlchemyEncoder(json.JSONEncoder):

    def default(self, obj):
        if isinstance(obj.__class__, DeclarativeMeta):
            # an SQLAlchemy class
            fields = {}
            for field in [x for x in dir(obj) if not x.startswith('_') and x != 'metadata']:
                data = obj.__getattribute__(field)
                try:
                    json.dumps(data) # this will fail on non-encodable values, like other classes
                    fields[field] = data
                except TypeError:
                    fields[field] = None
            # a json-encodable dict
            return fields

        return json.JSONEncoder.default(self, obj)
##################

# App

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

    decks = ProgressModel.query.filter_by(user_id=user).all()

    decks_info = []
    for deck in decks:
        deck_info = DeckModel.query.filter_by(id=deck.deck_id).first()
        deck_info.mastered = deck.mastered
        decks_info.append(deck_info)

    if name =="admin":
        return redirect("/admin")
    return render_template("home.html", name=name, decks_info=decks_info)

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

@app.route("/course/<deck>")
@login_required
def learn(deck):
    user_id = session["user_id"]
    username = session["username"]

    deck_info = DeckModel.query.filter_by(database_id=deck).first()
    deck_id = deck_info.id

    words = WordsModel.query.filter_by(database_id=deck).order_by(WordsModel.id).all()
    

    user_words = WordStatusModel.query.filter_by(user_id=user_id).filter_by(deck_id=deck_id).order_by(WordStatusModel.database_id).all()

    return render_template("deck_home.html", words=words, deck_title=deck_info.name, deck_id=deck, user_words=user_words)

@app.route("/test/<deck>")
@login_required
def test(deck):
    user_id = session["user_id"]
    username = session["username"]

    deck_info = DeckModel.query.filter_by(database_id=deck).first()
    deck_id = deck_info.id

    words = WordsModel.query.filter_by(database_id=deck).order_by(WordsModel.id).all()


    return render_template("test.html", words=json.dumps(words, cls=AlchemyEncoder), deck_title=deck_info.name, deck_id=deck)

@app.route("/test/<deck>/submit", methods=['POST'])
@login_required
def submit(deck):
    user_id = session["user_id"]
    answer = request.form.to_dict(flat=False)
    
    data = json.loads(answer["data"][0])
    i = 0
    for d in data:
        data_id = d["id"]
        data_status = d["status"]
        status_now = WordStatusModel.query.filter_by(user_id=user_id).filter_by(database_id=data_id).first()
        correct = status_now.correct
        missed = status_now.missed
        if data_status == 0:
            missed = missed + 1
            db.session.query(WordStatusModel).filter_by(user_id=user_id).filter_by(database_id=data_id).update({"missed": missed})
        else:
            correct = correct + 2
            db.session.query(WordStatusModel).filter_by(user_id=user_id).filter_by(database_id=data_id).update({"correct": correct})
        db.session.commit()

    updatestatus(deck)

    return "Success"

@app.route("/quiz/<deck>", methods=["POST"])
@login_required
def quiz(deck):
    user_id = session["user_id"]

    start = int(request.form.get("start"))
    finish = int(request.form.get("finish"))
    quiz_type = request.form.get("type")


    words = WordsModel.query.filter_by(database_id=deck).order_by(WordsModel.pinyin).all()
    returned_words = words[start-1:finish-1]

    return render_template('quiz.html', words=json.dumps(returned_words, cls=AlchemyEncoder), type=quiz_type)

@app.route("/quiz/<deck>/submit", methods=['POST'])
@login_required
def quiz_submit(deck):
    user_id = session["user_id"]
    answer = request.form.to_dict(flat=False)
    
    data = json.loads(answer["data"][0])
    i = 0
    for d in data:
        data_id = d["id"]
        data_status = d["status"]
        status_now = WordStatusModel.query.filter_by(user_id=user_id).filter_by(database_id=data_id).first()
        correct = status_now.correct
        missed = status_now.missed
        if data_status == 0:
            missed = missed + 1
            db.session.query(WordStatusModel).filter_by(user_id=user_id).filter_by(database_id=data_id).update({"missed": missed})
        else:
            correct = correct + 1
            db.session.query(WordStatusModel).filter_by(user_id=user_id).filter_by(database_id=data_id).update({"correct": correct})
        db.session.commit()

    updatestatus(deck)

    return "Success"

@app.route("/learn/<deck>/flashcard")
@login_required
def flashcard(deck):
    user_id = session["user_id"]
    deck_info = DeckModel.query.filter_by(database_id=deck).first()
    deck_id = deck_info.id

    words = WordsModel.query.filter_by(database_id=deck).order_by(WordsModel.id).all()
    progress = ProgressModel.query.filter_by(user_id=user_id).filter_by(deck_id=deck_id).first()
    
    last_seen = progress.flashcard
    return render_template('flashcard.html', words=json.dumps(words, cls=AlchemyEncoder), last_seen=last_seen)

@app.route("/learn/<deck>/flashcard/save", methods=['POST'])
@login_required
def save_progress_flashcard(deck):
    user_id = session["user_id"]
    deck_info = DeckModel.query.filter_by(database_id=deck).first()
    deck_id = deck_info.id

    data = request.form.to_dict(flat=False)
    
    progress = json.loads(data["data"][0])

    db.session.query(ProgressModel).filter_by(user_id=user_id).filter_by(deck_id=deck_id).update({'flashcard': progress})
    db.session.commit()
    return 'Success'

@app.route("/course/<deck>/start")
@login_required
def learn_start(deck):
    user_id = session["user_id"]
    username = session["username"]

    deck_info = DeckModel.query.filter_by(database_id=deck).first()

    deck_add = ProgressModel(user_id, deck_info.id, 0, 1, 1)
    db.session.add(deck_add)
    db.session.commit()

    words = WordsModel.query.filter_by(database_id=deck).all()
    for word in words:
        word_progress_add = WordStatusModel(user_id, word.id, 0, 0, 0, deck_info.id)
        db.session.add(word_progress_add )
        db.session.commit()

    url_redirect = "/course/" + deck
    return redirect(url_redirect)

@app.route("/search", defaults={'query': None}, methods=['POST'])
@app.route("/search/<query>", methods=['GET'])
@login_required
def search(query):
    user_id = session["user_id"]
    username = session["username"]

    if request.method == "POST":
        query = request.form.get("query")

    query = query.lower()
    search_query = "%{}%".format(query)
    decks = DeckModel.query.filter(DeckModel.name.ilike(search_query)).order_by(DeckModel.id).all()
    status_list = ProgressModel.query.filter_by(user_id=user_id).order_by(ProgressModel.deck_id).all()

    if len(status_list) != 0:
        for i in range(len(decks)):
            for j in range(len(status_list)):
                if j == 0:
                    if decks[i].id == status_list[j].deck_id:
                        decks[i].signed = True
                    else:
                        decks[i].signed = False
                else:
                    if decks[i].id == status_list[j].deck_id:
                        decks[i].signed = True
    else:
        for i in range(len(decks)):
            decks[i].signed = False

    return render_template("search.html", decks = decks)

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

class ProgressModel(db.Model):
    __tablename__ = 'progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String())
    deck_id = db.Column(db.String())
    mastered = db.Column(db.Integer())
    flashcard = db.Column(db.Integer())
    progress = db.Column(db.Integer())

    def __init__(self, user_id, deck_id, mastered, flashcard, progress):
        self.user_id = user_id
        self.deck_id = deck_id
        self.mastered = mastered
        self.flashcard = flashcard
        self.progress = progress

class WordStatusModel(db.Model):
    __tablename__ = 'word_status'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String())
    database_id = db.Column(db.Integer())
    correct = db.Column(db.Integer())
    missed = db.Column(db.Integer())
    status = db.Column(db.Integer())
    deck_id = db.Column(db.Integer())

    def __init__(self, user_id, database_id, correct, missed, status, deck_id):
        self.user_id = user_id
        self.database_id = database_id
        self.correct = correct
        self.missed = missed
        self.status = status
        self.deck_id = deck_id
        
###

def updatestatus(deck):
    user_id = session["user_id"]
    
    deck_info = DeckModel.query.filter_by(database_id=deck).first()
    deck_id = deck_info.id
    status_now = WordStatusModel.query.filter_by(user_id=user_id).filter_by(deck_id=deck_id).all()

    mastered = 0
    for data in status_now:
        data_id = data.database_id
        correct = data.correct
        missed = data.missed
        accuracy = correct / (correct + missed) * 100
        if accuracy >= 60:
            mastered += 1
        db.session.query(WordStatusModel).filter_by(user_id=user_id).filter_by(database_id=data_id).update({"status": accuracy})
        db.session.commit()
    
    update_mastered(deck, mastered)

def update_mastered(deck, mastered):
    user_id = session["user_id"]
    
    deck_info = DeckModel.query.filter_by(database_id=deck).first()
    deck_id = deck_info.id
    db.session.query(ProgressModel).filter_by(user_id=user_id).filter_by(deck_id=deck_id).update({"mastered": mastered})
    db.session.commit()



