require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  { name: 'boAt Wave Smartwatch', category: 'Electronics', subcategory: 'Devices', price: 1999, oldPrice: 2499, discount: 20, rating: 4.6, reviews: 1256, badge: '20% OFF', featured: true, stock: 30, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80', description: 'Smartwatch with fitness tracking and notifications.' },
  { name: 'Red Tape Sneakers', category: 'Fashion', subcategory: 'Clothing', price: 1699, oldPrice: 1999, discount: 15, rating: 4.5, reviews: 980, badge: '15% OFF', featured: true, stock: 25, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80', description: 'Comfortable everyday sneakers.' },
  { name: 'Sony WH-CH520 Headphones', category: 'Electronics', subcategory: 'Devices', price: 3599, oldPrice: 3999, discount: 10, rating: 4.7, reviews: 2145, badge: '10% OFF', featured: true, stock: 18, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80', description: 'Wireless headphones with long battery life.' },
  { name: 'Redmi 13C (128GB)', category: 'Mobiles', subcategory: 'Smartphones', price: 9499, oldPrice: 10999, discount: 14, rating: 4.4, reviews: 3210, featured: true, stock: 15, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=80', description: 'Affordable smartphone for everyday use.' },
  { name: 'Wild Stone Perfume', category: 'Beauty', subcategory: 'Care', price: 599, oldPrice: 799, discount: 25, rating: 4.3, reviews: 1102, featured: true, stock: 50, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80', description: 'Fresh fragrance for daily wear.' },
  { name: 'Safari Laptop Backpack', category: 'Bags', subcategory: 'Accessories', price: 899, oldPrice: 1299, discount: 30, rating: 4.5, reviews: 1667, featured: true, stock: 40, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80', description: 'Spacious backpack for laptop and accessories.' },
  { name: 'Samsung Galaxy Laptop', category: 'Laptops', subcategory: 'Computers', price: 52999, oldPrice: 59999, discount: 12, rating: 4.5, reviews: 645, stock: 10, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80', description: 'Slim laptop for work and study.' },
  { name: 'Canon Mirrorless Camera', category: 'Electronics', subcategory: 'Devices', price: 44999, oldPrice: 49999, discount: 10, rating: 4.8, reviews: 530, stock: 8, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80', description: 'High quality camera for photography.' },
  { name: 'Classic Sofa Set', category: 'Home & Living', subcategory: 'Furniture', price: 24999, oldPrice: 29999, discount: 17, rating: 4.4, reviews: 210, stock: 5, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80', description: 'Comfortable modern sofa set.' },
  { name: 'Premium Football', category: 'Sports', subcategory: 'Essentials', price: 799, oldPrice: 999, discount: 20, rating: 4.6, reviews: 742, stock: 22, image: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=700&q=80', description: 'Durable football for practice and matches.' },
  { name: 'Classic Notebook', category: 'Books', subcategory: 'Books & More', price: 299, oldPrice: 399, discount: 25, rating: 4.5, reviews: 300, stock: 100, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=80', description: 'Hardcover notebook for notes and journaling.' },
  { name: 'Cotton Polo T-Shirt', category: 'Fashion', subcategory: 'Clothing', price: 899, oldPrice: 1299, discount: 31, rating: 4.3, reviews: 850, stock: 45, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80', description: 'Comfortable cotton polo shirt.' }
];

(async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing in .env');
  await mongoose.connect(process.env.MONGODB_URI);
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);
  await mongoose.disconnect();
})();
