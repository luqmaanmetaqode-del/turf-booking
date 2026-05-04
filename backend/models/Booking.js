const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Turf = require('./Turf');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
  turf_id: { type: DataTypes.INTEGER, references: { model: Turf, key: 'id' } },
  date: { type: DataTypes.STRING, allowNull: false },
  time_slot: { type: DataTypes.STRING, allowNull: false },
  total_price: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'confirmed' },
  payment_id: { type: DataTypes.STRING },
}, { tableName: 'bookings', timestamps: false });

Booking.belongsTo(Turf, { foreignKey: 'turf_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Booking;