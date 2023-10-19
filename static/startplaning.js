var welcomeMessage = document.getElementById("welcomeid").textContent;
var wel_id = parseInt(welcomeMessage.split(" ")[1]);
const ul = document.getElementById('expense');
const ulincome = document.getElementById('income');
console.log(wel_id);

let expense_sum = 0;
let income_sum = 0;

fetch('/get_incomejson')
  .then(response => response.json())
  .then(income_data => {
    const filterincome = income_data.income.filter(income => income.user_id === wel_id);
    filterincome.forEach(income => {
      const incomeContainer = document.createElement('div');
      incomeContainer.setAttribute('class', 'income_container');
      const li = document.createElement('li');
    
      li.textContent = `${income.category} = ${income.amount}`;
      income_sum += income.amount;

      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.setAttribute('class', 'edit');
      editButton.setAttribute('name', 'edit');
    
      editButton.addEventListener('click', function() {
        const incomeItem = this.parentNode;
        const amountText = incomeItem.querySelector('li');
        const currentAmount = parseFloat(amountText.textContent.split('=')[1].trim());
        const newAmount = prompt('Enter the new amount:', currentAmount);
    
        if (newAmount !== null && !isNaN(newAmount)) {
          const updatedAmount = parseFloat(newAmount);
          amountText.textContent = `${income.category} = ${updatedAmount}`;
          income_sum = income_sum - currentAmount + updatedAmount;
          console.log(updatedAmount);
          incomepar.innerHTML = 'Total income: ' + income_sum;
          // Send a request to the server to update the income data
          fetch('/update_income', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: wel_id, category: income.category, amount: updatedAmount })
          })
            .then(response => response.json())
            .then(result => {
              // Handle the response from the server if needed
              console.log(result);
            })
            .catch(error => {
              // Handle any errors that occurred during the request
              console.error('Error:', error);
            });
        }
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('class', 'delete');
      deleteButton.setAttribute('type', 'submit');

      const form = document.createElement('form');
      form.setAttribute('method', 'POST');
      form.setAttribute('action', '/delete_income');

      form.appendChild(deleteButton);

      deleteButton.addEventListener('click', function(event) {
        event.preventDefault();
        const incomeItem = this.parentNode.parentNode; // Get the parent element of the form (incomeContainer)
        const dataToDelete = incomeItem.querySelector('li').textContent; // Get the text content of the li element
        const amountToDelete = parseFloat(dataToDelete.split('=')[1].trim());

        console.log('Delete URL:', '/delete_income');
        fetch('/delete_income', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: dataToDelete, user_id: wel_id })
        })
          .then(response => response.json())
          .then(result => {
            // Handle the response from the server if needed
            console.log(result);
            // Remove the deleted item from the DOM
            incomeItem.remove();

            income_sum -= amountToDelete;
            incomepar.innerHTML = "Total income: " + income_sum;
            
          })
          .catch(error => {
            // Handle any errors that occurred during the request
            console.error('Error:', error);
          });
      });

      incomeContainer.appendChild(li);
      incomeContainer.appendChild(editButton);
      incomeContainer.appendChild(form);
      ulincome.appendChild(incomeContainer);
    });

    const incomepar = document.createElement('p');
    incomepar.innerHTML = "Total income: " + income_sum;
    document.body.appendChild(incomepar);

  })
  .catch(error => {
    console.error('Error:', error);
  });
fetch('/get_expensejson')
  .then(response => response.json())
  .then(expense_data => {
    const filteredExpenses = expense_data.expense.filter(expense => expense.user_id === wel_id);

    filteredExpenses.sort((a, b) => b.amount - a.amount);
    filteredExpenses.forEach(expense => {
      const expenseContainer = document.createElement('div');
      expenseContainer.setAttribute('class', 'expense_container');
      const li = document.createElement('li');
      li.textContent = `${expense.category} = ${expense.amount}`;
      expense_sum += expense.amount;

      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.setAttribute('class', 'edit');
      editButton.setAttribute('name', 'edit');

      editButton.addEventListener('click', function () {
        const expenseItem = this.parentNode;
        const amountText = expenseItem.querySelector('li');
        const currentAmount = parseFloat(amountText.textContent.split('=')[1].trim());
        const newAmount = prompt('Enter the new amount:', currentAmount);

        if (newAmount !== null && !isNaN(newAmount)) {
          const updatedAmount = parseFloat(newAmount);
          amountText.textContent = `${expense.category} = ${updatedAmount}`;
          expense_sum = expense_sum - currentAmount + updatedAmount;
          expensepar.innerHTML = 'Total expense: ' + expense_sum;

          // Send a request to the server to update the expense data
          fetch('/update_expense', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: wel_id, category: expense.category, amount: updatedAmount })
          })
            .then(response => response.json())
            .then(result => {
              // Handle the response from the server if needed
              console.log(result);
            })
            .catch(error => {
              // Handle any errors that occurred during the request
              console.error('Error:', error);
            });
        }
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('class', 'delete');
      deleteButton.setAttribute('type', 'submit');

      deleteButton.addEventListener('click', function (event) {
        event.preventDefault();
        const expenseContainer = this.parentNode;
        const dataToDelete = expenseContainer.querySelector('li').textContent;
        const amountToDelete = parseFloat(dataToDelete.split('=')[1].trim());

        fetch('/delete_expense', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: dataToDelete, user_id: wel_id })
        })
          .then(response => response.json())
          .then(result => {
            console.log(result);
            expenseContainer.remove();

            expense_sum -= amountToDelete;
            expensepar.innerHTML = 'Total expense: ' + expense_sum;
          })
          .catch(error => {
            console.error('Error:', error);
          });
      });

      expenseContainer.appendChild(li);
      expenseContainer.appendChild(editButton);
      expenseContainer.appendChild(deleteButton);
      ul.appendChild(expenseContainer);
    });
    const expensepar = document.createElement('p');
    expensepar.innerHTML = 'Total sum of your planned Expense: ' + expense_sum;
    document.body.appendChild(expensepar);

    const difference = income_sum - expense_sum;
    const differencepara = document.createElement('p');
    differencepara.innerHTML = 'Available balance: ' + difference;
    document.body.appendChild(differencepara);
  })
  .catch(error => {
    console.error('Error:', error);
  });