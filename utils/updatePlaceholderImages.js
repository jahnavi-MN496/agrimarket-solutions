const mongoose = require('mongoose');
const Product = require('../models/Product');
const placeholderUrl = 'https://via.placeholder.com/400x300?text=Product';
const defaultImageUrl = 'https://res.cloudinary.com/demo/image/upload/v1710000000/no-image-available.png'; // Use your own Cloudinary or static image URL

async function updatePlaceholderImages() {
    await mongoose.connect('mongodb://127.0.0.1:27017/agrimarket', { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000 });
    const products = await Product.find({ image: placeholderUrl });
    if (products.length === 0) {
        console.log('No products found with placeholder image.');
    } else {
        for (const product of products) {
            product.image = defaultImageUrl;
            await product.save();
            console.log(`Updated product: ${product.name}`);
        }
        console.log(`Updated ${products.length} products with default image.`);
    }
    await mongoose.connection.close();
}

if (require.main === module) {
    updatePlaceholderImages().then(() => {
        console.log('Done updating placeholder images.');
        process.exit(0);
    });
} 