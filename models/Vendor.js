const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const vendorSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    role: { type: String, default: 'vendor' },
    // password will be handled by passport-local-mongoose
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    customers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }]
}, { timestamps: true });

vendorSchema.plugin(passportLocalMongoose); // adds username, hash, salt, and auth methods

module.exports = mongoose.model('Vendor', vendorSchema); 