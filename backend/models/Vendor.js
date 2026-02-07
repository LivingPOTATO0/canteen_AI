const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Vendor = sequelize.define('Vendor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'busy'),
    defaultValue: 'closed',
  },
});

// Establish Relationship
Vendor.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Vendor, { foreignKey: 'user_id' });

module.exports = Vendor;
