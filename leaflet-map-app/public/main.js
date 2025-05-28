import { initializeMap } from './map.js';
import { renderPins } from './pins.js';
import { fetchPins, deletePin, addPin } from './api.js';
import { createPinFormPopup } from './ui.js';

const map = initializeMap();
let allPins = [];

// --- Load and display existing pins from the backend ---
fetchPins().then(data => {
  allPins = data;
  renderPins(allPins, map, allPins, (newPins) => { allPins = newPins; }, handleDeletePin);
});

// --- Search and filter pins ---
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

if (searchForm && searchInput) {
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const term = searchInput.value.trim().toLowerCase();
    const filtered = allPins.filter(pin =>
      (pin.name && pin.name.toLowerCase().includes(term)) ||
      (pin.note && pin.note.toLowerCase().includes(term)) ||
      (pin.difficulty && pin.difficulty.toLowerCase().includes(term))
    );
    renderPins(filtered, map, allPins, (newPins) => { allPins = newPins; }, handleDeletePin);
  });
}

// --- Add new pin on map click ---
map.on('click', function (e) {
  const { lat, lng } = e.latlng;
  const popupContent = createPinFormPopup(lat, lng);
  const popup = L.popup().setLatLng([lat, lng]).setContent(popupContent).openOn(map);
  document.getElementById('submitPin').addEventListener('click', function () {
    const form = document.getElementById('pinForm');
    const formData = new FormData(form);
    formData.append('lat', lat);
    formData.append('lng', lng);
    addPin(formData)
      .then(data => {
        allPins.push(data);
        renderPins(allPins, map, allPins, (newPins) => { allPins = newPins; }, handleDeletePin);
      })
      .catch(err => console.error('Error:', err));
  });
});

function handleDeletePin(id) {
  deletePin(id)
    .then(result => {
      if (result.success) {
        allPins = allPins.filter(p => p.id !== id);
        renderPins(allPins, map, allPins, (newPins) => { allPins = newPins; }, handleDeletePin);
      } else {
        alert(result.error || 'Failed to delete pin.');
      }
    })
    .catch(err => alert('Error deleting pin: ' + err));
}