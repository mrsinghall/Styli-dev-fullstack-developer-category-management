const {
  createCategoryService,
  getCategoryService,
  updateCategoryService,
  deleteCategoryService,
} = require("../services/categoryService");
const { createResponse } = require("../utils/utilityFunctions");

// Controller to handle category creation
const createCategory = async (req, res, next) => {
  try {
    // Extract category data from the request body
    const categoryData = req.body;

    // Call the service function to create a category
    const category = await createCategoryService(categoryData);

    // Prepare a success response with the created category
    const response = createResponse(201, "Category created successfully", category);

    // Send the response with HTTP status and body
    res.status(response.statusCode).json(response);
  } catch (error) {
    // Pass the error to the error-handling middleware
    next(error);
  }
};

// Controller to get categories based on given filters
const getCategories = async (req, res, next) => {
  try {
    // Extract categoryId from request parameters and subcategoryId, filterId from query params
    const { categoryId } = req.params;
    const { subcategoryId, filterId } = req.query;

    // Call the service function to fetch categories with the provided filters
    const categories = await getCategoryService({ categoryId, subcategoryId, filterId });

    // Prepare a success response with the fetched categories
    const response = createResponse(200, "success", categories);

    // Send the response with HTTP status and body
    res.status(response.statusCode).json(response);
  } catch (error) {
    // Pass the error to the error-handling middleware
    next(error);
  }
};

// Controller to update a category
const updateCategory = async (req, res, next) => {
  try {
    // Extract categoryId from request parameters and category data from the body
    const { categoryId } = req.params;
    const categoryData = req.body;

    // Call the service function to update the category
    const updatedCategory = await updateCategoryService(categoryId, categoryData);

    // Prepare a success response with the updated category data
    const response = createResponse(200, "Category updated successfully", updatedCategory);

    // Send the response with HTTP status and body
    res.status(response.statusCode).json(response);
  } catch (error) {
    // Pass the error to the error-handling middleware
    next(error);
  }
};

// Controller to handle category deletion
const deleteCategory = async (req, res, next) => {
  try {
    // Extract categoryId from request parameters and subcategoryId, filterId from query params
    const { categoryId } = req.params;
    const { subcategoryId, filterId } = req.query;

    // Call the service function to delete the category (and potentially associated subcategories/filters)
    await deleteCategoryService({ categoryId, subcategoryId, filterId });

    // Prepare a success response confirming the deletion
    const response = createResponse(200, "Category deleted successfully", {});

    // Send the response with HTTP status and body
    res.status(response.statusCode).json(response);
  } catch (error) {
    // Pass the error to the error-handling middleware
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
