require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const connectDB = require('./config/database');
const Product = require('./models/Product');
const Review = require('./models/Review');
const session = require('express-session');
const passport = require('passport');
const Customer = require('./models/Customer');
const Vendor = require('./models/Vendor');
const LocalStrategy = require('passport-local').Strategy;
const Order = require('./models/Order');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'agrimarket_secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Make user available in all templates
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

passport.use('customer-local', new LocalStrategy(Customer.authenticate()));
passport.use('vendor-local', new LocalStrategy(Vendor.authenticate()));

passport.serializeUser(function(user, done) {
    done(null, { id: user.id, type: user instanceof Customer ? 'Customer' : 'Vendor' });
});
passport.deserializeUser(async function(obj, done) {
    if (obj.type === 'Customer') {
        const user = await Customer.findById(obj.id);
        done(null, user);
    } else {
        const user = await Vendor.findById(obj.id);
        done(null, user);
    }
});

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cloudinary config (add your credentials to .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agrimarket-products',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }]
    }
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
    res.redirect('/customer/products');
});

// Products API endpoint
app.get('/customer/products', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, vendor } = req.query;
        let filter = {};
        if (category && category !== 'all') filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        // Vendor name search
        if (vendor && vendor.trim() !== '') {
            const vendorDocs = await Vendor.find({ username: { $regex: vendor, $options: 'i' } }, '_id');
            const vendorIds = vendorDocs.map(v => v._id);
            filter.vendor = { $in: vendorIds };
        }
        const products = await Product.find(filter).populate('vendor').sort({ createdAt: -1 });
        const categories = await Product.distinct('category');
        res.render('products', {
            products,
            categories,
            filters: { category, minPrice, maxPrice, search, vendor }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).render('error', { message: 'Error loading products', error: error.message });
    }
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Profile page
app.get('/customer/profile', isLoggedIn, (req, res) => {
    res.render('profile', { user: req.user });
});

// Add to cart route
app.post('/customer/cart/add', isLoggedIn, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const user = await Customer.findById(req.user._id);
        const existingItem = user.cart.find(item => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += parseInt(quantity || 1);
        } else {
            user.cart.push({ product: productId, quantity: parseInt(quantity || 1) });
        }
        await user.save();
        res.redirect('back');
    } catch (err) {
        res.status(400).render('error', { message: 'Could not add to cart', error: err.message });
    }
});

// Cart page (user-based)
app.get('/customer/cart', isLoggedIn, async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: 'cart.product',
            populate: { path: 'vendor' }
        });
        const cartItems = user.cart.map(item => ({
            product: item.product,
            quantity: item.quantity
        }));
        res.render('cart', { cartItems });
    } catch (err) {
        res.status(500).render('error', { message: 'Error loading cart', error: err.message });
    }
});

// Update cart quantity
app.post('/customer/cart/update', isLoggedIn, async (req, res) => {
    try {
        const { productId, change } = req.body;
        const user = await Customer.findById(req.user._id);
        const item = user.cart.find(i => i.product.toString() === productId);
        if (item) {
            item.quantity += parseInt(change);
            if (item.quantity < 1) {
                user.cart = user.cart.filter(i => i.product.toString() !== productId);
            }
            await user.save();
        }
        res.redirect('/customer/cart');
    } catch (err) {
        res.status(400).render('error', { message: 'Could not update cart', error: err.message });
    }
});

// Delete cart item
app.post('/customer/cart/delete', isLoggedIn, async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await Customer.findById(req.user._id);
        user.cart = user.cart.filter(i => i.product.toString() !== productId);
        await user.save();
        res.redirect('/customer/cart');
    } catch (err) {
        res.status(400).render('error', { message: 'Could not delete cart item', error: err.message });
    }
});

// Place after cart routes
app.post('/customer/cart/pay', isLoggedIn, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const customer = await Customer.findById(req.user._id).populate('cart.product');
        const cartItem = customer.cart.find(item => item.product._id.toString() === productId);
        if (!cartItem || cartItem.quantity < quantity) {
            return res.status(400).render('error', { message: 'Invalid cart item or quantity', error: '' });
        }
        const product = await Product.findById(productId).populate('vendor');
        if (!product || !product.available || product.stock < quantity) {
            return res.status(400).render('error', { message: 'Product unavailable or out of stock', error: '' });
        }
        // Create order
        const order = new Order({
            customer: customer._id,
            items: [{
                product: product._id,
                vendor: product.vendor._id,
                quantity: quantity,
                price: product.price
            }],
            totalAmount: product.price * quantity,
            status: 'Pending'
        });
        await order.save();
        // Deduct stock
        product.stock -= quantity;
        await product.save();
        // Remove from cart
        customer.cart = customer.cart.filter(item => item.product._id.toString() !== productId);
        await customer.save();
        res.redirect(`/customer/orders/${order._id}`);
    } catch (err) {
        res.status(500).render('error', { message: 'Could not place order', error: err.message });
    }
});

