from connection import sessions, database
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from flask_login import LoginManager, login_required, login_user, logout_user, UserMixin
import json
from model import user, income, expense, spending
import os
from sqlalchemy import select

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SESSION_TYPE'] = 'filesystem'
login_manager = LoginManager()
login_manager.init_app(app)

class MyUserMixin(UserMixin):
    def get_id(self):
        return str(self.id)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

@login_manager.user_loader
def loader_user(user_id):
    return sessions.query(user).get(user_id)

@app.route("/")
def home():
    return render_template("home.html")

@app.route('/get_userjson')
def get_userjson():
    with open('user_data.json', 'r') as userjson_file:
        user_data = json.load(userjson_file)
    
    return jsonify(user_data)

@app.route('/get_incomejson')
def get_incomejson():
    with open('income_data.json', 'r') as incomejson_file:
        income_data = json.load(incomejson_file)
    
    return jsonify(income_data)

@app.route('/get_expensejson')
def get_json():
    with open('expense_data.json', 'r') as json_file:
        expense_data = json.load(json_file)

    return jsonify(expense_data)

@app.route('/get_spendjson')
def get_spendjson():
    with open('spend_data.json', 'r') as json_file:
        spend_data = json.load(json_file)

    return jsonify(spend_data)



@app.route("/createaccount", methods=["GET", "POST"])
def createaccount():

    if request.method == 'POST':

        fname = request.form['fname']
        lname = request.form['lname']
        email = request.form['email']
        password = request.form['psw']

        User = sessions.query(user).filter(user.email == email).first()
        if User:
            flash('Email address already exists')
            return redirect(url_for('login'))
        users = user(fname, lname, email, password)

        sessions.add(users)
        sessions.commit()

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
        return redirect(url_for('login'))

    return render_template("createaccount.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if "login_button" in request.form: 
        if request.method == 'POST':
            Email = request.form['email']
            Password = request.form['password']

            User = sessions.query(user).filter(user.email == Email).first()

            if User and User.password == Password:
                session['user_id'] = User.id
                session['fname'] = User.fname
                login_user(User)
                return redirect(url_for('welcome'))
            else:
                return render_template('login.html', error="Invalis email or password please enter agin ")

    return render_template("login.html")

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("home"))

@app.route("/welcome.html", methods=["GET", "POST"])
@login_required
def welcome():
    userid = session.get('user_id')
    name = session.get('fname')
    if "addspend" in request.form:
        if request.method == "POST":
            spend_category = request.form['spend_category']
            spend_amount = request.form['spend_amount']
            spend_date = request.form['spend_date']

            spend = spending(userid, spend_category, spend_amount, spend_date)
            sessions.add(spend)
            sessions.commit()
            spend_date = datetime.strptime(spend_date, '%Y-%m-%d')  # Parse the date string

            spend_date_str = spend_date.isoformat()  # Convert to string representation


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
    
    return render_template("welcome.html", name=name, id=userid)

@app.route("/startplaning.html", methods=["GET", "POST"])
@login_required
def startplaning():

    user_id = session.get('user_id')
    name = session.get('fname')

    if 'income_button' in request.form:

        category = request.form['income_category']
        amount = request.form['amount']
        incomes = income(user_id, category, amount) 

        sessions.add(incomes)
        sessions.commit()

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

        category_e = request.form['expense_category']
        amount_e = request.form['amount_expense'] 
        expenses = expense(user_id, category_e, amount_e)

        sessions.add(expenses)
        sessions.commit()

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

    return render_template("startplaning.html", id=user_id)
    
if __name__ == "__main__":
    app.run(debug=True)

