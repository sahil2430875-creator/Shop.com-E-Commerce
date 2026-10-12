require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI is not set. API will start, but database routes need MongoDB.');
    return false;
  }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'ShopZone API', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, search, featured, deal } = req.query;
    const filter = {};
    if (category && category !== 'All Categories') filter.category = new RegExp(`^${escapeRegExp(category)}$`, 'i');
    if (search) filter.$or = [
      { name: new RegExp(escapeRegExp(search), 'i') },
      { category: new RegExp(escapeRegExp(search), 'i') },
      { subcategory: new RegExp(escapeRegExp(search), 'i') }
    ];
    if (featured === 'true') filter.featured = true;
    if (deal === 'true') filter.discount = { $gt: 0 };

    const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Invalid product id' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items } = req.body;
    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      return res.status(400).json({ message: 'All customer fields are required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const ids = items.map(item => item.productId).filter(Boolean);
    const products = await Product.find({ _id: { $in: ids } });
    const map = new Map(products.map(p => [String(p._id), p]));

    const orderItems = items.map(item => {
      const product = map.get(String(item.productId));
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      const quantity = Math.max(1, Number(item.quantity) || 1);
      if (quantity > product.stock) throw new Error(`${product.name} has only ${product.stock} item(s) in stock.`);
      return { productId: product._id, name: product.name, price: product.price, quantity, image: product.image };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ customer, items: orderItems, total });

    await Promise.all(orderItems.map(item => Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })));
    res.status(201).json({ message: 'Order placed successfully', orderId: order._id, total });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order id' });
  }
});

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

connectDB().then(() => {
  app.listen(PORT, () => console.log(`ShopZone running at http://localhost:${PORT}`));
});
