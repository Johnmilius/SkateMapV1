const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Add at the top with other requires
const multer = require('multer'); // For handling file uploads
const app = express();
const PORT = 3000;

let pinpoints = []; // In-memory store

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    // Use a unique filename (timestamp + original name)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// Load pins from pins.json when the server starts
const pinsFilePath = path.join(__dirname, 'pins.json');

// Debugging log to check if pins.json is being read
console.log('Loading pins from:', pinsFilePath);
if (fs.existsSync(pinsFilePath)) {
  try {
    const fileContent = fs.readFileSync(pinsFilePath, 'utf-8');
    console.log('pins.json content:', fileContent);
    pinpoints = JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading or parsing pins.json:', error);
    pinpoints = []; // Fallback to an empty array if parsing fails
  }
} else {
  console.warn('pins.json file does not exist. Starting with an empty pinpoints array.');
}

// Get all pinpoints
app.get('/api/pins', (req, res) => {
  res.json(pinpoints);
});

// Add a new pinpoint
app.post('/api/pins', upload.single('image'), (req, res) => {
  const { lat, lng, name, note, rating, difficulty } = req.body;
  let image = '';
  if (req.file) {
    // Store the relative path to the uploaded image
    image = '/uploads/' + req.file.filename;
  }
  // Parse lat/lng as numbers
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (!isNaN(latNum) && !isNaN(lngNum)) {
    const newPin = { id: uuidv4(), lat: latNum, lng: lngNum, name, image, note, rating, difficulty };
    pinpoints.push(newPin);
    // Save the updated pinpoints array to pins.json
    try {
      fs.writeFileSync(pinsFilePath, JSON.stringify(pinpoints, null, 2));
      console.log('New pin saved to pins.json');
    } catch (error) {
      console.error('Error saving pin to pins.json:', error);
    }
    res.status(201).json(newPin);
  } else {
    res.status(400).json({ error: 'Invalid coordinates' });
  }
});

// Delete a pinpoint by id
app.delete('/api/pins/:id', (req, res) => {
  const id = req.params.id;
  const index = pinpoints.findIndex(pin => pin.id === id);
  if (index !== -1) {
    pinpoints.splice(index, 1);
    try {
      fs.writeFileSync(pinsFilePath, JSON.stringify(pinpoints, null, 2));
      console.log('Pin deleted from pins.json');
    } catch (error) {
      console.error('Error deleting pin from pins.json:', error);
    }
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid pin id' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});