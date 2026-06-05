const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const upload = require('../middleware/uploadMiddleware');

// Test database connection
router.get('/test-database', blogController.testDatabase);

// GET all blogs with pagination, filtering, and search
router.get('/', blogController.getAllBlogs);

// GET blog categories
router.get('/categories', blogController.getBlogCategories);

// GET featured blogs
router.get('/featured', blogController.getFeaturedBlogs);

// GET single blog by ID or slug
router.get('/:id', blogController.getBlog);

// CREATE new blog
router.post('/', blogController.createBlog);

// CREATE new blog with image upload
router.post(
  '/create-with-image',
  upload.single('image'),
  blogController.createBlogWithImage
);

// UPDATE blog
router.put('/:id', blogController.updateBlog);

// DELETE blog
router.delete('/:id', blogController.deleteBlog);

// TOGGLE featured status
router.patch('/:id/toggle-featured', blogController.toggleFeatured);

// TOGGLE published status
router.patch('/:id/toggle-published', blogController.togglePublished);

module.exports = router;
