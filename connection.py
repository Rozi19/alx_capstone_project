"""
A connection to a MySQL database using SQLAlchemy. 
It creates a database engine and connects to the database using the provided connection string. 
The password is encoded using quote_plus for proper formatting and security. 
"""
from sqlalchemy import create_engine
from urllib.parse import quote_plus
from sqlalchemy.orm import sessionmaker

#password have spacial character using quote_plush to encode it
password = "ROZAalene@1929"
encode_password = quote_plus(password)

# Construct the connection path including the encoded password
path = "mysql+mysqldb://root:{}@localhost/budget_tracker".format(encode_password)

# Create a database engine with the connection path
database = create_engine(path)

# Establish a connection to the database
connection = database.connect()

Session = sessionmaker(bind=database)
sessions = Session()
