# Backend API Project

This backend API allows you to manage categories with four core API endpoints. It is built using Node.js, MongoDB, and includes a set of unit tests to ensure the reliability of the application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Starting the Application](#starting-the-application)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Prerequisites

Before setting up and running the project, ensure that you have the following:

- [Node.js](https://nodejs.org/) version 18.19.0
- [MongoDB](https://www.mongodb.com/) (local or remote)
- [npm](https://www.npmjs.com/) version 8 or later

## Setup and Installation

1. **Install Node.js version 18.19.0:**
   Make sure you are using Node.js version 18.19.0 for compatibility. You can use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions if necessary:

   ```bash
   nvm install 18.19.0
   nvm use 18.19.0

2. **Clone the repository:**
    git clone https://github.com/your-organization/your-backend-project.git
    cd your-backend-project

3. **Install dependencies:**
    npm install

4. **Configuration**
    Before running the application, you need to configure the MongoDB connection string in the .env file.
    Configure the MongoDB connection string with your database credentials:
    Replace username, password, and your-database with your MongoDB instance details.

5. **Starting the Application**
    npm run start
    npm run dev

6. **http://localhost:3000**

7. **API Endpoints**
    API Endpoints
    This backend system provides the following API endpoints for managing categories:

    Create Category
    POST /api/categories
    Create a new category by providing the category details in the request body.

    Get Categories
    GET /api/categories
    Fetch a list of categories, optionally filtered based on query parameters. You can filter categories by attributes such as name, status, etc.

    Update Category
    PUT /api/categories/:id
    Update the details of a specific category by providing the category ID and the new data in the request body.

    Delete Category
    DELETE /api/categories/:id
    Delete a category by its ID.