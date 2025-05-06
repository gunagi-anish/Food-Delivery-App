const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');

async function addIsActiveToAllRestaurants() {
  try {
    await mongoose.connect('mongodb+srv://anishgunagi24:wQeqFV2I8qQo0vUu@cluster0.rq1thss.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'); // Change YOUR_DB_NAME if needed
    const result = await Restaurant.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log('Updated restaurants:', result);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

addIsActiveToAllRestaurants(); 