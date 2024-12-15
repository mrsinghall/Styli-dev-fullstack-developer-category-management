const Subcategory = require("../models/subCategoryModel");
const Filter = require("../models/filterModel");
const Category = require("../models/categoryModel");
const { ObjectId } = require("mongodb");
const AppError = require("../utils/utilityFunctions"); // Import custom error class

// Create a new category
const createCategoryService = async (categoryData) => {
  const session = await Category.startSession(); // Start a session for atomic transactions
  session.startTransaction(); // Start the transaction
  try {
    const { name, slug, subcategories } = categoryData;

    // Create the new category document
    const category = new Category({ name, slug });
    await category.save({ session }); // Save category within the transaction

    if (subcategories && Array.isArray(subcategories)) {
      // If there are subcategories, create them and associate them with the category
      const subcategoryDocs = await Promise.all(
        subcategories.map((sub) => createSubcategory(sub, category._id, session)) // Create subcategories within the same session
      );
      category.subcategories = subcategoryDocs; // Assign created subcategories to category
      await category.save({ session }); // Save the updated category
    }
    await session.commitTransaction(); // Commit the transaction if all operations succeed
    return category; // Return the created category
  } catch (error) {
    await session.abortTransaction(); // Rollback transaction if an error occurs
    throw error; // Rethrow error for handling by higher-level code
  } finally {
    session.endSession(); // End the session after completing the operation
  }
};

// Get categories with optional filters (categoryId, subcategoryId, filterId)
const getCategoryService = async ({ categoryId, subcategoryId, filterId }) => {
  const pipeline = buildCategoryAggregation(categoryId, subcategoryId, filterId); // Build the aggregation pipeline based on filters
  return await Category.aggregate(pipeline); // Execute aggregation pipeline to fetch categories
};

// Update an existing category
const updateCategoryService = async (categoryId, categoryData) => {
  const session = await Category.startSession(); // Start a session for atomic transactions
  session.startTransaction(); // Start the transaction
  try {
    const { name, slug, subcategories } = categoryData;
    const category = await Category.findById(categoryId).session(session); // Find the category by ID in the session
    if (!category) {
      throw new AppError(404, "Category not found"); // Throw an error if the category doesn't exist
    }

    // Update category fields
    if (name) category.name = name;
    if (slug) category.slug = slug;

    // If subcategories are provided, process them
    if (subcategories && Array.isArray(subcategories)) {
      const updatedSubcategoryIds = await processSubcategories(subcategories, categoryId, session); // Process subcategories (create/update)
      category.subcategories = [
        ...new Map([...category.subcategories, ...updatedSubcategoryIds].map((id) => [id.toString(), id])).values(), // Ensure unique subcategories
      ];
    }

    await category.save({ session }); // Save the updated category
    return category; // Return the updated category
  } catch (error) {
    await session.abortTransaction(); // Rollback on error
    throw error; // Rethrow the error for higher-level handling
  } finally {
    session.endSession(); // End the session
  }
};

// Delete a category or its components (subcategory, filter)
const deleteCategoryService = async ({ categoryId, subcategoryId, filterId }) => {
  const session = await Category.startSession(); // Start a session for atomic transactions
  session.startTransaction(); // Start the transaction
  try {
    if (filterId && subcategoryId) {
      // Delete a filter and remove it from the associated subcategory
      await Filter.findByIdAndDelete(filterId, { session });
      await Subcategory.updateOne(
        { _id: subcategoryId },
        { $pull: { filters: new ObjectId(filterId) } }, // Pull filter from subcategory's filters array
        { session }
      );
      await session.commitTransaction(); // Commit transaction if all operations succeed
      session.endSession(); // End the session
      return;
    }

    if (subcategoryId) {
      // If subcategoryId is provided, delete the subcategory and its filters
      await Subcategory.findByIdAndDelete(subcategoryId, { session });
      await Category.updateOne(
        { _id: categoryId },
        { $pull: { subcategories: new ObjectId(subcategoryId) } }, // Remove subcategory from the category's subcategories
        { session }
      );
      await Filter.deleteMany({ subcategory: subcategoryId }, { session }); // Delete all filters related to the subcategory
      await session.commitTransaction(); // Commit transaction if all operations succeed
      session.endSession(); // End the session
      return;
    }

    // If no subcategory or filter ID, delete the entire category and related subcategories and filters
    const categoryToDelete = await Category.findById(categoryId).session(session);
    if (!categoryToDelete) {
      throw new AppError(404, "Category not found"); // Throw error if category is not found
    }

    // Delete all filters and subcategories related to the category
    await Filter.deleteMany({ subcategory: { $in: categoryToDelete.subcategories } }, { session });
    await Subcategory.deleteMany({ _id: { $in: categoryToDelete.subcategories } }, { session });
    await Category.findByIdAndDelete(categoryId, { session }); // Delete the category
    await session.commitTransaction(); // Commit transaction if all operations succeed
    session.endSession(); // End the session
  } catch (error) {
    await session.abortTransaction(); // Rollback transaction if error occurs
    session.endSession(); // End the session
    throw error; // Rethrow the error for higher-level handling
  }
};

