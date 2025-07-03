const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const config = require('../config/database');

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