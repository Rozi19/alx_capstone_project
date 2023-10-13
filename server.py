from flask import Flask, render_template, request, redirect, url_for, session
from model import user, income, expense
from connection import sessions, database
from sqlalchemy import select

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SESSION_TYPE'] = 'filesystem'

@app.route("/")
def home():
    return render_template("home.html")


@app.route("/createaccount", methods=["GET", "POST"])
def createaccount():
    
    fname = request.form['fname']
    lname = request.form['lname']
    email = request.form['email']
    password = request.form['psw']
    users = user(fname, lname, email, password)

    sessions.add(users)
    sessions.commit()

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
                return redirect(url_for('welcome'))
            else:
                return render_template('login.html', error="Invalis email or password please enter agin ")
    elif "create_button" in request.form:
        return redirect(url_for('createaccount'))

    return render_template("login.html")

@app.route("/logout")
def logout():
    #logout_user()
    return redirect(url_for("home"))

@app.route("/welcome.html")
def welcome():
    userid = session.get('user_id')
    name = session.get('fname')
    return render_template("welcome.html", name=name, id=userid)
@app.route("/startplaning.html", methods=["GET", "POST"])
def startplaning():

    user_id = session.get('user_id')
    name = session.get('fname')

    if 'income_button' in request.form:

        category = request.form['income_category']
        amount = request.form['amount']
        incomes = income(user_id, category, amount) 

        sessions.add(incomes)
        sessions.commit()
    elif 'expense_button' in request.form:

        category_e = request.form['expense_category']
        amount_e = request.form['amount_expense'] 
        expenses = expense(user_id, category_e, amount_e)

        sessions.add(expenses)
        sessions.commit()

    return render_template("startplaning.html", name=name)
    
if __name__ == "__main__":
    app.run(debug=True)

