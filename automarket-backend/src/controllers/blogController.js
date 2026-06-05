const Blog = require('../models/Blog');
const User = require('../models/User');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Test database connection and Blog model
const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection successful');

    console.log('Testing Blog model...');
    const testBlog = await Blog.findOne();
    console.log(
      '✓ Blog model query successful',
      testBlog ? 'Found blog' : 'No blogs found'
    );

    return true;
  } catch (error) {
    console.error('✗ Database connection or model test failed:', error);
    return false;
  }
};

// Test endpoint for database connection
exports.testDatabase = async (req, res) => {
  try {
    console.log('=== Database Test Endpoint ===');

    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    await sequelize.authenticate();
    console.log('✓ Basic connection successful');

    // Test 2: Raw SQL query
    console.log('2. Testing raw SQL query...');
    const [results] = await sequelize.query(
      'SELECT NOW() as current_time, version() as db_version'
    );
    console.log('✓ Raw SQL query successful:', results[0]);

    // Test 3: Blog model findOne
    console.log('3. Testing Blog.findOne...');
    const blog = await Blog.findOne();
    console.log(
      '✓ Blog.findOne successful:',
      blog ? 'Found blog' : 'No blogs found'
    );

    // Test 4: Blog model findAll with limit
    console.log('4. Testing Blog.findAll with limit...');
    const blogs = await Blog.findAll({ limit: 1 });
    console.log('✓ Blog.findAll successful, count:', blogs.length);

    // Test 5: Check blog table structure
    console.log('5. Testing table structure...');
    const tableInfo = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'blogs'"
    );
    console.log(
      '✓ Table structure query successful, columns:',
      tableInfo[0].length
    );

    res.json({
      message: 'Database tests completed successfully',
      tests: {
        connection: true,
        rawQuery: true,
        blogModel: true,
        blogCount: blogs.length,
        tableColumns: tableInfo[0].length,
      },
    });
  } catch (error) {
    console.error('✗ Database test failed:', error);
    res.status(500).json({
      error: 'Database test failed',
      details: error.message,
      stack: error.stack,
    });
  }
};

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Helper function to ensure unique slug
const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const whereClause = { slug };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existingBlog = await Blog.findOne({ where: whereClause });
    if (!existingBlog) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// GET all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Blog.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit: limit,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      blogs: rows,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error getting blogs:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET single blog by ID or slug
exports.getBlog = async (req, res) => {
  try {
    const identifier = req.params.id;
    const whereClause = isNaN(identifier)
      ? { slug: identifier }
      : { id: parseInt(identifier) };

    const blog = await Blog.findOne({
      where: whereClause,
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Error getting blog:', error);
    res.status(500).json({ message: error.message });
  }
};

// CREATE new blog
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      category,
      date,
      read_time,
      image,
      featured,
      content,
      author_id,
      is_published,
    } = req.body;

    // Validate required fields
    if (!title || !excerpt || !category || !date || !read_time) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'title, excerpt, category, date, and read_time are required',
      });
    }

    // Generate unique slug
    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug);

    const blog = await Blog.create({
      title,
      excerpt,
      category,
      date,
      read_time,
      image,
      slug,
      featured: featured || false,
      content,
      author_id,
      is_published: is_published !== undefined ? is_published : true,
    });

    // Fetch the created blog with author info
    const createdBlog = await Blog.findByPk(blog.id, {});

    res.status(201).json({
      message: 'Blog created successfully',
      data: createdBlog,
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(400).json({
      error: 'Failed to create blog',
      details: error.message,
    });
  }
};

