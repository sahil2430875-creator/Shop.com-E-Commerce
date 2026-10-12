const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  subcategory: String,
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, min: 0 },
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  reviews: { type: Number, default: 0 },
  image: { type: String, required: true },
  badge: String,
  featured: { type: Boolean, default: false },
  description: String,
  stock: { type: Number, default: 20, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
