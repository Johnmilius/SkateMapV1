// Handles login form logic and user authentication
// login.js
import { fetchProfiles } from './profileApi.js';

const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');

loginForm.onsubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const email = document.getElementById('loginEmail').value.trim();
  const profiles = await fetchProfiles();
  const user = profiles.find(p => p.username === username && p.email === email);
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    loginStatus.style.color = 'green';
    loginStatus.textContent = 'Login successful! Redirecting...';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } else {
    loginStatus.style.color = 'red';
    loginStatus.textContent = 'Invalid username or email.';
  }
};
