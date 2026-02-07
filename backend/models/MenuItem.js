const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Vendor = require('./Vendor');

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Vendor,
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  base_prep_time: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false,
    defaultValue: 5,
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

// Establish Relationship
MenuItem.belongsTo(Vendor, { foreignKey: 'vendor_id' });
Vendor.hasMany(MenuItem, { foreignKey: 'vendor_id' });

module.exports = MenuItem;
