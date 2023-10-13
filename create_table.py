"""
imports the necessary models and database engine. 
It then calls Base.metadata.create_all() to create the corresponding database tables based on the models defined in the "model" module. 
This ensures that the required tables are set up in the database for storing and retrieving data.
"""

from model import Base, user, income, expense, spending
from connection import database

Base.metadata.create_all(bind=database)
