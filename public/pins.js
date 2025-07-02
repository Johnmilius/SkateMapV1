// pins.js
// Handles rendering pins, adding/removing markers, and pin popups

// Array to keep track of all marker objects currently on the map
export let markers = [];

// Removes all markers from the map and clears the markers array
export function clearMarkers(map) {
  markers.forEach(marker => {
    // Remove marker from the map
    map.removeLayer(marker);
    // Remove marker icon and shadow from the DOM if they exist
    if (marker._icon) marker._icon.remove();
    if (marker._shadow) marker._shadow.remove();
  });
  // Reset the markers array to empty
  markers = [];
}

/*
 * Renders all pins on the map as markers.
 * pins: Array of pin objects to display
 * map: Leaflet map instance
 * allPins: All pins in the app (for state management)
 * setAllPins: Function to update allPins state
 * onDelete: Callback function to handle deleting a pin
 */
export function renderPins(pins, map, allPins, setAllPins, onDelete) {
  // First, remove any existing markers
  clearMarkers(map);
  // Loop through each pin and create a marker
  pins.forEach((pin) => {
    // HTML content for the marker popup
    const popupContent = `
      <div>
        <h4 style='margin:0 0 6px 0;'>${pin.name || ''}</h4>
        <div style="font-size:0.95em; color:#555; margin-bottom:4px;">
          <span>By: ${pin.username ? pin.username : 'Anonymous'}</span>
        </div>
        <img src="${pin.image}" alt="Pin Image" style="width: 100%; height: auto;">
        <p>Rating: ${pin.rating} Stars</p>
        <p>Difficulty: ${pin.difficulty}</p>
        <p>${pin.note}</p>
        <button class="delete-pin-btn" data-id="${pin.id}" style="margin-top:8px; width:100%; background:#e74c3c; color:#fff; border:none; border-radius:6px; padding:6px; cursor:pointer;">Delete</button>
      </div>
    `;
    // Create a new marker at the pin's coordinates
    const marker = L.marker([pin.lat, pin.lng])
      .addTo(map)
      .bindPopup(popupContent);
    // When marker is clicked, pan the map slightly north for better popup visibility
    marker.on('click', function() {
      const offsetLat = pin.lat + 0.010;
      map.setView([offsetLat, pin.lng], map.getZoom(), { animate: true });
    });
    // When popup opens, attach delete button event handler
    marker.on('popupopen', function() {
      const btn = document.querySelector('.delete-pin-btn[data-id="' + pin.id + '"]');
      if (btn) {
        btn.onclick = function() {
          onDelete(pin.id);
        };
      }
    });
    // Add marker to the markers array for tracking
    markers.push(marker);
  });
}
