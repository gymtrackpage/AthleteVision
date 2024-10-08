const { MongoClient } = require('mongodb');

// Use your MongoDB connection string here
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function storeWorkoutData(data) {
  try {
    await client.connect();
    const database = client.db('workout_tracker');
    const workouts = database.collection('workouts');
    
    // Insert the data into the collection
    const result = await workouts.insertOne(data);
    console.log(`Workout stored with id: ${result.insertedId}`);
    return result.insertedId;
  } catch (error) {
    console.error('Error storing workout data:', error);
    throw error;
  } finally {
    await client.close();
  }
}

module.exports = { storeWorkoutData };
