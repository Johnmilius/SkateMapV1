// Handles user account creation logic and form submission
// createAccount.js
import { createProfile } from './profileApi.js';

const form = document.getElementById('createAccountForm');
const statusDiv = document.getElementById('createStatus');

form.onsubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('createUsername').value.trim();
  const email = document.getElementById('createEmail').value.trim();
  const password = document.getElementById('createPassword').value;
  const passwordConfirm = document.getElementById('createPasswordConfirm').value;

  if (!username || !email || !password || !passwordConfirm) {
    statusDiv.textContent = 'All fields are required.';
    statusDiv.style.color = 'red';
    return;
  }
  if (password !== passwordConfirm) {
    statusDiv.textContent = 'Passwords do not match.';
    statusDiv.style.color = 'red';
    return;
  }
  // For now, store password in plain text (not secure, but matches current backend)
  // You should hash passwords in a real app!
  const result = await createProfile({ username, email, password });
  if (result.error) {
    statusDiv.textContent = result.error;
    statusDiv.style.color = 'red';
  } else {
    statusDiv.textContent = 'Account created! You can now log in.';
    statusDiv.style.color = 'green';
    form.reset();
  }
};
