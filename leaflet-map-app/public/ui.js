// Handles UI rendering and DOM manipulation for the app
// ui.js
// Handles UI helpers, popup creation, and form handling

export function createPinFormPopup(lat, lng) {
  return `
    <div style="width: 260px; padding: 10px; font-family: 'Segoe UI', Arial, sans-serif; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <h3 style="margin: 0 0 10px 0; font-size: 1.1em; color: #333;">Add a Pin</h3>
      <form id="pinForm" enctype="multipart/form-data">
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
        <input type="file" id="image" name="image" accept="image/*" style="width: 100%; padding: 7px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.97em;" />
        <textarea id="note" name="note" placeholder="Note" style="width: 100%; padding: 7px; margin-bottom: 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.97em; resize: vertical; min-height: 40px;"></textarea>
        <button type="button" id="submitPin" style="width: 100%; padding: 8px; background: #4CAF50; color: #fff; border: none; border-radius: 6px; font-size: 1em; cursor: pointer; transition: background 0.2s;">Submit</button>
      </form>
    </div>
  `;
}
