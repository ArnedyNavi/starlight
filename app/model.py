from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_session import Session
from flask import Flask, flash, jsonify, redirect, render_template, request, session

app = Flask(__name__)
db = SQLAlchemy(app)

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

    def __init__(self, user_id, deck_id, mastered):
        self.user_id = user_id
        self.deck_id = deck_id
        self.mastered = mastered
