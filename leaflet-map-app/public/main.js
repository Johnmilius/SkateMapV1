// Main entry point for initializing the app and handling global logic
import { initializeMap } from './map.js';
import { renderPins } from './pins.js';
import { fetchPins, deletePin, addPin } from './api.js';
import { createPinFormPopup } from './ui.js';
import { showLoggedInUserUI } from './profileUI.js';

const map = initializeMap();
let allPins = [];

// --- Load and display existing pins from the backend ---
let allProfiles = [];
fetch('/api/profiles')
  .then(res => res.json())
  .then(profiles => {
    allProfiles = profiles;
    return fetchPins();
  })
  .then(data => {
    allPins = data;
    renderPinsWithUser(allPins, map, allPins, (newPins) => { allPins = newPins; }, handleDeletePin, allProfiles);
  });

// --- Render pins with user info ---
function renderPinsWithUser(pins, map, allPins, setAllPins, onDelete, profiles) {
  // Map userId to username for quick lookup
  const userMap = {};
  profiles.forEach(p => { userMap[p.id] = p.username; });
  // Patch renderPins to add username to pin object
  const pinsWithUser = pins.map(pin => ({
    ...pin,
    username: pin.userId && userMap[pin.userId] ? userMap[pin.userId] : (pin.userId ? pin.userId : 'Anonymous')
  }));
  renderPins(pinsWithUser, map, allPins, setAllPins, onDelete);
}

// --- Search and filter pins ---
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const ratingFilter = document.getElementById('ratingFilter');
const difficultyFilter = document.getElementById('difficultyFilter');

if (searchForm && searchInput) {
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const term = searchInput.value.trim().toLowerCase();
    const ratingVal = ratingFilter ? ratingFilter.value : '';
    const difficultyVal = difficultyFilter ? difficultyFilter.value : '';
    const filtered = allPins.filter(pin => {
      const matchesTerm =
        (!term || (pin.name && pin.name.toLowerCase().includes(term)) ||
        (pin.note && pin.note.toLowerCase().includes(term)) ||
        (pin.difficulty && pin.difficulty.toLowerCase().includes(term)));
      const matchesRating = !ratingVal || (pin.rating && String(pin.rating) === ratingVal);
      const matchesDifficulty = !difficultyVal || (pin.difficulty && pin.difficulty === difficultyVal);
      return matchesTerm && matchesRating && matchesDifficulty;
    });
    renderPinsWithUser(filtered, map, allPins, (newPins) => { allPins = newPins; }, handleDeletePin, allProfiles);
  });
  // Update pins on dropdown change without submit
  [ratingFilter, difficultyFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', () => {
        searchForm.dispatchEvent(new Event('submit'));
      });
    }
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
    // Add public/private value from checkbox
    const publicPin = document.getElementById('publicPin');
    formData.append('public', publicPin && publicPin.checked ? 'true' : 'false');
    // Add userId if logged in
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.id) {
      formData.append('userId', user.id);
    }
    addPin(formData)
      .then(data => {
        return fetch('/api/profiles')
          .then(res => res.json())
          .then(profiles => {
            allProfiles = profiles;
            return fetchPins();
          })
          .then(data => {
            allPins = data;
            renderPinsWithUser(allPins, map, allPins, (newPins) => { allPins = newPins; }, handleDeletePin, allProfiles);
          });
      })
      .catch(err => console.error('Error:', err));
  });
});

function handleDeletePin(id) {
  deletePin(id)
    .then(result => {
      if (result.success) {
        allPins = allPins.filter(p => p.id !== id);
        renderPinsWithUser(allPins, map, allPins, (newPins) => { allPins = newPins; }, handleDeletePin, allProfiles);
      } else {
        alert(result.error || 'Failed to delete pin.');
      }
    })
    .catch(err => alert('Error deleting pin: ' + err));
}

// --- Show logged-in user info if available ---
// (Moved to showLoggedInUserUI in profileUI.js)

// Call after DOM is loaded to show logged-in user info
showLoggedInUserUI();

// --- Filter and display user's own pins ---
const myPinsBtn = document.getElementById('myPinsBtn');
if (myPinsBtn) {
  myPinsBtn.addEventListener('click', function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.id) {
      const myPins = allPins.filter(pin => pin.userId === user.id);
      renderPinsWithUser(myPins, map, allPins, (newPins) => { allPins = newPins; }, handleDeletePin, allProfiles);
    } else {
      alert('You must be logged in to view your pins.');
    }
  });
}

// --- Show all pins ---
const allPinsBtn = document.getElementById('allPinsBtn');
if (allPinsBtn) {
  allPinsBtn.addEventListener('click', function() {
    renderPinsWithUser(allPins, map, allPins, (newPins) => { allPins = newPins; }, handleDeletePin, allProfiles);
  });
}