"""
SQLAlchemy models for a budget tracking application. 
It sets up User, Income, Expense, and Spending tables with their respective columns and relationships. 
It provides a foundation for database creation and interaction using SQLAlchemy's ORM.
"""

from flask_login import UserMixin
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import ForeignKey

Base = declarative_base()

# User table representing users
class user(Base, UserMixin):
    __tablename__ = 'user'

    id = Column(Integer, autoincrement=True, nullable=False, primary_key=True)
    fname = Column(String(150), nullable=False)
    lname = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False)
    password = Column(String(150), nullable=False)

    def __init__(self, fname, lname, email, password):
        self.fname = fname
        self.lname = lname
        self.email = email
        self.password = password

# Income table representing income entries
class income(Base):
    __tablename__ = "income"

    id = Column(Integer, autoincrement=True, nullable=False, primary_key=True)
    userid = Column(Integer, ForeignKey(user.id), nullable=False)
    category = Column(String(200), nullable=False)
    amount = Column(Integer, nullable=False)

    def __init__(self, userid, category, amount):
        self.userid = userid
        self.category = category
        self.amount = amount

# Expense table representing expense entries
class expense(Base):
    __tablename__ = "expense"

    id = Column(Integer, autoincrement=True, nullable=False, primary_key=True)
    userid = Column(Integer, ForeignKey(user.id), nullable=False)
    category = Column(String(200), nullable=False)
    amount = Column(Integer, nullable=False)

    def __init__(self, userid, category, amount):
        self.userid = userid
        self.category = category
        self.amount = amount



# Spending table representing spending entries
class spending(Base):
    __tablename__ = "spending"

    id = Column(Integer, autoincrement=True, nullable=False, primary_key=True)
    userid = Column(Integer, ForeignKey(user.id), nullable=False)
    category = Column(String(200), nullable=False)
    amount = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)

    def __init__(self, userid, category, amount, date):
        self.userid = userid
        self.category = category
        self.amount = amount
        self.date = date