// CREATE new blog with image upload
exports.createBlogWithImage = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      category,
      date,
      read_time,
      featured,
      content,
      author_id,
      is_published,
      image,
    } = req.body;
    console.log('req.body:', req.body);
    console.log('Image:', image);
    // Validate required fields
    if (!title || !excerpt || !category || !date || !read_time) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'title, excerpt, category, date, and read_time are required',
      });
    }

    // Process uploaded image
    let imageBase64 = null;
    if (req.file) {
      // Convert image buffer to base64
      const imageBuffer = req.file.buffer;
      const mimeType = req.file.mimetype;
      imageBase64 = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

      console.log(
        `Image uploaded: ${req.file.originalname}, Size: ${req.file.size} bytes, Type: ${mimeType}`
      );
    } else if (req.body['@image']) {
      // Handle image passed as URL string with @image key
      imageBase64 = req.body['@image'];
      console.log(`Image URL provided: ${imageBase64}`);
    }

    // Generate unique slug
    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug);

    // Parse boolean values from form data
    const featuredValue = featured === 'true' || featured === true;
    const publishedValue =
      is_published === 'true' ||
      is_published === true ||
      is_published === undefined;
    const authorIdValue = author_id ? parseInt(author_id) : null;

    const blog = await Blog.create({
      title,
      excerpt,
      category,
      date,
      read_time,
      image: image || imageBase64, // Store base64 image
      slug,
      featured: featuredValue,
      content,
      author_id: authorIdValue,
      is_published: publishedValue,
    });

    // Fetch the created blog with author info
    const createdBlog = await Blog.findByPk(blog.id, {});

    res.status(201).json({
      message: 'Blog created successfully with image',
      data: {
        ...createdBlog.toJSON(),
        // Don't return the full base64 image in response for performance
        image: createdBlog.image
          ? `[Base64 Image - ${createdBlog.image.length} characters]`
          : null,
      },
    });
  } catch (error) {
    console.error('Error creating blog with image:', error);
    res.status(400).json({
      error: 'Failed to create blog with image',
      details: error.message,
    });
  }
};

// UPDATE blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      excerpt,
      category,
      date,
      read_time,
      image,
      featured,
      content,
      author_id,
      is_published,
    } = req.body;

    // Test database connection first
    const dbTest = await testDatabaseConnection();
    if (!dbTest) {
      return res.status(500).json({
        error: 'Database connection failed',
        details: 'Unable to connect to database or query Blog model',
      });
    }

    console.log('Finding blog by ID:', id);
    const blog = await Blog.findByPk(id);
    console.log('Blog found:', blog ? 'Yes' : 'No');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    console.log('Current blog data:', blog.toJSON());

    // Update slug if title changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      const baseSlug = generateSlug(title);
      slug = await ensureUniqueSlug(baseSlug, id);
      console.log('Generated new slug:', slug);
    }

    // Build update data object with only provided fields
    const updateData = {};

    // Only include fields that are explicitly provided in the request
    if (title !== undefined) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = date;
    if (read_time !== undefined) updateData.read_time = read_time;
    if (image !== undefined) updateData.image = image;
    if (slug !== undefined) updateData.slug = slug;
    if (featured !== undefined) updateData.featured = featured;
    if (content !== undefined) updateData.content = content;
    if (author_id !== undefined) updateData.author_id = author_id;
    if (is_published !== undefined) updateData.is_published = is_published;

    console.log('Update data prepared:', {
      ...updateData,
      // Don't log the full image data as it's too large
      image: updateData.image
        ? `[Base64 Image - ${updateData.image.length} characters]`
        : null,
    });

    console.log('About to update blog...');
    console.log('Update data keys:', Object.keys(updateData));
    console.log('Update data values:', updateData);

    // Test a simple raw SQL query first
    try {
      console.log('Testing raw SQL query...');
      const [results] = await sequelize.query('SELECT 1 as test');
      console.log('✓ Raw SQL query successful:', results);
    } catch (sqlError) {
      console.error('✗ Raw SQL query failed:', sqlError);
      throw new Error('Database connection lost');
    }

    // Try a simpler update approach first
    console.log('Attempting update with Sequelize...');
    try {
      const result = await Blog.update(updateData, {
        where: { id: id },
        returning: true,
        plain: true,
      });
      console.log('✓ Blog update completed successfully:', result);
    } catch (updateError) {
      console.error('✗ Sequelize update failed:', updateError);

      // Try manual SQL update as fallback
      try {
        console.log('Attempting manual SQL update...');
        const updateFields = Object.keys(updateData)
          .map((key) => `${key} = :${key}`)
          .join(', ');
        const updateQuery = `UPDATE blogs SET ${updateFields}, updated_at = NOW() WHERE id = :id`;

        const result = await sequelize.query(updateQuery, {
          replacements: { ...updateData, id: id },
          type: sequelize.QueryTypes.UPDATE,
        });

        console.log('✓ Manual SQL update successful:', result);
      } catch (sqlUpdateError) {
        console.error('✗ Manual SQL update failed:', sqlUpdateError);
        throw updateError;
      }
    }

    // Fetch updated blog with author info
    const updatedBlog = await Blog.findByPk(id, {});
    res.json({
      message: 'Blog updated successfully',
      data: updatedBlog,
    });
  } catch (error) {
    console.error('Error updating blog - Full error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Handle specific Sequelize errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Unique constraint violation',
        details: 'A blog with this slug already exists',
        field: error.errors?.[0]?.path || 'slug',
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details:
          error.errors?.map((err) => ({
            field: err.path,
            message: err.message,
          })) || error.message,
      });
    }

    res.status(400).json({
      error: 'Failed to update blog',
      details: error.message,
      errorType: error.name,
    });
  }
};

