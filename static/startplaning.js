// Getting the welcome message and extracting the user ID
var welcomeMessage = document.getElementById("welcomeid").textContent;
var wel_id = parseInt(welcomeMessage.split(" ")[1]);

// Selecting the expense and income list elements from the DOM
const ul = document.getElementById('expense');
const ulincome = document.getElementById('income');

console.log(wel_id);

// Initializing variables for expense and income sums
let expense_sum = 0;
let income_sum = 0;

// Fetching income data from the server
fetch('/get_incomejson')
  .then(response => response.json())
  .then(income_data => {
    // Filtering income data based on the user ID
    const filterincome = income_data.income.filter(income => income.user_id === wel_id);
    filterincome.forEach(income => {
      // Creating a container element for each income item
      const incomeContainer = document.createElement('div');
      incomeContainer.setAttribute('class', 'income_container');
      const li = document.createElement('li');
    
      // Setting the text content of the list item with income information
      li.textContent = `${income.category} = ${income.amount}`;
      income_sum += income.amount;

      // Creating an edit button for each income item
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.setAttribute('class', 'edit');
      editButton.setAttribute('name', 'edit');

      // Adding an event listener to the edit button
      editButton.addEventListener('click', function() {
        const incomeItem = this.parentNode;
        const amountText = incomeItem.querySelector('li');
        const currentAmount = parseFloat(amountText.textContent.split('=')[1].trim());
        const newAmount = prompt('Enter the new amount:', currentAmount);
    
        if (newAmount !== null && !isNaN(newAmount)) {
          const updatedAmount = parseFloat(newAmount);
          amountText.textContent = `${income.category} = ${updatedAmount}`;
          income_sum = income_sum - currentAmount + updatedAmount;

          // Updating the total income paragraph
          incomepar.innerHTML = 'Total income: ' + income_sum;

          // Sending a request to the server to update the income data
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

      // Creating a delete button and a form for each income item
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('class', 'delete');
      deleteButton.setAttribute('type', 'submit');

      const form = document.createElement('form');
      form.setAttribute('method', 'POST');
      form.setAttribute('action', '/delete_income');

      form.appendChild(deleteButton);

      // Adding an event listener to the delete button
      deleteButton.addEventListener('click', function(event) {
        event.preventDefault();
        const incomeItem = this.parentNode.parentNode; // Get the parent element of the form (incomeContainer)
        const dataToDelete = incomeItem.querySelector('li').textContent; // Get the text content of the li element
        const amountToDelete = parseFloat(dataToDelete.split('=')[1].trim());

        console.log('Delete URL:', '/delete_income');
        // Sending a request to the server to delete the income data
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

      // Appending the elements to the income container
      incomeContainer.appendChild(li);
      incomeContainer.appendChild(editButton);
      incomeContainer.appendChild(form);

      // Appending the income container to the income list
      ulincome.appendChild(incomeContainer);
    });

    // Creating a paragraph element for the total income
    const incomepar = document.createElement('p');
    incomepar.innerHTML = "Total income: " + income_sum;

    // Appending the total income paragraph to the document body
    document.body.appendChild(incomepar);

  })
  .catch(error => {
    // Handle any errors that occurred during the request
    console.error('Error:', error);
  });
  
// Fetching expense data from the server
fetch('/get_expensejson')
  .then(response => response.json())
  .then(expense_data => {
    // Filtering expense data based on the user ID
    const filteredExpenses = expense_data.expense.filter(expense => expense.user_id === wel_id);

    // Sorting the filtered expenses in descending order based on amount
    filteredExpenses.sort((a, b) => b.amount - a.amount);

    // Iterating through each filtered expense item
    filteredExpenses.forEach(expense => {
      // Creating a container element for each expense item
      const expenseContainer = document.createElement('div');
      expenseContainer.setAttribute('class', 'expense_container');
      const li = document.createElement('li');

      // Setting the text content of the list item with expense information
      li.textContent = `${expense.category} = ${expense.amount}`;
      expense_sum += expense.amount;

      // Creating an edit button for each expense item
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.setAttribute('class', 'edit');
      editButton.setAttribute('name', 'edit');

      // Adding an event listener to the edit button
      editButton.addEventListener('click', function () {
        const expenseItem = this.parentNode;
        const amountText = expenseItem.querySelector('li');
        const currentAmount = parseFloat(amountText.textContent.split('=')[1].trim());
        const newAmount = prompt('Enter the new amount:', currentAmount);

        if (newAmount !== null && !isNaN(newAmount)) {
          const updatedAmount = parseFloat(newAmount);
          amountText.textContent = `${expense.category} = ${updatedAmount}`;

          // Sending a request to the server to update the expense data
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
              expense_sum = expense_sum - currentAmount + updatedAmount;

              // Updating the total expense paragraph
              expensepar.innerHTML = 'Total expense: ' + expense_sum;

              // Updating the available balance paragraph
              differencepara.innerHTML = 'Available balance: ' + (income_sum - expense_sum);
            })
            .catch(error => {
              // Handle any errors that occurred during the request
              console.error('Error:', error);
            });
        }
      });

      // Creating a delete button for each expense item
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('class', 'delete');
      deleteButton.setAttribute('type', 'submit');

      // Adding an event listener to the delete button
      deleteButton.addEventListener('click', function (event) {
        event.preventDefault();
        const expenseContainer = this.parentNode;
        const dataToDelete = expenseContainer.querySelector('li').textContent;
        const amountToDelete = parseFloat(dataToDelete.split('=')[1].trim());

        // Sending a request to the server to delete the expense data
        fetch('/delete_expense', {
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
            expenseContainer.remove();

            expense_sum -= amountToDelete;

            // Updating the total expense paragraph
            expensepar.innerHTML = 'Total expense: ' + expense_sum;

            // Updating the available balance paragraph
            differencepara.innerHTML = 'Available balance: ' + (income_sum - expense_sum);
          })
          .catch(error => {
            // Handle any errors that occurred during the request
            console.error('Error:', error);
          });
      });

      // Appending the elements to the expense container
      expenseContainer.appendChild(li);
      expenseContainer.appendChild(editButton);
      expenseContainer.appendChild(deleteButton);

      // Appending the expense container to the expense list
      ul.appendChild(expenseContainer);
    });

    // Creating a paragraph element for the total expense
    const expensepar = document.createElement('p');
    expensepar.innerHTML = 'Total sum of your planned Expense: ' + expense_sum;

    // Appending the total expense paragraph to the document body
    document.body.appendChild(expensepar);

    // Calculating the difference between income and expense
    const difference = income_sum - expense_sum;

    // Creating a paragraph element for the available balance
    const differencepara = document.createElement('p');
    differencepara.innerHTML = 'Available balance: ' + difference;

   // Appending the available balance paragraph to the document body
    document.body.appendChild(differencepara);
  })
  .catch(error => {
    // Handling any errors that occurred during the fetch request
    console.error('Error:', error);
  });