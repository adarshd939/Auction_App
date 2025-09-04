# 🏆 AuctionHub - Real-Time Auction Platform

A modern, full-stack auction platform built with Node.js, React, and Socket.IO that provides real-time bidding, live updates, and secure transactions.

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with secure password hashing
- Role-based access control (User, Moderator, Admin)
- Rate limiting and security middleware
- Input validation and sanitization

### 🎯 Auction Management
- Create, edit, and manage auctions
- Real-time bidding with live updates
- Automatic auction status management
- Reserve price support
- Auto-extend functionality for active bidding

### 💰 Real-Time Bidding
- Live bid updates via WebSocket
- Instant price updates
- Outbid notifications
- Auction end notifications
- Real-time countdown timers

### 🔍 Search & Discovery
- Advanced search with filters
- Category-based browsing
- Price range filtering
- Status-based filtering
- Pagination support

### 👤 User Experience
- Responsive design for all devices
- Modern UI with Tailwind CSS
- Real-time notifications
- Watchlist functionality
- User profiles and ratings

### 🛡️ Security Features
- CORS protection
- Helmet security headers
- Rate limiting
- Input validation
- SQL injection protection

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auction-platform
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment variables
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **MongoDB Setup**
   - Start MongoDB service
   - Create a database named `auction_platform`
   - Update the connection string in `.env`

5. **Start the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   npm run server    # Backend only
   npm run client    # Frontend only
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Auctions
- `GET /api/auctions` - Get all auctions
- `GET /api/auctions/:id` - Get auction by ID
- `POST /api/auctions` - Create auction
- `PUT /api/auctions/:id` - Update auction
- `DELETE /api/auctions/:id` - Delete auction

### Bids
- `POST /api/bids` - Place bid
- `GET /api/bids/my-bids` - Get user's bids
- `GET /api/bids/winning` - Get winning bids

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/auctions` - Get user's auctions
- `PUT /api/users/:id` - Update user profile

## 🔌 Socket.IO Events

### Client to Server
- `join_auction` - Join auction room
- `leave_auction` - Leave auction room
- `place_bid` - Place a bid
- `typing` - User typing indicator

### Server to Client
- `new_bid` - New bid placed
- `outbid` - User has been outbid
- `auction_won` - User won auction
- `auction_ended` - Auction has ended
- `auction_status_changed` - Auction status update

## 📱 Features in Detail

### Real-Time Bidding
- Instant bid placement and validation
- Live price updates across all connected clients
- Automatic outbid notifications
- Real-time auction status monitoring

### Auction Management
- Draft, pending, active, paused, and ended states
- Automatic status transitions
- Reserve price functionality
- Auto-extend for active bidding

### User Experience
- Responsive design for mobile and desktop
- Real-time notifications
- Search and filtering
- Pagination and sorting
- Watchlist management

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Security headers with Helmet

## 📊 Database Schema

### User Model
- Authentication fields (username, email, password)
- Profile information (name, phone, address)
- Role-based permissions
- Rating and reputation system

### Auction Model
- Item details (title, description, category)
- Pricing (starting, current, reserve)
- Time management (start, end, status)
- Images and metadata

### Bid Model
- Bid amount and timing
- Bidder information
- Bid status tracking
- Auction relationship

## 🚀 Deployment

### Environment Variables
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Connection
MONGODB_URI=mongodb://your-mongodb-uri

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Build
```bash
# Build the React app
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Payment gateway integration
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced search algorithms
- [ ] Social features and sharing
- [ ] Email notifications
- [ ] Admin dashboard improvements
---

**Built with ❤️ using modern web technologies**
