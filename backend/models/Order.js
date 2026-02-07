const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Vendor = require('./Vendor');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // For now, allowing null if we don't strict auth yet, but ideally required
    references: {
      model: User,
      key: 'id',
    },
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Vendor,
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  predicted_pickup_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  actual_pickup_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Relationships
Order.belongsTo(User, { foreignKey: 'student_id', as: 'Student' });
Order.belongsTo(Vendor, { foreignKey: 'vendor_id' });
Vendor.hasMany(Order, { foreignKey: 'vendor_id' });
User.hasMany(Order, { foreignKey: 'student_id' });

module.exports = Order;
