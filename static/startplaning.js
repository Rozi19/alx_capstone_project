var welcomeMessage = document.getElementById("welcomeid").textContent;
var wel_id = parseInt(welcomeMessage.split(" ")[1]);
const ul = document.getElementById('expense');
const ulincome = document.getElementById('income')
console.log(wel_id);

let expense_sum = 0;
let income_sum = 0;
fetch('/get_incomejson')
  .then(response => response.json())
  .then(income_data => {
    const filterincome = income_data.income.filter(income => income.user_id === wel_id);
    filterincome.forEach(income => {
      const li = document.createElement('li');
      li.textContent = `${income.category} = ${income.amount}`;
      income_sum += income.amount;
      ulincome.appendChild(li);
    })
    const incomepar = document.createElement('p');
    incomepar.innerHTML = "Total income" + income_sum;
    document.body.appendChild(incomepar);
  })
  .catch(error => {
    console.error('Error:', error);
  });
fetch('/get_expensejson')
  .then(response => response.json())
  .then(expense_data => {
    const filteredExpenses = expense_data.expense.filter(expense => expense.user_id === wel_id);
    filteredExpenses.forEach(expense => {
      const li = document.createElement('li');
      li.textContent = `${expense.category} = ${expense.amount}`;
      expense_sum += expense.amount;
      ul.appendChild(li);
    });
  const paragraph = document.createElement('p');
  paragraph.innerHTML = "Total sum of your planned spending" + expense_sum;
  document.body.appendChild(paragraph);

  const difference = income_sum - expense_sum;
  const differencepara = document.createElement('p');
  differencepara.innerHTML = "you remain amount is " + difference;
  document.body.appendChild(differencepara);
  })
  .catch(error => {
    console.error('Error:', error);
  });

