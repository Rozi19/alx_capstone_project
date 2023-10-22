// Selecting input elements from the DOM
const firstNameInput = document.querySelector('#fname');
const lastNameInput = document.querySelector('#lname');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#psw');
const confirmPasswordInput = document.querySelector('#cpsw');

// Selecting error message elements from the DOM
const firstNameErrorElement = document.querySelector('#fnameError');
const lastNameErrorElement = document.querySelector('#lnameError');
const emailErrorElement = document.querySelector('#emailError');
const passwordErrorElement = document.querySelector('#passwordError');
const confirmPasswordErrorElement = document.querySelector('#confirmPasswordError');

// Adding event listeners for input validation
firstNameInput.addEventListener('blur', validateFirstName);
lastNameInput.addEventListener('blur', validateLastName);
emailInput.addEventListener('blur', validateEmail);
passwordInput.addEventListener('blur', validatePassword);
confirmPasswordInput.addEventListener('input', validateConfirmPassword);

// Function to validate the first name input
function validateFirstName() {
  const firstName = firstNameInput.value.trim();

  if (!firstName) {
    showError(firstNameErrorElement, 'First Name cannot be blank.');
    return false;
  }

  showSuccess(firstNameErrorElement);
  return true;
}

// Function to validate the last name input
function validateLastName() {
  const lastName = lastNameInput.value.trim();

  if (!lastName) {
    showError(lastNameErrorElement, 'Last Name cannot be blank.');
    return false;
  }

  showSuccess(lastNameErrorElement);
  return true;
}

// Function to validate the email input
function validateEmail() {
  const email = emailInput.value.trim();

  if (!email) {
    showError(emailErrorElement, 'Email cannot be blank.');
    return false;
  }

  if (!isEmailValid(email)) {
    showError(emailErrorElement, 'Please enter a valid email address.');
    return false;
  }

  showSuccess(emailErrorElement);
  return true;
}

// Function to validate the password input
function validatePassword() {
  const password = passwordInput.value.trim();

  if (!password) {
    showError(passwordErrorElement, 'Password cannot be blank');
    return false;
  }

  if (!isPasswordSecure(password)) {
    showError(
      passwordErrorElement,
      'Password must have at least 8 characters that include at least 1 lowercase character, 1 uppercase character, 1 number, and 1 special character (!@#$%^&*)'
    );
    return false;
  }

  showSuccess(passwordErrorElement);
  return true;
}

// Function to validate the confirm password input
function validateConfirmPassword() {
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (!confirmPassword) {
    showError(confirmPasswordErrorElement, 'Confirm Password cannot be blank');
    return false;
  }

  if (password !== confirmPassword) {
    showError(confirmPasswordErrorElement, 'Passwords do not match');
    return false;
  }

  showSuccess(confirmPasswordErrorElement);
  return true;
}

// Helper function to check if an email is valid
function isEmailValid(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Helper function to check if a password is secure
function isPasswordSecure(password) {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
  return passwordPattern.test(password);
}

// Helper function to show an error message
function showError(errorElement, message) {
  errorElement.textContent = message;
  errorElement.style.color = 'red';
}

// Helper function to clear an error message
function showSuccess(errorElement) {
  errorElement.textContent = '';
}