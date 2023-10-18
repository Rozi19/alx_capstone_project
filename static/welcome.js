var welcomeMessage = document.getElementById("welcomeid").textContent;
var wel_id = parseInt(welcomeMessage.split(" ")[1]);
const totalBudgetDiv = document.getElementById('total_budget');
const totalspending = document.getElementById('remaining_budget')
const budget_chart = document.getElementById("budget_chart");
const graph_budget = document.getElementById('graph');
const total = document.getElementById('budget');
const totalincome = document.getElementById('income');
const list_category = document.getElementById('dropdown');
const topthree = document.getElementById('highest');
const expanse_list = document.getElementById("expense")

let expense_sum = 0;
let spend_sum = 0;
let income_sum = 0;
let category_array = [];
let amount_array = [];

function randomColor() {
  // Generate random RGB values
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Return the random color in RGB format
  return `rgb(${r}, ${g}, ${b})`;
}


function category_list(data) {
  data.forEach(list => {
    const option = document.createElement('option');
    option.value = list.value;
    option.text = list.value;
    list_category.appendChild(option);
  });
}

fetch('/get_expensejson')
  .then(response => response.json())
  .then(expense_data => {
    const filteredExpenses = expense_data.expense.filter(expense => expense.user_id === wel_id);

    filteredExpenses.forEach(expense => {
      category_array.push(expense.category);
      amount_array.push(expense.amount);
      expense_sum += expense.amount;
    });

    const paragraph = document.createElement('p');
    paragraph.innerHTML = expense_sum;
    totalBudgetDiv.appendChild(paragraph);

    const paragraph1 = document.createElement('p');
    paragraph1.innerHTML = expense_sum;
    total.appendChild(paragraph1);

    new Chart(budget_chart, {
      type: "doughnut",
      data: {
        labels: category_array,
        datasets: [
          {
            backgroundColor: category_array.map(() => randomColor()),
            data: amount_array
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        responsive: false,
        title: {
          display: true,
          text: "Expense Tracker Graph"
        }
      }
    });

    const dropdownData = category_array.map(category => ({
      value: category,
      text: category
    }));
    category_list(dropdownData);

    fetch('/get_spendjson')
      .then(response => response.json())
      .then(spend_data => {
        const filterspend = spend_data.spending.filter(spend => spend.user_id === wel_id);

        // Create an object to store the similar spendings
        const similarspendings = {};

        filterspend.forEach(spend => {
          const category = spend.category;
          const amount = spend.amount;

          if (similarspendings.hasOwnProperty(category)) {
            // If the category already exists in the object, add the amount to the existing value
            similarspendings[category] += amount;
          } else {
            // If the category doesn't exist, create a new entry with the amount
            similarspendings[category] = amount;
          }
        });

        // Sort the similar spendings in descending order based on the total amount
        const sortedSpendings = Object.entries(similarspendings)
          .sort((a, b) => b[1] - a[1]);

        // Get the top three spendings
        const topThreeSpendings = sortedSpendings.slice(0, 3);

        topThreeSpendings.forEach(([category, amount]) => {
          spend_sum += amount;
          console.log(expense.amount)
          const spendItem = document.createElement('li');
          spendItem.innerHTML = `${category} = ${amount}`;
          topthree.appendChild(spendItem);
        });

        const paragraph2 = document.createElement('p');
        paragraph2.innerHTML = expense_sum - spend_sum;
        totalspending.appendChild(paragraph2);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
fetch('/get_incomejson')
  .then(response => response.json())
  .then(income_data => {
    const filterincome = income_data.income.filter(income => income.user_id === wel_id);
    filterincome.forEach(income => {
      income_sum += income.amount;
    });

    const incomepar = document.createElement('p');
    incomepar.innerHTML = income_sum;
    totalincome.appendChild(incomepar);
  })
  .catch(error => {
    console.error('Error:', error);
  });


  fetch('/get_expensejson')
  .then(response => response.json())
  .then(expense_data => {
    const filteredExpenses = expense_data.expense.filter(expense => expense.user_id === wel_id);

    // Get spending data
    fetch('/get_spendjson')
      .then(response => response.json())
      .then(spend_data => {
        const filteredSpending = spend_data.spending.filter(spend => spend.user_id === wel_id);

        // Iterate over expense data
        // Iterate over expense data
        filteredExpenses.forEach(expense => {
          const category = expense.category;
          const expenseAmount = expense.amount;
          const li = document.createElement('li');
          const spendingAmount = filteredSpending
            .filter(spend => spend.category === category)
            .reduce((total, spend) => total + spend.amount, 0);

          const remainingAmount = expenseAmount - spendingAmount;

          li.textContent = `${category} = ${expenseAmount} Spend: ${spendingAmount}, Remaining: ${remainingAmount}`;
          expanse_list.appendChild(li);

          // Check if spending exceeds expense plan
          if (spendingAmount > expenseAmount) {
            li.style.color = 'red'; // Change the color of the list item to red
          }
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  })
  .catch(error => {
    console.error('Error:', error);
  });