// Pay for all cart items at once (single order, multiple items)
app.post('/customer/cart/payall', isLoggedIn, async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: 'cart.product',
            populate: { path: 'vendor' }
        });
        if (!customer.cart.length) {
            return res.status(400).render('error', { message: 'Your cart is empty', error: '' });
        }
        const orderItems = [];
        let totalAmount = 0;
        for (const item of customer.cart) {
            if (!item.product || !item.product.available || item.product.stock < item.quantity) continue;
            orderItems.push({
                product: item.product._id,
                vendor: item.product.vendor._id,
                quantity: item.quantity,
                price: item.product.price
            });
            totalAmount += item.product.price * item.quantity;
            // Deduct stock
            item.product.stock -= item.quantity;
            await item.product.save();
        }
        if (!orderItems.length) {
            return res.status(400).render('error', { message: 'No valid items to pay for', error: '' });
        }
        const order = new Order({
            customer: customer._id,
            items: orderItems,
            totalAmount,
            status: 'Pending'
        });
        await order.save();
        // Clear cart
        customer.cart = [];
        await customer.save();
        res.redirect('/customer/orders/' + order._id);
    } catch (err) {
        res.status(500).render('error', { message: 'Could not process payment', error: err.message });
    }
});

// Customer order history
app.get('/customer/orders', isLoggedIn, async (req, res) => {
    const statusFilter = req.query.status;
    let orders = await Order.find({ customer: req.user._id }).populate('items.product').sort({ createdAt: -1 });
    if (statusFilter) {
        // Only show orders where the overall status matches the filter
        orders = orders.filter(order => {
            // Get the overall status for the order (same logic as in EJS)
            const statusPriority = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];
            let minIdx = statusPriority.length;
            order.items.forEach(item => {
                const idx = statusPriority.indexOf(item.status || order.status);
                if (idx !== -1 && idx < minIdx) minIdx = idx;
            });
            const overallStatus = statusPriority[minIdx] || order.status;
            return overallStatus === statusFilter;
        });
    }
    res.render('orders', { orders, statusFilter });
});

// Customer order details
app.get('/customer/orders/:id', isLoggedIn, async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id })
        .populate({
            path: 'items.product',
            populate: { path: 'reviews' }
        });
    if (!order) return res.status(404).render('error', { message: 'Order not found', error: '' });
    res.render('order-details', { order });
});

// Product details page
app.get('/customer/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('vendor')
            .populate({
                path: 'reviews',
                options: { sort: { createdAt: -1 } }
            });
        if (!product) {
            return res.status(404).render('error', { message: 'Product not found', error: '' });
        }
        res.render('product-details', { product });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).render('error', { message: 'Error loading product details', error: error.message });
    }
});

// Auth routes
app.get('/signup', (req, res) => {
    res.render('signup', { message: req.query.message || '', status: req.query.status || '' });
});

app.post('/signup', async (req, res) => {
    try {
        const { username, email, password, role, address } = req.body;
        if (role === 'vendor') {
            const vendor = new Vendor({ username, email });
            await Vendor.register(vendor, password);
            return res.redirect('/login?message=Vendor account created! Please log in.&status=success');
        } else {
            const customer = new Customer({ username, email, address });
            await Customer.register(customer, password);
            return res.redirect('/login?message=Account created successfully! Please log in.&status=success');
        }
    } catch (err) {
        res.redirect('/signup?message=' + encodeURIComponent(err.message) + '&status=error');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { message: req.query.message || '', status: req.query.status || '' });
});

app.post('/login', (req, res, next) => {
    const { role } = req.body;
    const strategy = role === 'vendor' ? 'vendor-local' : 'customer-local';
    passport.authenticate(strategy, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect('/login?message=Invalid username, password, or role.&status=error');
        req.logIn(user, err => {
            if (err) return next(err);
            if (role === 'vendor') return res.redirect('/vendor/products');
            return res.redirect('/customer/products');
        });
    })(req, res, next);
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login');
    });
});

// Update profile route
app.post('/customer/profile', isLoggedIn, async (req, res) => {
    try {
        const { username, lastName, email, phone, address } = req.body;
        const user = await Customer.findById(req.user._id);
        user.username = username;
        user.lastName = lastName;
        user.email = email;
        user.phone = phone;
        user.address = address;
        await user.save();
        res.render('profile', { user, profileUpdated: true });
    } catch (err) {
        res.status(400).render('error', { message: 'Could not update profile', error: err.message });
    }
});

app.get('/vendor/dashboard', isLoggedIn, (req, res) => {
    if (req.user.role !== 'vendor') return res.status(403).render('error', { message: 'Forbidden', error: 'Access denied.' });
    res.render('vendor-dashboard', { user: req.user });
});

app.get('/admin/dashboard', isLoggedIn, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).render('error', { message: 'Forbidden', error: 'Access denied.' });
    res.render('admin-dashboard', { user: req.user });
});

