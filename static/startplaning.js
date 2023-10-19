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
      
      const editbutton = document.createElement("button");
      editbutton.textContent = "Edit";
      editbutton.setAttribute('class', 'update');
      editbutton.setAttribute('name', 'update');

      

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
      incomeContainer.appendChild(editbutton);
      incomeContainer.appendChild(form);
      ulincome.appendChild(incomeContainer);
    });

    const incomepar = document.createElement('p');
    incomepar.innerHTML = "Total income: " + income_sum;
    document.body.appendChild(incomepar);

    fetch('/get_expensejson')
      .then(response => response.json())
      .then(expense_data => {
        const filteredExpenses = expense_data.expense.filter(expense => expense.user_id === wel_id);

        filteredExpenses.sort((a, b) => b.amount - a.amount);

        filteredExpenses.forEach(expense => {
          const li = document.createElement('li');
          li.textContent = `${expense.category} = ${expense.amount}`;
          expense_sum += expense.amount;
          
          ul.appendChild(li);
        });

        const paragraph = document.createElement('p');
        paragraph.innerHTML = "Total sum of your planned Expense: " + expense_sum;
        document.body.appendChild(paragraph);
        console.log('Expense sum:', expense_sum);

        const difference = income_sum - expense_sum;
        const differencepara = document.createElement('p');
        differencepara.innerHTML = "Available balance " + difference;
        document.body.appendChild(differencepara);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  })
  .catch(error => {
    console.error('Error:', error);
  });