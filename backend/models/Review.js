const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Turf = require('./Turf');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
  turf_id: { type: DataTypes.INTEGER, references: { model: Turf, key: 'id' } },
  rating: { type: DataTypes.INTEGER },
  comment: { type: DataTypes.TEXT },
}, { tableName: 'reviews', timestamps: false });

Review.belongsTo(User, { foreignKey: 'user_id' });
Review.belongsTo(Turf, { foreignKey: 'turf_id' });

module.exports = Review;