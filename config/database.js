const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/agrimarket', {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        console.log('Please make sure MongoDB is running on your system.');
        console.log('You can start MongoDB with: mongod');
        process.exit(1);
    }
};

module.exports = connectDB; 