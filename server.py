"""
Import modules and classes
Import the 'sessions' and 'database' modules for handling sessions and database interactions
Import the 'user', 'income', 'expense', and 'spending' models from the 'model' module
These models represent database tables used in the application
Import the 'select' function from SQLAlchemy for database querying
Import the necessary modules and classes for user authentication and authorization
These modules provide functionality for managing user sessions, login/logout, and user roles
Import the 'json' module for working with JSON data

"""

from connection import sessions, database
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from flask_login import LoginManager, login_required, login_user, logout_user, UserMixin
import json
from model import user, income, expense, spending
import os
from sqlalchemy import select

# Set up Flask application named 'app'
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SESSION_TYPE'] = 'filesystem'

# Create and initialize LoginManager instance with the app
login_manager = LoginManager()
login_manager.init_app(app)

# Define a custom user mixin class 'MyUserMixin'
class MyUserMixin(UserMixin):
    def get_id(self):
        return str(self.id)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

# used to load a user object based on the user_id
# It queries the 'user' table using the 'user_id' and returns the corresponding user
@login_manager.user_loader
def loader_user(user_id):
    return sessions.query(user).get(user_id)

# the route for the home page
@app.route("/")
def home():

    # Render the home.html template for displaying the content of home page
    return render_template("home.html")

# the route to get user data in JSON format
@app.route('/get_userjson')
def get_userjson():
    with open('user_data.json', 'r') as userjson_file:
        user_data = json.load(userjson_file)
    
    return jsonify(user_data)

# the route to get income data in JSON format
@app.route('/get_incomejson')
def get_incomejson():
    with open('income_data.json', 'r') as incomejson_file:
        income_data = json.load(incomejson_file)
    
    return jsonify(income_data)

# the route to get expense data in JSON format
@app.route('/get_expensejson')
def get_json():
    with open('expense_data.json', 'r') as json_file:
        expense_data = json.load(json_file)

    return jsonify(expense_data)

# the route to get spend data in JSON format
@app.route('/get_spendjson')
def get_spendjson():
    with open('spend_data.json', 'r') as json_file:
        spend_data = json.load(json_file)

    return jsonify(spend_data)



# Route for creating a new user account
@app.route("/createaccount", methods=["GET", "POST"])
def createaccount():
    if request.method == 'POST':

        # Retrieve form data
        fname = request.form['fname']
        lname = request.form['lname']
        email = request.form['email']
        password = request.form['psw']

        # Check if the email address already exists in the database
        User = sessions.query(user).filter(user.email == email).first()
        if User:
            flash('Email address already exists')
            return redirect(url_for('login'))

        # Create a new user object with the form data
        users = user(fname, lname, email, password)

        # Add the new user to the database
        sessions.add(users)
        sessions.commit()

        # Create a dictionary with the user data
        user_data = {
            'id': users.id,
            'fname': users.fname,
            'lname': users.lname,
            'email': users.email,
            'password': users.password
        }

        # Check if the JSON file exists
        if os.path.exists('user_data.json'):
            # Load existing user data from the JSON file
            with open('user_data.json', 'r') as json_file:
                existing_data = json.load(json_file)
        else:
            existing_data = {"users": []}

        # Append new user data to the existing data
        existing_data["users"].append(user_data)

        # Save the updated data to the JSON file
        with open('user_data.json', 'w') as json_file:
            json.dump(existing_data, json_file)

        # Redirect the user to the login page after successful account creation
        return redirect(url_for('login'))

    # Render the createaccount.html template for displaying the account creation form
    return render_template("createaccount.html")

# Route for user login
@app.route("/login", methods=["GET", "POST"])
def login():
    if "login_button" in request.form:
        # Check if the HTTP request method is POST
        if request.method == 'POST':
            # Retrieve email and password from the form
            Email = request.form['email']
            Password = request.form['password']

            # Query the database to find a user with the provided email address
            User = sessions.query(user).filter(user.email == Email).first()

            # Check if a user with the provided email exists and if the password matches
            if User and User.password == Password:
                # Set session variables and login the user
                session['user_id'] = User.id
                session['fname'] = User.fname
                login_user(User)

                # Redirect the user to the start planning page
                return redirect(url_for('startplaning'))
            else:
                # If the email or password is invalid, render the login page with an error message
                return render_template('login.html', error="Invalid email or password. Please try again.")

    # Render the login.html template for displaying the login form
    return render_template("login.html")

# Route for user logout
@app.route("/logout")
def logout():
    # Logout the user and redirect to the home page
    logout_user()
    return redirect(url_for("home"))

