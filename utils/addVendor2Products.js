const mongoose = require('mongoose');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const config = require('../config/database');

const vendorId = '6863b781acce02495401eac2';

const products = [
  {
    name: 'Fresh Apples',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    price: 2.99,
    stock: 100,
    available: true,
    description: 'Crisp and juicy apples, freshly picked.'
  },
  {
    name: 'Organic Bananas',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80',
    price: 1.99,
    stock: 120,
    available: true,
    description: 'Sweet organic bananas, perfect for snacking.'
  },
  {
    name: 'Carrots',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    price: 1.49,
    stock: 80,
    available: true,
    description: 'Crunchy and fresh carrots, great for salads.'
  },
  {
    name: 'Broccoli',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80',
    price: 2.29,
    stock: 60,
    available: true,
    description: 'Green broccoli florets, rich in nutrients.'
  },
  {
    name: 'Whole Milk',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    price: 3.49,
    stock: 50,
    available: true,
    description: 'Fresh whole milk from local farms.'
  },
  {
    name: 'Brown Eggs',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    price: 2.99,
    stock: 90,
    available: true,
    description: 'Farm-fresh brown eggs, rich in protein.'
  },
  {
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1509440159598-8b9b5cf1c2b6?auto=format&fit=crop&w=400&q=80',
    price: 2.49,
    stock: 70,
    available: true,
    description: 'Soft and healthy whole wheat bread.'
  },
  {
    name: 'Baguette',
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    price: 1.99,
    stock: 40,
    available: true,
    description: 'Classic French baguette, freshly baked.'
  },
  {
    name: 'Basmati Rice',
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    price: 4.99,
    stock: 100,
    available: true,
    description: 'Premium quality basmati rice.'
  },
  {
    name: 'Oats',
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80',
    price: 3.29,
    stock: 60,
    available: true,
    description: 'Healthy oats for breakfast.'
  },
  {
    name: 'Cinnamon Sticks',
    category: 'Spices',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    price: 2.59,
    stock: 30,
    available: true,
    description: 'Aromatic cinnamon sticks for flavor.'
  },
  {
    name: 'Black Pepper',
    category: 'Spices',
    image: 'https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80',
    price: 1.99,
    stock: 40,
    available: true,
    description: 'Whole black peppercorns.'
  },
  {
    name: 'Tomatoes',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    price: 1.79,
    stock: 110,
    available: true,
    description: 'Juicy red tomatoes, perfect for salads.'
  },
  {
    name: 'Cheddar Cheese',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80',
    price: 3.99,
    stock: 35,
    available: true,
    description: 'Sharp cheddar cheese, great for sandwiches.'
  },
  {
    name: 'Strawberries',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    price: 2.89,
    stock: 75,
    available: true,
    description: 'Sweet and fresh strawberries.'
  }
];

async function addProducts() {
  await mongoose.connect(config.mongoURI || 'mongodb://localhost:27017/agrimarket');
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    console.error('Vendor not found!');
    process.exit(1);
  }
  const createdProducts = await Product.insertMany(products.map(p => ({ ...p, vendor: vendorId })));
  vendor.products = vendor.products.concat(createdProducts.map(p => p._id));
  await vendor.save();
  console.log('Added products:', createdProducts.map(p => p.name));
  mongoose.disconnect();
}

if (require.main === module) {
  addProducts().then(() => {
    console.log('Done adding products for vendor2.');
    process.exit(0);
  });
} 