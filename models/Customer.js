const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const customerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1, min: 1 }
    }],
    lastName: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' }
}, { timestamps: true });

customerSchema.plugin(passportLocalMongoose); // adds username, hash, salt, and auth methods

module.exports = mongoose.model('Customer', customerSchema); 