// Handles displaying user profile info and logout

document.addEventListener('DOMContentLoaded', async () => {
  const profileInfo = document.getElementById('profileInfo');
  const user = JSON.parse(localStorage.getItem('currentUser'));

  if (user) {
    profileInfo.innerHTML = `
      <div style="background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08);padding:20px 24px 24px 24px;max-width:650px;margin:24px auto 24px auto;">
        <h2 style="color:#e60023;font-family:'Bebas Neue','Montserrat',Arial,sans-serif;letter-spacing:1.5px;margin-bottom:8px;">Welcome, ${user.username}</h2>
      </div>
      <h3 style="color:#e60023;font-family:'Bebas Neue','Montserrat',Arial,sans-serif;letter-spacing:1px;margin-bottom:10px;">Your Pins</h3>
      <div style="overflow-x:auto;">
      <table id="userPinsTable" style="margin:0 auto;border-collapse:separate;border-spacing:0 10px;width:95%;max-width:700px;background:#fff;border-radius:18px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <thead>
          <tr style="background:#f9f9f9;border-radius:18px;">
            <th style="padding:10px 12px;border:none;border-radius:12px 0 0 12px;font-size:1em;color:#e60023;">Name</th>
            <th style="padding:10px 12px;border:none;font-size:1em;color:#e60023;">Note</th>
            <th style="padding:10px 12px;border:none;font-size:1em;color:#e60023;">Rating</th>
            <th style="padding:10px 12px;border:none;font-size:1em;color:#e60023;">Difficulty</th>
            <th style="padding:10px 12px;border:none;font-size:1em;color:#e60023;">Public</th>
            <th style="padding:10px 12px;border:none;border-radius:0 12px 12px 0;font-size:1em;color:#e60023;">Delete</th>
          </tr>
        </thead>
        <tbody id="userPinsBody"></tbody>
      </table>
      </div>
    `;
    // Fetch all pins and filter for this user
    const res = await fetch('/api/pins');
    const pins = await res.json();
    const userPins = pins.filter(pin => pin.userId === user.id);
    const tbody = document.getElementById('userPinsBody');
    if (userPins.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;background:#f6f6f6;border-radius:12px;">No pins found.</td></tr>';
    } else {
      tbody.innerHTML = userPins.map(pin => `
        <tr style="background:#f6f6f6;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
          <td style="padding:10px 12px;border:none;border-radius:12px 0 0 12px;font-weight:500;">${pin.name || ''}</td>
          <td style="padding:10px 12px;border:none;">${pin.note || ''}</td>
          <td style="padding:10px 12px;border:none;">${pin.rating || ''}</td>
          <td style="padding:10px 12px;border:none;">${pin.difficulty || ''}</td>
          <td style="padding:10px 12px;border:none;text-align:center;">
            <input type="checkbox" class="public-checkbox" data-pinid="${pin.id}" ${pin.public ? 'checked' : ''} style="width:20px;height:20px;cursor:pointer;" title="Toggle public/private">
          </td>
          <td style="padding:10px 12px;border:none;border-radius:0 12px 12px 0;text-align:center;">
            <button class="delete-pin-btn" data-pinid="${pin.id}" style="background:#e60023;color:#fff;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:0.98em;transition:background 0.2s;">Delete</button>
          </td>
        </tr>
      `).join('');
      // Add event listeners for delete buttons
      document.querySelectorAll('.delete-pin-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const pinId = e.target.getAttribute('data-pinid');
          if (confirm('Are you sure you want to delete this pin?')) {
            const res = await fetch(`/api/pins/${pinId}`, { method: 'DELETE' });
            if (res.ok) {
              e.target.closest('tr').remove();
            } else {
              alert('Failed to delete pin.');
            }
          }
        });
      });
      // Add event listeners for public/private checkboxes
      document.querySelectorAll('.public-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', async (e) => {
          const pinId = e.target.getAttribute('data-pinid');
          const isPublic = e.target.checked;
          const res = await fetch(`/api/pins/${pinId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public: isPublic })
          });
          if (!res.ok) {
            alert('Failed to update pin privacy.');
            e.target.checked = !isPublic; // revert
          }
        });
      });
    }
  } else {
    profileInfo.innerHTML = `<p>You are not logged in.</p>`;
    document.getElementById('logoutBtn').style.display = 'none';
  }

  // Place logout button below the table, styled and spaced
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.style.display = 'block';
  logoutBtn.style.margin = '32px auto 0 auto';
  logoutBtn.style.background = '#e60023';
  logoutBtn.style.color = '#fff';
  logoutBtn.style.border = 'none';
  logoutBtn.style.borderRadius = '10px';
  logoutBtn.style.padding = '14px 36px';
  logoutBtn.style.fontSize = '1.1em';
  logoutBtn.style.fontWeight = 'bold';
  logoutBtn.style.letterSpacing = '1px';
  logoutBtn.style.cursor = 'pointer';
  logoutBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
  logoutBtn.style.transition = 'background 0.2s';
  logoutBtn.onmouseover = () => { logoutBtn.style.background = '#b8001a'; };
  logoutBtn.onmouseout = () => { logoutBtn.style.background = '#e60023'; };

  logoutBtn.onclick = () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  };

  // Style and add hover effect to the back button in the header
  const backBtn = document.querySelector('header a[href="index.html"]');
  if (backBtn) {
    backBtn.style.transition = 'background 0.2s';
    backBtn.onmouseover = () => { backBtn.style.background = '#b8001a'; };
    backBtn.onmouseout = () => { backBtn.style.background = '#e60023'; };
  }
});
