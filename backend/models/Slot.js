const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Turf = require('./Turf');

const Slot = sequelize.define('Slot', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  turf_id: { type: DataTypes.INTEGER, references: { model: Turf, key: 'id' } },
  date: { type: DataTypes.STRING, allowNull: false },
  time_slot: { type: DataTypes.STRING, allowNull: false },
  is_booked: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_locked: { type: DataTypes.BOOLEAN, defaultValue: false },
  locked_until: { type: DataTypes.DATE },
}, { tableName: 'slots', timestamps: false });

Slot.belongsTo(Turf, { foreignKey: 'turf_id' });

module.exports = Slot;