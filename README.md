# Restaurant Website

A full-stack restaurant website with customer and admin functionalities built using the MERN stack (MongoDB, Express, React, Node.js).

## Features

### Customer Features
- **Browse Restaurants**: View all available restaurants
- **View Menus**: See menu items with images, descriptions, and prices
- **Cart Functionality**: Add items to cart, adjust quantities
- **Order Placement**: Place orders from the cart
- **Order History**: View past orders and their status
- **User Authentication**: Register, login, and manage your account

### Admin Features
- **Restaurant Management**: Create, update, and activate/deactivate restaurants
- **Menu Management**: Add, edit menu items with image upload
- **Order Management**: View all orders and update their status
- **Admin Dashboard**: Overview of orders and restaurants

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Upload**: Multer

## Installation and Setup

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd Restaurant-Website
   ```

2. **Install server dependencies**
   ```
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   
   Create a file named `config.env` in the server directory with the following:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

5. **Create uploads folder**
   ```
   mkdir uploads
   ```

### Running the Application

1. **Start the backend server**
   ```
   cd server
   npm run dev
   ```
   The server will run on http://localhost:5000

2. **Start the frontend development server**
   ```
   cd client
   npm start
   ```
   The client will run on http://localhost:3000

## Usage

### Customer Usage
1. Register a new account or login
2. Browse restaurants
3. View restaurant menu
4. Add items to cart
5. Checkout and place order
6. View order history

### Admin Usage
1. Register as admin using the admin code (default: `ADMIN123`)
2. Login with admin credentials
3. Access admin panel for:
   - Managing restaurants
   - Creating/editing menu items
   - Updating order statuses

## Project Structure

```
Restaurant-Website/
├── client/                 # React frontend
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── api.js          # API requests configuration
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main App component
│   │   └── index.js        # Entry point
│   └── package.json        # Frontend dependencies
├── server/                 # Express backend
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── app.js              # Express app
│   └── package.json        # Backend dependencies
├── uploads/                # Uploaded files (images)
└── README.md               # Project documentation
```

## Security

- JWT authentication for user sessions
- Protected API routes
- Password hashing using bcrypt

## License

This project is licensed under the MIT License.
