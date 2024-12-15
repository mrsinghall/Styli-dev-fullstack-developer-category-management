const httpMocks = require("node-mocks-http"); // To mock request/response
const { createCategory, getCategories, updateCategory, deleteCategory } = require("./categoryController");
const {
  createCategoryService,
  getCategoryService,
  updateCategoryService,
  deleteCategoryService,
} = require("../services/categoryService");

jest.mock("../services/categoryService"); // Mock the service layer to isolate controller logic

describe("Category Controller", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests to ensure clean state
  });

  describe("createCategory", () => {
    it("should create a category and return a 201 response", async () => {
      // Mock service response for category creation
      const mockCategory = {
        name: "Women",
        slug: "women",
        subcategories: [
          {
            name: "Clothing",
            slug: "clothing",
            filters: [
              {
                name: "Dresses",
                slug: "dresses",
                options: ["Party Dresses", "Casual Dresses"],
              },
            ],
          },
        ],
      };
      createCategoryService.mockResolvedValue(mockCategory); // Mocking the resolved value of the service

      // Mock the HTTP request and response
      const req = httpMocks.createRequest({
        method: "POST",
        body: {
          name: "Women",
          slug: "women",
          subcategories: [
            {
              name: "Clothing",
              slug: "clothing",
              filters: [
                {
                  name: "Dresses",
                  slug: "dresses",
                  options: ["Party Dresses", "Casual Dresses"],
                },
              ],
            },
          ],
        },
      });
      const res = httpMocks.createResponse(); // Mock the response object
      const next = jest.fn(); // Mock the next function for error handling

      // Call the createCategory controller
      await createCategory(req, res, next);

      // Assertions
      expect(createCategoryService).toHaveBeenCalledWith(req.body); // Ensure service was called with correct data
      expect(res.statusCode).toBe(201); // Check that the status code is 201 for success
      expect(res._getJSONData()).toEqual({
        statusCode: 201,
        message: "Category created successfully",
        data: mockCategory,
      });
      expect(next).not.toHaveBeenCalled(); // Ensure next() was not called (no error)
    });

    it("should call next with an error if service fails", async () => {
      const error = new Error("Service failed");
      createCategoryService.mockRejectedValue(error); // Mock service rejection with an error

      const req = httpMocks.createRequest({
        method: "POST",
        body: {
          name: "Women",
          slug: "women",
          subcategories: [
            {
              name: "Clothing",
              slug: "clothing",
              filters: [
                {
                  name: "Dresses",
                  slug: "dresses",
                  options: ["Party Dresses", "Casual Dresses"],
                },
              ],
            },
          ],
        },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await createCategory(req, res, next);

      // Assertions for error handling
      expect(next).toHaveBeenCalledWith(error); // Ensure next() is called with the error
      expect(res.statusCode).toBe(200); // Status is not set due to error, so default is 200
    });
  });

  describe("getCategories", () => {
    it("should fetch categories and return a 200 response", async () => {
      const mockCategories = [
        {
          _id: "675f0c5e6206177d1f51dd5c",
          name: "Women",
          subcategories: [
            {
              _id: "675f0c5e6206177d1f51dd5e",
              name: "Clothing",
              slug: "clothing",
              filters: [
                {
                  _id: "675f0c5e6206177d1f51dd64",
                  name: "Dresses",
                  slug: "dresses",
                  options: ["Party Dresses", "Casual Dresses"],
                },
              ],
            },
          ],
        },
      ];
      getCategoryService.mockResolvedValue(mockCategories); // Mock the service's resolved value

      const req = httpMocks.createRequest({
        method: "GET",
        params: { categoryId: "675f0c5e6206177d1f51dd5c" },
        query: { subcategoryId: "675f0c5e6206177d1f51dd5e", filterId: "675f0c5e6206177d1f51dd64" },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await getCategories(req, res, next);

      // Assertions
      expect(getCategoryService).toHaveBeenCalledWith({
        categoryId: "675f0c5e6206177d1f51dd5c",
        subcategoryId: "675f0c5e6206177d1f51dd5e",
        filterId: "675f0c5e6206177d1f51dd64",
      });
      expect(res.statusCode).toBe(200); // Check that the status code is 200 for success
      expect(res._getJSONData()).toEqual({
        statusCode: 200,
        message: "success",
        data: mockCategories,
      });
    });
  });

  describe("updateCategory", () => {
    it("should update a category and return a 200 response", async () => {
      const mockUpdatedCategory = { id: "1", name: "Updated Electronics" };
      updateCategoryService.mockResolvedValue(mockUpdatedCategory); // Mocking the update service

      const req = httpMocks.createRequest({
        method: "PUT",
        params: { categoryId: "675f0c5e6206177d1f51dd5c" },
        body: {
          _id: "675f0c5e6206177d1f51dd5f",
          name: "T-Shirts",
          slug: "tshirts",
          filters: [
            {
              _id: "675f0c5e6206177d1f51dd62",
              name: "Cotton",
              slug: "cotton",
              options: ["Reebok", "New me"],
            },
          ],
        },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await updateCategory(req, res, next);

      // Assertions
      expect(updateCategoryService).toHaveBeenCalledWith("675f0c5e6206177d1f51dd5c", {
        _id: "675f0c5e6206177d1f51dd5f",
        name: "T-Shirts",
        slug: "tshirts",
        filters: [
          {
            _id: "675f0c5e6206177d1f51dd62",
            name: "Cotton",
            slug: "cotton",
            options: ["Reebok", "New me"],
          },
        ],
      });
      expect(res.statusCode).toBe(200); // Check that the status code is 200 for success
      expect(res._getJSONData()).toEqual({
        statusCode: 200,
        message: "Category updated successfully",
        data: mockUpdatedCategory,
      });
    });
  });

  describe("deleteCategory", () => {
    it("should delete a category and return a 200 response", async () => {
      deleteCategoryService.mockResolvedValue(); // Mock successful category deletion

      const req = httpMocks.createRequest({
        method: "DELETE",
        params: { categoryId: "675ed6112953db93d5ed76ac" },
        query: { subcategoryId: "675f0c5e6206177d1f51dd5e", filterId: "675f0c5e6206177d1f51dd64" },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await deleteCategory(req, res, next);

      // Assertions
      expect(deleteCategoryService).toHaveBeenCalledWith({
        categoryId: "675ed6112953db93d5ed76ac",
        subcategoryId: "675f0c5e6206177d1f51dd5e",
        filterId: "675f0c5e6206177d1f51dd64",
      });
      expect(res.statusCode).toBe(200); // Check that the status code is 200 for success
      expect(res._getJSONData()).toEqual({
        statusCode: 200,
        message: "Category deleted successfully",
        data: {},
      });
    });
  });
});
