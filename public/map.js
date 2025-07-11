// map.js
// Handles map initialization, events, and map-related logic

export function initializeMap() {
  const map = L.map('map').setView([43.825386, -111.792824], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  return map;
}
