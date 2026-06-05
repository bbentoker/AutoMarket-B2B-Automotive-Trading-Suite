import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaStar, FaUpload } from 'react-icons/fa';
import { getBlogs, deleteBlog, createBlogWithImage, updateBlogWithImage } from '../utils/api';
import toast from 'react-hot-toast';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    read_time: '',
    image: '',
    content: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchTerm]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
      };
      const response = await getBlogs(params);
      setBlogs(response.blogs || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (error) {
      toast.error('Error fetching blogs');
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBlog) {
        // For editing, use updateBlogWithImage but don't send image file
        await updateBlogWithImage(editingBlog.id, formData);
        toast.success('Blog updated successfully');
      } else {
        // Add current date, featured, and published status when creating
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const blogDataWithDefaults = {
          ...formData,
          date: currentDate,
          featured: true,
          is_published: true,
        };
        await createBlogWithImage(blogDataWithDefaults, imageFile);
        toast.success('Blog created successfully');
      }
      setIsModalOpen(false);
      setEditingBlog(null);
      resetForm();
      fetchBlogs();
    } catch (error) {
      toast.error(editingBlog ? 'Error updating blog' : 'Error creating blog');
      console.error('Error submitting blog:', error);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      category: blog.category || '',
      read_time: blog.read_time,
      image: blog.image || '',
      content: blog.content || '',
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlog(blogId);
        toast.success('Blog deleted successfully');
        fetchBlogs();
      } catch (error) {
        toast.error('Error deleting blog');
        console.error('Error deleting blog:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      category: '',
      read_time: '',
      image: '',
      content: '',
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select a valid image file');
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  const handleCreate = () => {
    setEditingBlog(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Blogs Management</h1>
        <p className="text-gray-400 mt-2">Create, edit, and manage blog posts</p>
      </div>

      {/* Search and Create */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search blogs..."
            className="pl-10 pr-4 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <FaPlus /> Create Blog
        </button>
      </div>

      {/* Blogs Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  Read Time
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    Loading blogs...
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    No blogs found
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {blog.featured && <FaStar className="text-yellow-400 mr-2" />}
                        <div>
                          <div className="text-sm font-medium text-white">{blog.title}</div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">
                            {blog.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <span className="bg-gray-600 text-gray-200 px-2 py-1 rounded-full text-xs">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatDate(blog.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{blog.read_time}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          blog.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {blog.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="text-blue-400 hover:text-blue-600 p-1"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="text-red-400 hover:text-red-600 p-1"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {currentPage} of {totalPages} ({totalItems} total)
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingBlog ? 'Edit Blog' : 'Create Blog'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt *</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Read Time *</label>
                <input
                  type="text"
                  name="read_time"
                  value={formData.read_time}
                  onChange={handleInputChange}
                  placeholder="e.g., 5 min read"
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image field only for creating */}
              {!editingBlog && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Featured Image
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="Or enter image URL"
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-center text-gray-400">or</div>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FaUpload className="w-8 h-8 mb-4 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="mt-2 text-red-400 hover:text-red-600 text-sm"
                        >
                          Remove image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBlog(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingBlog ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