// Helper function to create a subcategory and its associated filters
const createSubcategory = async (sub, categoryId, session) => {
  const { name, slug, filters = [] } = sub;

  // Create the subcategory document
  const subcategory = new Subcategory({ name, slug, category: categoryId });
  await subcategory.save({ session }); // Save subcategory within the transaction

  // If filters are provided, create and associate them with the subcategory
  const filterDocs = await Promise.all(
    filters.map(async (filter) => {
      const { name, slug, options = [], imageUrl } = filter;
      const filterDoc = new Filter({ name, slug, options, imageUrl, subcategory: subcategory._id });
      await filterDoc.save({ session });
      return filterDoc._id; // Return the filter's ID
    })
  );

  // Associate filters with the subcategory
  subcategory.filters = filterDocs;
  await subcategory.save({ session }); // Save subcategory with associated filters
  return subcategory._id; // Return the subcategory's ID
};

// Helper function to process subcategories (create or update)
const processSubcategories = async (subcategories, categoryId, session) => {
  const subcategoryIds = await Promise.all(
    subcategories.map(async (sub) => {
      if (sub._id) {
        // Update existing subcategory if _id is provided
        const subcategory = await Subcategory.findOneAndUpdate(
          { _id: sub._id, category: categoryId },
          { name: sub.name, slug: sub.slug },
          { new: true, session }
        );

        if (!subcategory) {
          throw new AppError(404, `Subcategory with ID ${sub._id} not found.`); // Throw error if subcategory not found
        }

        // Process filters if provided for the subcategory
        if (sub.filters) {
          subcategory.filters = await processFilters(sub.filters, subcategory._id, session);
          await subcategory.save({ session }); // Save updated subcategory
        }

        return subcategory._id; // Return the updated subcategory's ID
      } else {
        // Create new subcategory if no _id is provided
        const newSubcategory = new Subcategory({
          name: sub.name,
          slug: sub.slug,
          category: categoryId,
        });

        // Process filters if provided
        if (sub.filters) {
          newSubcategory.filters = await processFilters(sub.filters, newSubcategory._id, session);
        }

        await newSubcategory.save({ session }); // Save new subcategory
        return newSubcategory._id; // Return the new subcategory's ID
      }
    })
  );

  return subcategoryIds; // Return all subcategory IDs
};

// Helper function to process filters (create or update)
const processFilters = async (filters, subcategoryId, session) => {
  const filterIds = await Promise.all(
    filters.map(async (filter) => {
      if (filter._id) {
        // Update existing filter if _id is provided
        const updatedFilter = await Filter.findOneAndUpdate(
          { _id: filter._id, subcategory: subcategoryId },
          { name: filter.name, slug: filter.slug, imageUrl: filter.imageUrl, options: filter.options },
          { new: true, session }
        );

        if (!updatedFilter) {
          throw new AppError(404, `Filter with ID ${filter._id} not found.`); // Throw error if filter not found
        }

        return updatedFilter._id; // Return the updated filter's ID
      } else {
        // Create new filter if no _id is provided
        const newFilter = new Filter({
          name: filter.name,
          slug: filter.slug,
          options: filter.options || [],
          imageUrl: filter.imageUrl,
          subcategory: subcategoryId,
        });

        await newFilter.save({ session }); // Save new filter
        return newFilter._id; // Return the new filter's ID
      }
    })
  );

  return filterIds; // Return all filter IDs
};

// Build the aggregation pipeline for category queries
const buildCategoryAggregation = (categoryId, subcategoryId, filterId) => {
  const matchStage = [];
  const unwindStage = [{ $unwind: { path: "$subcategories", preserveNullAndEmptyArrays: true } }];

  // Match category filter if categoryId is provided
  if (categoryId) {
    matchStage.push({ $match: { _id: new ObjectId(categoryId) } });
  }

  // Match subcategory filter if subcategoryId is provided
  if (subcategoryId) {
    matchStage.push({ $match: { "subcategories._id": new ObjectId(subcategoryId) } });
  }

  return [
    // Lookup subcategories for the category
    {
      $lookup: {
        from: "subcategories",
        localField: "_id",
        foreignField: "category",
        as: "subcategories",
      },
    },
    ...unwindStage, // Unwind subcategories
    // Lookup filters for the subcategories
    {
      $lookup: {
        from: "filters",
        localField: "subcategories._id",
        foreignField: "subcategory",
        as: "subcategories.filters",
      },
    },
    // Match filterId if provided
    ...(filterId
      ? [
          {
            $addFields: {
              "subcategories.filters": {
                $filter: {
                  input: "$subcategories.filters",
                  as: "filter",
                  cond: { $eq: ["$$filter._id", new ObjectId(filterId)] },
                },
              },
            },
          },
        ]
      : []),
    // Remove unnecessary fields from the output
    {
      $project: {
        "subcategories.category": 0,
        "subcategories.filters.subcategory": 0,
        "subcategories.filters.__v": 0,
        "subcategories.__v": 0,
      },
    },
    ...matchStage, // Apply all match filters (categoryId, subcategoryId)
    // Group the results by category ID and push subcategories
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        subcategories: { $push: "$subcategories" },
      },
    },
    // Final projection to return the required fields
    {
      $project: {
        _id: 1,
        name: 1,
        subcategories: 1,
      },
    },
  ];
};

// Export functions for use in other parts of the application
module.exports = {
  createCategoryService,
  getCategoryService,
  updateCategoryService,
  deleteCategoryService,
  createSubcategory,
  processSubcategories,
  processFilters,
  buildCategoryAggregation,
};
