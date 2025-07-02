// Handles API requests for pins (fetching, creating, deleting, etc.)

// api.js
// Handles all API requests to the backend

export async function fetchPins() {
  const res = await fetch('/api/pins');
  return res.json();
}

export async function deletePin(id) {
  const res = await fetch('/api/pins/' + id, { method: 'DELETE' });
  return res.json();
}

export async function addPin(formData) {
  const res = await fetch('/api/pins', {
    method: 'POST',
    body: formData
  });
  return res.json();
}
