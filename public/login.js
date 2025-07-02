// Handles login form logic and user authentication
// login.js
import { fetchProfiles } from './profileApi.js';

const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');

loginForm.onsubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  // Send login request to backend
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (res.ok) {
    const user = await res.json();
    localStorage.setItem('currentUser', JSON.stringify(user));
    loginStatus.style.color = 'green';
    loginStatus.textContent = 'Login successful! Redirecting...';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } else {
    const err = await res.json();
    loginStatus.style.color = 'red';
    loginStatus.textContent = err.error || 'Invalid username or password.';
  }
};
