const sequelize = require('./config/database');
const User = require('./models/User');
const Vendor = require('./models/Vendor');

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

syncDatabase();
