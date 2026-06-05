const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Blog = sequelize.define(
  'Blog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    read_time: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT('long'), // Use LONGTEXT for base64 images
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'blogss',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Blog;
