// Handles user profile UI rendering and interactions
// profileUI.js
// Handles UI for creating and logging in profiles

export function renderProfileForm(onCreate, onLogin, profiles) {
  const container = document.createElement('div');
  container.id = 'profile-container';
  container.style.marginBottom = '20px';
  container.innerHTML = `
    <h2>Profile</h2>
    <form id="createProfileForm" style="margin-bottom:10px;">
      <input type="text" id="newUsername" placeholder="Username" required style="margin-right:5px;" />
      <input type="email" id="newEmail" placeholder="Email" required style="margin-right:5px;" />
      <button type="submit">Create Profile</button>
    </form>
    <form id="loginProfileForm">
      <select id="loginProfileSelect" required style="margin-right:5px;"></select>
      <button type="submit">Log In</button>
    </form>
    <div id="profileStatus" style="margin-top:8px;color:green;"></div>
  `;
  // Populate login dropdown
  const select = container.querySelector('#loginProfileSelect');
  profiles.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.username} (${p.email})`;
    select.appendChild(opt);
  });
  // Create profile handler
  container.querySelector('#createProfileForm').onsubmit = function(e) {
    e.preventDefault();
    const username = container.querySelector('#newUsername').value.trim();
    const email = container.querySelector('#newEmail').value.trim();
    onCreate({ username, email });
  };
  // Login handler
  container.querySelector('#loginProfileForm').onsubmit = function(e) {
    e.preventDefault();
    const id = select.value;
    onLogin(id);
  };
  return container;
}

// Show logged-in user info and show My Profile button
export function showLoggedInUserUI() {
  const loginBtn = document.getElementById('loginBtn');
  const createAccountBtn = document.getElementById('createAccountBtn');
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (user && user.username) {
    // Prevent duplicate welcome message
    if (!document.getElementById('welcomeUser')) {
      const welcome = document.createElement('div');
      welcome.id = 'welcomeUser';
      welcome.style.position = 'absolute';
      welcome.style.top = '18px';
      welcome.style.left = '24px';
      welcome.style.background = '#fff';
      welcome.style.color = '#222';
      welcome.style.padding = '8px 18px';
      welcome.style.borderRadius = '8px';
      welcome.style.fontWeight = 'bold';
      welcome.style.border = '2px solid #4CAF50';
      welcome.style.letterSpacing = '1px';
      welcome.textContent = `Welcome, ${user.username}!`;
      // Add My Profile button
      const profileBtn = document.createElement('a');
      profileBtn.textContent = 'My Profile';
      profileBtn.href = 'profile.html';
      profileBtn.style.marginLeft = '16px';
      profileBtn.style.background = '#4CAF50';
      profileBtn.style.color = '#fff';
      profileBtn.style.border = 'none';
      profileBtn.style.borderRadius = '6px';
      profileBtn.style.padding = '6px 14px';
      profileBtn.style.fontWeight = 'bold';
      profileBtn.style.cursor = 'pointer';
      profileBtn.style.textDecoration = 'none';
      welcome.appendChild(profileBtn);
      document.body.appendChild(welcome);
    }
    if (loginBtn) loginBtn.style.display = 'none';
    if (createAccountBtn) createAccountBtn.style.display = 'none';
  }
}
