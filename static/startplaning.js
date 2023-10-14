var welcomeMessage = document.getElementById("welcomeid").textContent;
var wel_id = welcomeMessage.split(" ")[1];

console.log(wel_id);

fetch('/get_json')
  .then(response => response.json())
  .then(data => {
    const jsonData = JSON.parse(data);
    // Process the JSON data
    console.log(jsonData);

    // Filter expenses based on user ID
    const userExpenses = jsonData.filter(expense => expense.user_id === wel_id);

    // Process the user's expenses
    console.log(userExpenses);

    // Print the amount and category on the page
    const expensesContainer = document.getElementById("expensesContainer");
    userExpenses.forEach(expense => {
      const expenseElement = document.createElement("p");
      expenseElement.textContent = `Category: ${expense.category}, Amount: ${expense.amount}`;
      expensesContainer.appendChild(expenseElement);
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });