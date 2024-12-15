// Import required modules
const express = require("express"); // Express framework to create the server
require("dotenv").config(); // Load environment variables from .env file
const connectDB = require("./config/db"); // Database connection function
const cors = require("cors"); // CORS middleware to handle cross-origin requests

// Establish a connection to the database
connectDB();

// Import routes and middleware
const categoryRoutes = require("./routes/categoryRoutes"); // Import category-specific routes
const errorHandler = require("./middleware/errorHandlerMiddleware"); // Custom error-handling middleware

// Initialize the express app
const app = express();

// Enable CORS for all routes
app.use(cors()); // Allows cross-origin requests from any origin

// Middleware to parse incoming JSON requests
app.use(express.json()); // Automatically parses incoming JSON data in request bodies

// Define API Routes
// Define route for category-related requests, prefixed by the API URL from environment variables
app.use(`${process.env.API_URL}/categories`, categoryRoutes); // Categories route handling

// Global error-handling middleware
// This will catch any errors thrown by route handlers or other middleware
app.use(errorHandler); // Handles errors in a centralized manner

// Catch-all route for undefined routes (404 Not Found)
app.use((req, res, next) => {
  console.log(req.url); // Log the requested URL to the console for debugging
  res.status(404).json({ message: "Route not found" }); // Send a 404 response if no matching route found
});

// Export the express app to be used in other parts of the application (e.g., for server setup)
module.exports = app;
