const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  name: String,
  description: String,
  price: Number,
  image: String,
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
