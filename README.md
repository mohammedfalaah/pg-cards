# PG CARDS - Premium NFC Business Cards Platform

A modern, full-featured e-commerce platform for NFC business cards with digital profile management, QR code generation, and Stripe payment integration.

## 🚀 Features

### Customer Features
- 🛍️ **Product Catalog** - Browse and purchase NFC business cards
- 🎨 **Card Customization** - Choose from multiple card variants (colors, finishes)
- 👤 **Digital Profile** - Create and customize your digital business card
- 📸 **Image Gallery** - Upload profile picture, cover image, and gallery photos
- 🎭 **Theme Selection** - Choose from 3 professional themes (Standard, Modern, Epic)
- 📱 **QR Code Generation** - Automatic QR code for your digital profile
- 🛒 **Shopping Cart** - Add/remove items, update quantities
- 💳 **Secure Checkout** - Stripe payment integration
- 📦 **Order Management** - Track your orders
- 🚚 **Delivery Address** - Save and manage delivery addresses

### Admin Features
- 📊 **Dashboard** - Overview of orders, products, and users
- 🏷️ **Product Management** - Add, edit, delete products and variants
- 👥 **User Management** - View and manage customer accounts
- 📋 **Order Management** - Process and track orders
- 🎨 **Variant Management** - Manage product colors, finishes, and pricing

### Technical Features
- ⚡ **React 18** - Modern React with hooks
- 🎨 **Responsive Design** - Mobile-first approach
- 🔐 **JWT Authentication** - Secure user authentication
- ☁️ **Cloudinary Integration** - Image upload and optimization
- 💳 **Stripe Integration** - Secure payment processing
- 🔄 **Real-time Updates** - Live preview of profile changes
- 📱 **Mobile Optimized** - Works perfectly on all devices

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Cloudinary account
- Stripe account
- Backend API running

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pg-cards
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_BASE_URL=https://pg-cards.vercel.app

# Google OAuth (optional)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

# Cloudinary Configuration
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
REACT_APP_CLOUDINARY_FOLDER=pgcards
```

4. **Start the development server**
```bash
npm start
```

The app will open at `http://localhost:3000`

## 🔧 Configuration

### Cloudinary Setup

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Navigate to Settings → Upload → Upload presets
3. Create a new preset:
   - Name: `pgcards_unsigned` (or your choice)
   - Signing Mode: **Unsigned** (important!)
   - Folder: `pgcards`
4. Update `.env` with your cloud name and preset name

### Stripe Setup

1. Get your publishable key from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Add it to `.env` as `REACT_APP_STRIPE_PUBLISHABLE_KEY`
3. Configure webhook endpoints for order processing

## 📁 Project Structure

```
pg-cards/
├── public/
│   ├── assets/
│   │   └── images/
│   │       └── logo.png
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js/css          # Navigation header
│   │   ├── Footer.js/css          # Footer component
│   │   ├── Hero.js/css            # Homepage hero section
│   │   ├── ShopPage.js            # Product catalog
│   │   ├── ProductDetailPage.js   # Product details
│   │   ├── Cart.js/css            # Shopping cart
│   │   ├── Dashboard.js/css       # User dashboard
│   │   ├── AdminPanel.js          # Admin panel
│   │   ├── ProfilePreview.js      # Digital card preview
│   │   ├── CreateQR.js/css        # QR code generator
│   │   └── ...
│   ├── CheckoutPage.js            # Checkout flow
│   ├── App.js                     # Main app component
│   ├── App.css                    # Global styles
│   └── index.js                   # Entry point
├── .env                           # Environment variables
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 🎨 Image Upload Guidelines

### Product Images (Admin)
- **Resolution:** 1200 x 1200 pixels (square)
- **Format:** JPG or PNG
- **Max Size:** 500KB

### Profile Pictures
- **Resolution:** 400 x 400 pixels (square)
- **Format:** JPG or PNG
- **Max Size:** 200KB

### Cover Images
- **Resolution:** 1200 x 400 pixels (3:1 ratio)
- **Format:** JPG or PNG
- **Max Size:** 500KB

### Gallery Images
- **Resolution:** 800 x 800 pixels (square)
- **Format:** JPG or PNG
- **Max Size:** 300KB each
- **Maximum:** 10 images

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Drag and drop the build folder to Netlify
```

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- `REACT_APP_API_BASE_URL`
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`
- `REACT_APP_CLOUDINARY_CLOUD_NAME`
- `REACT_APP_CLOUDINARY_UPLOAD_PRESET`

## 🔐 Security Best Practices

- ✅ Never commit `.env` file to git
- ✅ Use unsigned upload presets for Cloudinary (no API secret in frontend)
- ✅ Validate all user inputs
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated
- ✅ Implement rate limiting on API endpoints

## 🐛 Troubleshooting

### Images not uploading
- Check Cloudinary preset is set to "Unsigned"
- Verify cloud name and preset name in `.env`
- Restart development server after changing `.env`

### Payment not working
- Verify Stripe publishable key is correct
- Check browser console for errors
- Ensure backend webhook is configured

### Header overlapping content
- Clear browser cache
- Check `App.css` has proper padding-top

### Cart not updating
- Check localStorage is enabled
- Verify API endpoints are accessible
- Check browser console for errors

## 📚 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/google` - Google OAuth

### Products
- `POST /card/getProducts` - Get all products
- `POST /card/getProductById` - Get product details

### Cart
- `POST /cart/addToCart` - Add item to cart
- `POST /cart/getUserCart` - Get user's cart
- `POST /cart/updateQuantity` - Update item quantity
- `POST /cart/removeItem` - Remove item from cart

### User Profile
- `POST /userProfile/saveUserProfile` - Save/update profile
- `GET /userProfile/getUserProfile/:id` - Get profile by ID

### Orders
- `POST /order/createOrder` - Create new order
- `POST /order/getUserOrders` - Get user's orders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 👥 Support

For support, email support@pgcards.com or contact via WhatsApp.

## 🙏 Acknowledgments

- React team for the amazing framework
- Stripe for payment processing
- Cloudinary for image management
- All contributors and testers

---

Made with ❤️ by PG Cards Team