# Route for the welcome page
@app.route("/welcome.html", methods=["GET", "POST"])
@login_required  # Requires the user to be logged in
def welcome():
    userid = session.get('user_id')  # Get the user ID from the session
    name = session.get('fname')  # Get the user's first name from the session

    if "addspend" in request.form:
        # Check if the "addspend" button is present in the form
        if request.method == "POST":
            # Retrieve spend data from the form
            spend_category = request.form['spend_category']
            spend_amount = request.form['spend_amount']
            spend_date = request.form['spend_date']

            # Create a new spending object with the retrieved data
            spend = spending(userid, spend_category, spend_amount, spend_date)
            sessions.add(spend)
            sessions.commit()

            # Parse the spend_date string into a datetime object
            spend_date = datetime.strptime(spend_date, '%Y-%m-%d')

            # Convert the spend_date to a string representation
            spend_date_str = spend_date.isoformat()

            # Create a dictionary with the spend data
            spend_data = {
                'id': spend.id,
                'user_id': spend.userid,
                'category': spend.category,
                'amount': spend.amount,
                'date': spend_date_str
            }

            # Check if the JSON file exists
            if os.path.exists('spend_data.json'):
                # Load existing spend data from the JSON file
                with open('spend_data.json', 'r') as json_file:
                    existing_data = json.load(json_file)
            else:
                existing_data = {"spending": []}

            # Append new spend data to the existing data
            existing_data["spending"].append(spend_data)

            # Save the updated data to the JSON file
            with open('spend_data.json', 'w') as json_file:
                json.dump(existing_data, json_file)

    # Render the welcome.html template, passing the user's name and ID
    return render_template("welcome.html", name=name, id=userid)


# Route for viewing the report
@app.route("/viewreport")
@login_required  # Requires the user to be logged in
def viewreport():
    userid = session.get('user_id')  # Get the user ID from the session
    name = session.get('fname')  # Get the user's first name from the session

    # Query the database to get the user's incomes, expenses, and spending
    incomes = sessions.query(income).filter_by(userid=userid).all()
    expenses = sessions.query(expense).filter_by(userid=userid).all()
    spend = sessions.query(spending).filter_by(userid=userid).all()

    # Render the viewreport.html template, passing the spending, income, and expense data
    return render_template("viewreport.html", spending=spend, income=incomes, expense=expenses)

# Route for the start planning page
@app.route("/startplaning.html", methods=["GET", "POST"])
@login_required  # Requires the user to be logged in
def startplaning():

    user_id = session.get('user_id')  # Get the user ID from the session
    name = session.get('fname')  # Get the user's first name from the session

    if 'income_button' in request.form:
        # Check if the "income_button" is present in the form
        category = request.form['income_category']  # Retrieve the income category from the form
        amount = request.form['amount']  # Retrieve the income amount from the form

        # Create a new income object with the retrieved data
        incomes = income(user_id, category, amount)

        # Add the income object to the database and commit the changes
        sessions.add(incomes)
        sessions.commit()

        # Create a dictionary with the income data
        incomes_data = {
            'id': incomes.id,
            'user_id': incomes.userid,
            'category': incomes.category,
            'amount': incomes.amount
        }

        # Check if the JSON file exists
        if os.path.exists('income_data.json'):
            # Load existing income data from the JSON file
            with open('income_data.json', 'r') as json_file:
                existing_data = json.load(json_file)
        else:
            existing_data = {"income": []}

        # Append new income data to the existing data
        existing_data["income"].append(incomes_data)

        # Save the updated data to the JSON file
        with open('income_data.json', 'w') as json_file:
            json.dump(existing_data, json_file)

    if 'expense_button' in request.form:
        # Check if the "expense_button" is present in the form
        category_e = request.form['expense_category']  # Retrieve the expense category from the form
        amount_e = request.form['amount_expense']  # Retrieve the expense amount from the form

        # Create a new expense object with the retrieved data
        expenses = expense(user_id, category_e, amount_e)

        # Add the expense object to the database and commit the changes
        sessions.add(expenses)
        sessions.commit()

        # Create a dictionary with the expense data
        expenses_data = {
            'id': expenses.id,
            'user_id': expenses.userid,
            'category': expenses.category,
            'amount': expenses.amount
        }

        # Check if the JSON file exists
        if os.path.exists('expense_data.json'):
            # Load existing expense data from the JSON file
            with open('expense_data.json', 'r') as json_file:
                existing_data = json.load(json_file)
        else:
            existing_data = {"expense": []}

        # Append new expense data to the existing data
        existing_data["expense"].append(expenses_data)

        # Save the updated data to the JSON file
        with open('expense_data.json', 'w') as json_file:
            json.dump(existing_data, json_file)

    # Render the startplaning.html template, passing the user's ID
    return render_template("startplaning.html", id=user_id)

