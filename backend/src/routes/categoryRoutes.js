const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Get categories
router.get("/:categoryId?", categoryController.getCategories);

// Create a new category
router.post("/", categoryController.createCategory);

// Update an existing category
router.put("/:categoryId", categoryController.updateCategory);

// Delete a category
router.delete('/:categoryId', categoryController.deleteCategory);

module.exports = router;
