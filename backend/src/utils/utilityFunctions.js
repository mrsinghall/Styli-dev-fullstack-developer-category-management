// error.js (Custom Error Class)

// Define a custom error class to handle application-specific errors
class AppError extends Error {
  // Constructor accepts statusCode, message, and an optional isOperational flag (defaults to true)
  constructor(statusCode, message, isOperational = true) {
    super(message); // Calls the parent Error class constructor with the message
    this.statusCode = statusCode; // The HTTP status code to return for the error
    this.isOperational = isOperational; // Flag to determine if the error is operational or programming-related
    this.name = this.constructor.name; // Sets the error name to the class name (AppError)

    // Capture the stack trace for debugging purposes
    Error.captureStackTrace(this);
  }
}

// Export the AppError class for use in other parts of the application
module.exports = AppError;

// Function to create a standard response structure for API responses
createResponse = (statusCode, message, data = {}) => {
  return {
    statusCode, // The status code to send in the response (e.g., 200, 400)
    message, // A message describing the result or error
    data, // Optional data that accompanies the response (default is an empty object)
  };
};

// Export the createResponse function and AppError class for use in other files
module.exports = {
  createResponse,
  AppError,
};
