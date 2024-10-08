require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { MongoClient } = require('mongodb');
const vision = require('@google-cloud/vision');

const app = express();
const upload = multer({ dest: 'uploads/' });

// MongoDB setup
const uri = process.env.MONGODB_URI;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Google Cloud Vision setup
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, '../config', 'google-cloud-vision-credentials.json')
});

async function connectToDatabase() {
  try {
    await mongoClient.connect();
    console.log("Connected successfully to MongoDB");
    return mongoClient.db("workout_tracker");
  } catch (e) {
    console.error("Could not connect to MongoDB", e);
    process.exit(1);
  }
}

function processOCRResults(fullTextAnnotation) {
  const text = fullTextAnnotation.text;
  // Define regex patterns for each field
  const patterns = {
    date: /Date:\s*(\d{2}\/\d{2}\/\d{4})/,
    workoutType: /Workout Type:\s*(\w+)/,
    exercises: /Exercises:(.*?)Performance Metrics:/s,
    performanceMetrics: /Performance Metrics:(.*?)Athlete's Notes:/s,
    athleteNotes: /Athlete's Notes:(.*?)Recovery Notes:/s,
    recoveryNotes: /Recovery Notes:(.*)/s
  };

  // Extract data using regex
  const extractedData = {};
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    extractedData[key] = match ? match[1].trim() : null;
  }

  // Additional processing (e.g., parsing exercises into an array)
  if (extractedData.exercises) {
    extractedData.exercises = extractedData.exercises.split(',').map(exercise => exercise.trim());
  }

  return extractedData;
}

async function storeWorkoutData(data) {
  const db = await connectToDatabase();
  const collection = db.collection("workouts");
  const result = await collection.insertOne(data);
  console.log(`Workout stored with id: ${result.insertedId}`);
  return result;
}

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Perform OCR
    const [result] = await visionClient.documentTextDetection(req.file.path);
    const fullTextAnnotation = result.fullTextAnnotation;

    // Process OCR results
    const processedData = processOCRResults(fullTextAnnotation);

    // Store processed data
    const storedResult = await storeWorkoutData(processedData);

    res.json({ message: 'Workout uploaded and stored successfully', id: storedResult.insertedId });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'An error occurred during processing' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoClient.close();
  process.exit(0);
});
