var welcomeMessage = document.getElementById("welcomeid").textContent;
var wel_id = parseInt(welcomeMessage.split(" ")[1]);
const totalBudgetDiv = document.getElementById('total_budget');
const budget_chart = document.getElementById("budget_chart");
const graph_budget = document.getElementById('graph');
const total = document.getElementById('budget');
const list_category = document.getElementById('dropdown');

let expense_sum = 0;
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
  })
      .catch(error => {
        console.error('Error:', error);
      });