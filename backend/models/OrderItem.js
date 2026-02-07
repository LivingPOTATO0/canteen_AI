const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order');
const MenuItem = require('./MenuItem');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,
      key: 'id',
    },
  },
  menu_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: MenuItem,
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  price_at_order: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

// Relationships
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id' });

module.exports = OrderItem;