# route to delete the income
@app.route('/delete_income', methods=['POST'])
def delete_income():
    # Extract data to delete from the request
    data_to_delete = request.json.get('data')  # Retrieve the data to delete from the request
    user_id = request.json.get('user_id')  # Retrieve the user ID from the request
    category_name = data_to_delete.split('=')[0].strip()  # Extract the category name from the data

    # Delete the item from the database
    result = sessions.query(income).filter_by(category=category_name, userid=user_id).delete()
    sessions.commit()

    if result:
        # Update the JSON file
        if os.path.exists('income_data.json'):
            with open('income_data.json', 'r') as json_file:
                existing_data = json.load(json_file)
                # Remove the deleted item from the existing data
                existing_data["income"] = [item for item in existing_data["income"] if
                                           item["category"] != category_name or item["user_id"] != user_id]
            with open('income_data.json', 'w') as json_file:
                json.dump(existing_data, json_file)

        return jsonify({'message': 'Item deleted successfully'})
    else:
        return jsonify({'error': 'Item not found'})

# route to delete the expense
@app.route('/delete_expense', methods=['POST'])
def delete_expense():
    # Extract data to delete from the request
    data_to_delete = request.json.get('data')  # Retrieve the data to delete from the request
    user_id = request.json.get('user_id')  # Retrieve the user ID from the request
    category_name = data_to_delete.split('=')[0].strip()  # Extract the category name from the data

    # Delete the item from the database
    result = sessions.query(expense).filter_by(category=category_name, userid=user_id).delete()
    sessions.commit()

    if result:
        # Update the JSON file
        if os.path.exists('expense_data.json'):
            with open('expense_data.json', 'r') as json_file:
                existing_data = json.load(json_file)
                # Remove the deleted item from the existing data
                existing_data["expense"] = [item for item in existing_data["expense"] if
                                            item["category"] != category_name or item["user_id"] != user_id]
            with open('expense_data.json', 'w') as json_file:
                json.dump(existing_data, json_file)

        return jsonify({'message': 'Item deleted successfully'})
    else:
        return jsonify({'error': 'Item not found'})

# route to update the income
@app.route('/update_income', methods=['POST'])
def update_income():
    # Extract income data from the request
    user_id = request.json.get('user_id')  # Retrieve the user ID from the request
    category = request.json.get('category')  # Retrieve the category from the request
    new_amount = request.json.get('amount')  # Retrieve the new amount from the request

    # Update the item in the database
    income_item = sessions.query(income).filter_by(category=category, userid=user_id).first()
    if income_item:
        income_item.amount = new_amount  # Update the amount of the income item
        sessions.commit()  # Commit the changes to the database

        # Update the JSON file
        if os.path.exists('income_data.json'):  # Check if the JSON file exists
            with open('income_data.json', 'r') as json_file:
                existing_data = json.load(json_file)
                
                for item in existing_data["income"]:
                    if item["category"] == category and item["user_id"] == user_id:
                        item["amount"] = new_amount  # Update the amount in the existing data
                        break
            with open('income_data.json', 'w') as json_file:
                json.dump(existing_data, json_file)  # Save the updated data back to the JSON file

        return jsonify({'message': 'Income updated successfully'})
    else:
        return jsonify({'error': 'Income not found'})

# route to delete the expense
@app.route('/update_expense', methods=['POST'])
def update_expense():
    # Extract data from the request
    user_id = request.json.get('user_id')  # Retrieve the user ID from the request
    category = request.json.get('category')  # Retrieve the category from the request
    new_amount = request.json.get('amount')  # Retrieve the new amount from the request

    # Update the item in the database
    expense_item = sessions.query(expense).filter_by(category=category, userid=user_id).first()
    if expense_item:
        expense_item.amount = new_amount  # Update the amount of the expense item
        sessions.commit()  # Commit the changes to the database

        # Update the JSON file
        if os.path.exists('expense_data.json'):  # Check if the JSON file exists
            with open('expense_data.json', 'r') as json_file:
                existing_data = json.load(json_file)
                
                for item in existing_data["expense"]:
                    if item["category"] == category and item["user_id"] == user_id:
                        item["amount"] = new_amount  # Update the amount in the existing data
                        break
            with open('expense_data.json', 'w') as json_file:
                json.dump(existing_data, json_file)  # Save the updated data back to the JSON file

        return jsonify({'message': 'Expense updated successfully'})
    else:
        return jsonify({'error': 'Expense not found'})

if __name__ == "__main__":
    app.run(debug=True)