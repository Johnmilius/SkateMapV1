// Node.js/Express server for backend API routes and static file serving

const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Add at the top with other requires
const multer = require('multer'); // For handling file uploads
const bcrypt = require('bcrypt'); // For password hashing
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
  const { lat, lng, name, note, rating, difficulty, public: isPublic, userId } = req.body;
  let image = '';
  if (req.file) {
    // Store the relative path to the uploaded image
    image = '/uploads/' + req.file.filename;
  }
  // Parse lat/lng as numbers
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  // Parse rating as number if present
  const ratingNum = rating !== undefined && rating !== '' ? Number(rating) : undefined;
  // Parse isPublic as boolean
  const publicBool = isPublic === 'true' || isPublic === true;
  if (!isNaN(latNum) && !isNaN(lngNum)) {
    const newPin = {
      id: uuidv4(),
      lat: latNum,
      lng: lngNum,
      name,
      image,
      note,
      rating: ratingNum,
      difficulty,
      public: publicBool,
      userId: userId || null
    };
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

// PATCH: Update a pin's public/private status
app.patch('/api/pins/:id', (req, res) => {
  const id = req.params.id;
  const { public: isPublic } = req.body;
  const pin = pinpoints.find(pin => pin.id === id);
  if (pin && typeof isPublic === 'boolean') {
    pin.public = isPublic;
    try {
      fs.writeFileSync(pinsFilePath, JSON.stringify(pinpoints, null, 2));
      res.status(200).json({ success: true, pin });
    } catch (error) {
      console.error('Error updating pin in pins.json:', error);
      res.status(500).json({ error: 'Failed to update pin' });
    }
  } else {
    res.status(400).json({ error: 'Invalid pin id or public value' });
  }
});

// Profiles functionality
const profilesFilePath = path.join(__dirname, 'profiles.json');

// Get all profiles
app.get('/api/profiles', (req, res) => {
  if (fs.existsSync(profilesFilePath)) {
    const profiles = JSON.parse(fs.readFileSync(profilesFilePath, 'utf-8'));
    res.json(profiles);
  } else {
    res.json([]);
  }
});

// Create a new profile
app.post('/api/profiles', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }
  let profiles = [];
  if (fs.existsSync(profilesFilePath)) {
    profiles = JSON.parse(fs.readFileSync(profilesFilePath, 'utf-8'));
  }
  // Check for duplicate username or email
  if (profiles.some(p => p.username === username || p.email === email)) {
    return res.status(409).json({ error: 'Username or email already exists.' });
  }
  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);
  const newProfile = { id: uuidv4(), username, email, password: hashedPassword };
  profiles.push(newProfile);
  fs.writeFileSync(profilesFilePath, JSON.stringify(profiles, null, 2));
  res.status(201).json({ id: newProfile.id, username: newProfile.username, email: newProfile.email });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  let profiles = [];
  if (fs.existsSync(profilesFilePath)) {
    profiles = JSON.parse(fs.readFileSync(profilesFilePath, 'utf-8'));
  }
  const user = profiles.find(p => p.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  // Do not send password back
  const { password: pw, ...userSafe } = user;
  res.json(userSafe);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});