function isVendor(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'vendor') return next();
    res.status(403).render('error', { message: 'Forbidden', error: 'Vendor access only.' });
}

// Vendor products page
app.get('/vendor/products', async (req, res) => {
    if (!req.user || req.user.role !== 'vendor') {
        return res.redirect('/login');
    }
    const products = await Product.find({ vendor: req.user._id });
    res.render('vendor-products', { user: req.user, products });
});

// Vendor add product (GET)
app.get('/vendor/products/add', (req, res) => {
    if (!req.user || req.user.role !== 'vendor') return res.redirect('/login');
    res.render('vendor-add-product', { user: req.user });
});

// Vendor add product (POST) - use Multer and Cloudinary for file upload
app.post('/vendor/products/add', upload.single('image'), async (req, res) => {
    if (!req.user || req.user.role !== 'vendor') return res.redirect('/login');
    const { name, category, price, available, description, stock } = req.body;
    if (!req.file || !req.file.path) {
        return res.status(400).render('error', { message: 'Product image is required.', error: '' });
    }
    const product = new Product({
        name,
        image: req.file.path, // Cloudinary URL
        category,
        price,
        available: available === 'on',
        description,
        stock,
        vendor: req.user._id
    });
    await product.save();
    req.user.products.push(product._id);
    await req.user.save();
    res.redirect('/vendor/products');
});

// Vendor delete product
app.post('/vendor/products/delete/:id', async (req, res) => {
    if (!req.user || req.user.role !== 'vendor') return res.redirect('/login');
    const product = await Product.findOne({ _id: req.params.id, vendor: req.user._id });
    if (product) {
        await Product.deleteOne({ _id: req.params.id });
        req.user.products = req.user.products.filter(pid => pid.toString() !== req.params.id);
        await req.user.save();
    }
    res.redirect('/vendor/products');
});

// Vendor orders page
app.get('/vendor/orders', async (req, res) => {
    if (!req.user || req.user.role !== 'vendor') return res.redirect('/login');
    const statusFilter = req.query.status;
    let orders = await Order.find({ 'items.vendor': req.user._id })
        .populate('customer')
        .populate('items.product')
        .sort({ createdAt: -1 });
    if (statusFilter) {
        // Only show orders where at least one item for this vendor matches the filter
        orders = orders.filter(order =>
            order.items.some(item => item.vendor && item.vendor.toString() === req.user._id.toString() && item.status === statusFilter)
        );
    }
    res.render('vendor-orders', { user: req.user, orders, statusFilter });
});

// Vendor update order item status
app.post('/vendor/orders/:orderId/status', async (req, res) => {
    if (!req.user || req.user.role !== 'vendor') return res.redirect('/login');
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId).populate('customer').populate('items.product');
    if (!order) return res.status(404).render('error', { message: 'Order not found', error: '' });
    order.items.forEach(item => {
        if (item.vendor.toString() === req.user._id.toString() && item.status !== 'Delivered' && item.status !== 'Cancelled') {
            item.status = status;
        }
    });
    await order.save();
    res.redirect('/vendor/orders');
});

// Vendor profile page
app.get('/vendor/profile', async (req, res) => {
    if (!req.user || req.user.role !== 'vendor') return res.redirect('/login');
    res.render('vendor-profile', { user: req.user });
});

// Vendor profile edit (POST)
app.post('/vendor/profile/edit', async (req, res) => {
    if (!req.user || req.user.role !== 'vendor') return res.redirect('/login');
    try {
        const { username, email } = req.body;
        const user = await Vendor.findById(req.user._id);
        user.username = username;
        user.email = email;
        await user.save();
        req.login(user, function(err) {
            if (err) {
                return res.status(500).render('error', { message: 'Session update failed', error: err.message });
            }
            res.render('vendor-profile', { user, profileUpdated: true });
        });
    } catch (err) {
        res.status(400).render('error', { message: 'Could not update profile', error: err.message });
    }
});

// Customer review route
app.post('/customer/review', isLoggedIn, async (req, res) => {
    try {
        const { productId, orderId, rating, comment } = req.body;
        // Check if the user has a delivered order for this product
        const order = await Order.findOne({ _id: orderId, customer: req.user._id, 'items.product': productId, 'items.status': 'Delivered' });
        if (!order) return res.status(403).render('error', { message: 'You can only review delivered products.', error: '' });
        // Save review
        const review = new Review({
            product: productId,
            reviewer: req.user.username,
            rating: parseInt(rating),
            comment: comment,
            createdAt: new Date()
        });
        await review.save();
        // Add review to product
        const product = await Product.findById(productId);
        product.reviews.push(review._id);
        await product.save();
        res.redirect(`/customer/orders/${orderId}`);
    } catch (err) {
        res.status(500).render('error', { message: 'Could not submit review', error: err.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'Something went wrong!',
        error: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        message: 'Page not found',
        error: 'The page you are looking for does not exist.' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`AgriMarket server is running on http://localhost:${PORT}`);
}); 