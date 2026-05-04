const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Turf = sequelize.define('Turf', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  price_per_hour: { type: DataTypes.INTEGER, allowNull: false },
  sport: { type: DataTypes.STRING, defaultValue: 'Football' },
  rating: { type: DataTypes.FLOAT, defaultValue: 4.0 },
  amenities: { type: DataTypes.ARRAY(DataTypes.TEXT) },
  images: { type: DataTypes.ARRAY(DataTypes.TEXT) },
  owner_id: { type: DataTypes.INTEGER },
  location_point: { type: DataTypes.GEOMETRY('POINT', 4326) },
}, { tableName: 'turfs', timestamps: false });

module.exports = Turf;