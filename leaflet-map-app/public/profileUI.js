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
