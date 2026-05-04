const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Offer = sequelize.define('Offer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  discount: { type: DataTypes.STRING },
  turf_id: { type: DataTypes.INTEGER },
  valid_until: { type: DataTypes.DATE },
}, { tableName: 'offers', timestamps: false });

module.exports = Offer;