// DELETE blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Delete request for blog ID:', id);

    // Test database connection first
    const dbTest = await testDatabaseConnection();
    if (!dbTest) {
      return res.status(500).json({
        error: 'Database connection failed',
        details: 'Unable to connect to database or query Blog model',
      });
    }

    const blog = await Blog.findByPk(id);
    console.log('Blog found for deletion:', blog ? 'Yes' : 'No');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    console.log('Attempting to delete blog...');
    try {
      await blog.destroy();
      console.log('✓ Blog deleted successfully using Sequelize');
    } catch (deleteError) {
      console.error('✗ Sequelize delete failed:', deleteError);

      // Try manual SQL delete as fallback
      try {
        console.log('Attempting manual SQL delete...');
        const result = await sequelize.query(
          'DELETE FROM blogs WHERE id = :id',
          {
            replacements: { id: id },
            type: sequelize.QueryTypes.DELETE,
          }
        );
        console.log('✓ Manual SQL delete successful:', result);
      } catch (sqlDeleteError) {
        console.error('✗ Manual SQL delete failed:', sqlDeleteError);
        throw deleteError;
      }
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      error: 'Failed to delete blog',
      details: error.message,
    });
  }
};

// GET blog categories
exports.getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.findAll({
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']],
    });

    const categoryList = categories.map((cat) => cat.category);

    res.json({ categories: categoryList });
  } catch (error) {
    console.error('Error getting blog categories:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET featured blogs
exports.getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const blogs = await Blog.findAll({
      where: {
        featured: true,
        is_published: true,
      },

      order: [['created_at', 'DESC']],
      limit: limit,
    });

    res.json({ blogs });
  } catch (error) {
    console.error('Error getting featured blogs:', error);
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await blog.update({ featured: !blog.featured });

    res.json({
      message: `Blog ${blog.featured ? 'featured' : 'unfeatured'} successfully`,
      data: blog,
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      error: 'Failed to toggle featured status',
      details: error.message,
    });
  }
};

// TOGGLE published status
exports.togglePublished = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await blog.update({ is_published: !blog.is_published });

    res.json({
      message: `Blog ${blog.is_published ? 'published' : 'unpublished'} successfully`,
      data: blog,
    });
  } catch (error) {
    console.error('Error toggling published status:', error);
    res.status(500).json({
      error: 'Failed to toggle published status',
      details: error.message,
    });
  }
};
