// Handles user profile API requests (fetch, update, etc.)

// profileApi.js
// Handles API requests for user profiles

export async function fetchProfiles() {
  const res = await fetch('/api/profiles');
  return res.json();
}

export async function createProfile(profile) {
  const res = await fetch('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  return res.json();
}
