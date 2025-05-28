// pins.js
// Handles rendering pins, adding/removing markers, and pin popups

export let markers = [];

export function clearMarkers(map) {
  markers.forEach(marker => {
    map.removeLayer(marker);
    if (marker._icon) marker._icon.remove();
    if (marker._shadow) marker._shadow.remove();
  });
  markers = [];
}

export function renderPins(pins, map, allPins, setAllPins, onDelete) {
  clearMarkers(map);
  pins.forEach((pin) => {
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
    const marker = L.marker([pin.lat, pin.lng])
      .addTo(map)
      .bindPopup(popupContent);
    marker.on('click', function() {
      const offsetLat = pin.lat + 0.010;
      map.setView([offsetLat, pin.lng], map.getZoom(), { animate: true });
    });
    marker.on('popupopen', function() {
      const btn = document.querySelector('.delete-pin-btn[data-id="' + pin.id + '"]');
      if (btn) {
        btn.onclick = function() {
          onDelete(pin.id);
        };
      }
    });
    markers.push(marker);
  });
}
