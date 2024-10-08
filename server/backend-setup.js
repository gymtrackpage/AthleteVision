// Install necessary packages:
// npm init -y
// npm install express multer @google-cloud/vision


// Installing MongoDB
const { MongoClient } = require('mongodb');

// Connection string from MongoDB Atlas
const uri = "mongodb+srv://jdlee9900:yXTcINDnTt9JMlTT@gymtrack.o4ojt.mongodb.net/?retryWrites=true&w=majority&appName=gymtrack";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    const db = client.db("workout_tracker"); // You can name your database here
    return db;
  } catch (e) {
    console.error("Could not connect to MongoDB", e);
    process.exit(1);
  }
}

// Example function to store workout data
async function storeWorkoutData(data) {
  const db = await connectToDatabase();
  const collection = db.collection("workouts");
  const result = await collection.insertOne(data);
  console.log(`Workout stored with id: ${result.insertedId}`);
  return result;
}

// Don't forget to close the connection when your server shuts down
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});

// You can now use storeWorkoutData in your route handlers
// For example:
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // ... your existing OCR processing code ...
    const processedData = processOCRResults(fullTextAnnotation.text);
    await storeWorkoutData(processedData);
    res.json({ message: 'Workout uploaded and stored successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during processing' });
  }
});

// The rest of the code

const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const { processOCRResults } = require('./ocrProcessing');
const { storeWorkoutData } = require('./dataStorage');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Google Cloud Vision client
const client = new vision.ImageAnnotatorClient({
  keyFilename: 'path/to/your/google-cloud-credentials.json'
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Perform OCR
    const [result] = await client.documentTextDetection(req.file.path);
    const fullTextAnnotation = result.fullTextAnnotation;

    // Process OCR results
    const processedData = processOCRResults(fullTextAnnotation);

    // Store processed data
    const storedId = await storeWorkoutData(processedData);

    res.json({ message: 'Workout uploaded and stored successfully', id: storedId });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'An error occurred during processing' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// TODO: Implement these functions
function processOCRResults(text) {
  // Process the OCR text and extract structured data
  // This will be similar to the Python example provided earlier
}

async function storeWorkoutData(data) {
  // Store the processed data in your database
  // You'll need to set up a database connection (e.g., MongoDB, PostgreSQL)
}
