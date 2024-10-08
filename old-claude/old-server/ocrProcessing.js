const { TextAnnotation } = require('@google-cloud/vision').protos.google.cloud.vision.v1;

function processOCRResults(fullTextAnnotation) {
  // Assuming fullTextAnnotation is the full text from OCR
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

module.exports = { processOCRResults };
