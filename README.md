# AgriMarket

A modern, responsive web application for buying and selling agricultural products. AgriMarket connects customers and vendors, providing a seamless experience for browsing, purchasing, and managing farm products online.

## Features
- Product catalog with advanced filtering
- Customer and vendor authentication
- Shopping cart and order management
- Vendor product management and order tracking
- Customer reviews and profile management
- Fully responsive UI (Bootstrap 5)

## Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AGRIMARKET
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment:**
   - Copy `.env.example` to `.env` and set your MongoDB URI and Cloudinary credentials (for image uploads).
4. **Seed the database (optional):**
   ```bash
   npm run seed
   ```
5. **Start the server:**
   ```bash
   npm run dev
   # or
   npm start
   ```
6. **Visit:** [http://localhost:3001](http://localhost:3001)

## Main API Endpoints

### Customer APIs
- `GET /customer/products` — List and filter products
- `GET /customer/products/:id` — Product details
- `POST /customer/cart/add` — Add product to cart
- `GET /customer/cart` — View cart
- `POST /customer/cart/update` — Update cart item quantity
- `POST /customer/cart/delete` — Remove item from cart
- `POST /customer/cart/pay` — Place order for a single product
- `POST /customer/cart/payall` — Place order for all cart items
- `GET /customer/orders` — List customer orders (with status filter)
- `GET /customer/orders/:id` — Order details
- `POST /customer/review` — Submit a review for a delivered product
- `GET /customer/profile` — View/edit customer profile
- `POST /customer/profile` — Update customer profile

### Vendor APIs
- `GET /vendor/products` — List vendor's products
- `GET /vendor/products/add` — Add product form
- `POST /vendor/products/add` — Add new product (with image upload)
- `POST /vendor/products/delete/:id` — Delete a product
- `GET /vendor/orders` — List orders for vendor's products (with status filter)
- `POST /vendor/orders/:orderId/status` — Update order item status
- `GET /vendor/profile` — View/edit vendor profile
- `POST /vendor/profile/edit` — Update vendor profile
- `GET /vendor/dashboard` — Vendor dashboard

### Admin APIs
- `GET /admin/dashboard` — Admin dashboard (basic, extend as needed)

### Auth APIs
- `GET /signup` — Signup form
- `POST /signup` — Register new user (customer or vendor)
- `GET /login` — Login form
- `POST /login` — Login (customer or vendor)
- `GET /logout` — Logout

## Project Structure

```
AGRIMARKET/
├── index.js              # Main server file
├── package.json          # Project dependencies and scripts
├── config/               # Database config
├── models/               # Mongoose models
├── utils/                # Seeder and utilities
├── views/                # EJS templates
├── public/               # Static files (images, CSS)
└── README.md             # Project documentation
```

## Technologies Used
- Node.js, Express.js, MongoDB, Mongoose
- EJS templating, Bootstrap 5, Font Awesome
- Multer & Cloudinary for image uploads
- Passport.js for authentication

---

**AgriMarket** is designed for extensibility. You can easily add new features, roles, or integrations as needed. For questions or contributions, please open an issue or pull request. 