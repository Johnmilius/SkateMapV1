// Initialize the Leaflet map and set the initial view to Rexburg, Idaho
const map = L.map('map').setView([43.825386, -111.792824], 14); // Center map on Rexburg

// Add OpenStreetMap tiles to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let allPins = []; // Store all pins fetched from the backend
let markers = []; // Store all marker objects currently on the map

// --- Load and display existing pins from the backend ---
fetch('/api/pins')
  .then(res => res.json())
  .then(data => {
    allPins = data; // Store all pins
    renderPins(allPins); // Render all pins on the map
  });
// --- Search and filter pins ---

// Function to render pins (markers) on the map
function renderPins(pins) {
  // Remove existing markers from the map
  markers.forEach(marker => {
    map.removeLayer(marker);
    if (marker._icon) marker._icon.remove(); // Remove marker icon from DOM
    if (marker._shadow) marker._shadow.remove(); // Remove marker shadow from DOM
  });
  markers = [];
  // For each pin, create a marker and bind a popup
  pins.forEach((pin) => {
    // Create the HTML content for the popup
    const popupContent = `
      <div>
        <h4 style='margin:0 0 6px 0;'>${pin.name || ''}</h4>
        <img src="${pin.image}" alt="Pin Image" style="width: 100%; height: auto;">
        <p>Rating: ${pin.rating} Stars</p>
        <p>Difficulty: ${pin.difficulty}</p>
        <p>${pin.note}</p>
        <button class="delete-pin-btn" data-id="${pin.id}" style="margin-top:8px; width:100%; background:#e74c3c; color:#fff; border:none; border-radius:6px; padding:6px; cursor:pointer;">Delete</button>
      </div>
    `;
    // Create a marker at the pin's coordinates
    const marker = L.marker([pin.lat, pin.lng])
      .addTo(map)
      .bindPopup(popupContent);
    // Center and zoom the map on marker when clicked, but offset lower so popup is fully visible
    marker.on('click', function() {
      // Calculate a point further north of the marker (move map center up more)
      const offsetLat = pin.lat + 0.010; // Increased offset for more space below
      map.setView([offsetLat, pin.lng], map.getZoom(), { animate: true });
    });
    // Add event listener for when the popup opens
    marker.on('popupopen', function() {
      // Find the delete button in the popup
      const btn = document.querySelector('.delete-pin-btn[data-id="' + pin.id + '"]');
      if (btn) {
        // When delete button is clicked, send DELETE request to backend
        btn.onclick = function() {
          fetch('/api/pins/' + pin.id, { method: 'DELETE' })
            .then(res => res.json())
            .then(result => {
              if (result.success) {
                // Remove the pin from allPins and re-render
                allPins = allPins.filter(p => p.id !== pin.id);
                renderPins(allPins);
              } else {
                alert(result.error || 'Failed to delete pin.');
              }
            })
            .catch(err => alert('Error deleting pin: ' + err));
        };
      }
    });
    // Add marker to the markers array
    markers.push(marker);
  });
  // Do NOT recenter or fitBounds here; just rerender pins in current map view
}

// Fetch all pins from the backend and render them
fetch('/api/pins')
  .then(res => res.json()) // Parse the JSON response
  .then(data => {
    allPins = data; // Store all pins
    renderPins(allPins); // Render all pins on the map
  });

// Get the search form and input elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
if (searchForm && searchInput) {
  // Listen for form submission (button click or Enter)
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page reload
    const term = searchInput.value.trim().toLowerCase(); // Get search term
    // Filter pins by name, note, or difficulty
    const filtered = allPins.filter(pin =>
      (pin.name && pin.name.toLowerCase().includes(term)) ||
      (pin.note && pin.note.toLowerCase().includes(term)) ||
      (pin.difficulty && pin.difficulty.toLowerCase().includes(term))
    );
    renderPins(filtered); // Render only filtered pins
  });
}

// --- Add new pin on map click ---
map.on('click', function (e) {
  const { lat, lng } = e.latlng; // Get the latitude and longitude of the click

  // Create a popup with a form for the user to enter pin details
  const popupContent = `
    <div style="width: 260px; padding: 10px; font-family: 'Segoe UI', Arial, sans-serif; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <h3 style="margin: 0 0 10px 0; font-size: 1.1em; color: #333;">Add a Pin</h3>
      <form id="pinForm">
        <input type="text" id="name" name="name" placeholder="Name" style="width: 100%; padding: 7px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.97em;" />
        <select id="rating" name="rating" style="width: 100%; padding: 7px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.97em;">
          <option value="" disabled selected>Rating</option>
          <option value="1">1 Star</option>
          <option value="2">2 Stars</option>
          <option value="3">3 Stars</option>
          <option value="4">4 Stars</option>
          <option value="5">5 Stars</option>
        </select>
        <select id="difficulty" name="difficulty" style="width: 100%; padding: 7px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.97em;">
          <option value="" disabled selected>Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Moderate">Moderate</option>
          <option value="Hard">Hard</option>
        </select>
        <input type="text" id="image" name="image" placeholder="Image URL" style="width: 100%; padding: 7px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.97em;" />
        <textarea id="note" name="note" placeholder="Note" style="width: 100%; padding: 7px; margin-bottom: 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.97em; resize: vertical; min-height: 40px;"></textarea>
        <button type="button" id="submitPin" style="width: 100%; padding: 8px; background: #4CAF50; color: #fff; border: none; border-radius: 6px; font-size: 1em; cursor: pointer; transition: background 0.2s;">Submit</button>
      </form>
    </div>
  `;

  // Show the form popup at the clicked location
  const popup = L.popup()
    .setLatLng([lat, lng])
    .setContent(popupContent)
    .openOn(map);

  // Handle form submission for the new pin
  document.getElementById('submitPin').addEventListener('click', function () {
    // Get values from the form fields
    const name = document.getElementById('name').value;
    const image = document.getElementById('image').value;
    const note = document.getElementById('note').value;
    const rating = document.getElementById('rating').value;
    const difficulty = document.getElementById('difficulty').value;

    // Send the new pin data to the backend
    fetch('/api/pins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, name, image, note, rating, difficulty })
    })
      .then(res => res.json())
      .then(data => {
        allPins.push(data); // ✅ Add to local storage
        // Add the new pin to the map with a styled popup
        const newPopupContent = `
          <div style="width: 260px; padding: 10px; font-family: 'Segoe UI', Arial, sans-serif; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h4 style='margin:0 0 8px 0; font-size: 1.1em; color: #333;'>${data.name || 'Un-named'}</h4>
            <img src="${data.image}" alt="Pin Image" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 0.97em; color: #555;">Rating: <b>${data.rating}</b> ⭐</span>
              <span style="font-size: 0.97em; color: #555;">Difficulty: <b>${data.difficulty}</b></span>
            </div>
            <div style="font-size: 0.97em; color: #444; border-top: 1px solid #eee; padding-top: 7px;">${data.note}</div>
          </div>
        `;
        L.marker([data.lat, data.lng])
          .addTo(map)
          .bindPopup(newPopupContent);
      })
      .catch(err => console.error('Error:', err));
  });
});