const mongoose = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { faker } = require('@faker-js/faker');
const Vendor = require('../models/Vendor');
const config = require('../config/database');

const products = [
    {
        name: "Fresh Tomatoes",
        image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop",
        category: "Vegetables",
        price: 2.50,
        available: true,
        description: "Fresh, ripe tomatoes perfect for salads and cooking",
        stock: 50,
        vendor: "Green Valley Farms"
    },
    {
        name: "Organic Apples",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop",
        category: "Fruits",
        price: 3.99,
        available: true,
        description: "Sweet and crisp organic apples",
        stock: 30,
        vendor: "Sunny Orchard"
    },
    {
        name: "Fresh Milk",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop",
        category: "Dairy",
        price: 4.50,
        available: true,
        description: "Pure, fresh milk from local farms",
        stock: 25,
        vendor: "Dairyland Co-op"
    },
    {
        name: "Whole Wheat Bread",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
        category: "Bakery",
        price: 2.99,
        available: false,
        description: "Freshly baked whole wheat bread",
        stock: 0,
        vendor: "Baker's Delight"
    },
    {
        name: "Fresh Cheese",
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop",
        category: "Dairy",
        price: 6.99,
        available: true,
        description: "Aged cheddar cheese",
        stock: 20,
        vendor: "Dairyland Co-op"
    },
    {
        name: "Artisan Bread",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
        category: "Bakery",
        price: 4.25,
        available: true,
        description: "Freshly baked artisan bread",
        stock: 15,
        vendor: "Baker's Delight"
    },
    {
        name: "Brown Rice",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
        category: "Grains",
        price: 3.25,
        available: true,
        description: "Nutritious whole grain brown rice",
        stock: 40,
        vendor: "Healthy Harvest"
    },
    {
        name: "Red Chili Powder",
        image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&fit=crop",
        category: "Spices",
        price: 1.99,
        available: true,
        description: "Pure and spicy red chili powder",
        stock: 60,
        vendor: "Spice World"
    },
    {
        name: "Bananas",
        image: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?w=400&h=300&fit=crop",
        category: "Fruits",
        price: 1.50,
        available: true,
        description: "Fresh and sweet bananas",
        stock: 80,
        vendor: "Tropical Farms"
    },
    {
        name: "Spinach",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop",
        category: "Vegetables",
        price: 2.00,
        available: true,
        description: "Fresh green spinach leaves",
        stock: 35,
        vendor: "Green Valley Farms"
    },
    {
        name: "Paneer (Cottage Cheese)",
        image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&fit=crop",
        category: "Dairy",
        price: 5.50,
        available: true,
        description: "Soft and fresh paneer",
        stock: 22,
        vendor: "Dairyland Co-op"
    },
    {
        name: "Multigrain Bread",
        image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&fit=crop",
        category: "Bakery",
        price: 3.75,
        available: true,
        description: "Healthy multigrain bread loaf",
        stock: 18,
        vendor: "Baker's Delight"
    },
    {
        name: "Basmati Rice",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
        category: "Grains",
        price: 4.00,
        available: true,
        description: "Premium long-grain basmati rice",
        stock: 55,
        vendor: "Healthy Harvest"
    },
    {
        name: "Turmeric Powder",
        image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&fit=crop",
        category: "Spices",
        price: 2.25,
        available: true,
        description: "Organic turmeric powder",
        stock: 45,
        vendor: "Spice World"
    },
    {
        name: "Carrots",
        image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&fit=crop",
        category: "Vegetables",
        price: 2.10,
        available: true,
        description: "Crunchy and sweet carrots",
        stock: 38,
        vendor: "Green Valley Farms"
    },
    {
        name: "Grapes",
        image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&fit=crop",
        category: "Fruits",
        price: 3.60,
        available: true,
        description: "Juicy seedless grapes",
        stock: 28,
        vendor: "Sunny Orchard"
    },
    {
        name: "Wheat Flour",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
        category: "Grains",
        price: 2.80,
        available: true,
        description: "Finely milled wheat flour",
        stock: 65,
        vendor: "Healthy Harvest"
    },
    {
        name: "Cinnamon Sticks",
        image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&fit=crop",
        category: "Spices",
        price: 3.10,
        available: true,
        description: "Aromatic cinnamon sticks",
        stock: 33,
        vendor: "Spice World"
    }
];

const seedProducts = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://127.0.0.1:27017/agrimarket', { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000 });
        console.log('MongoDB connected successfully!');
        await Product.deleteMany({});
        await Review.deleteMany({});
        console.log('Existing products and reviews cleared.');
        const insertedProducts = await Product.insertMany(products);
        console.log(`${insertedProducts.length} products inserted successfully!`);
        for (const product of insertedProducts) {
            const numReviews = Math.floor(Math.random() * 3) + 2;
            const reviewIds = [];
            for (let i = 0; i < numReviews; i++) {
                const review = await Review.create({
                    product: product._id,
                    reviewer: faker.person.firstName() + ' ' + faker.person.lastName(),
                    rating: Math.floor(Math.random() * 5) + 1,
                    comment: faker.lorem.sentences(Math.floor(Math.random() * 2) + 1),
                    createdAt: faker.date.past(1)
                });
                reviewIds.push(review._id);
            }
            product.reviews = reviewIds;
            await product.save();
        }
        console.log('Random reviews inserted and linked for all products!');
        await mongoose.connection.close();
        console.log('Database connection closed.');
        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

async function updateVendorRoles() {
    await mongoose.connect(config.mongoURI || 'mongodb://localhost:27017/agrimarket');
    const result = await Vendor.updateMany({ role: { $exists: false } }, { $set: { role: 'vendor' } });
    console.log('Vendors updated:', result.modifiedCount);
    mongoose.disconnect();
}

if (require.main === module) {
    updateVendorRoles().then(() => {
        console.log('Done updating vendor roles.');
        process.exit(0);
    });
}

seedProducts(); 