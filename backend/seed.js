const sequelize = require('./config/database');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order'); // Import to ensure schema availability
const OrderItem = require('./models/OrderItem'); // Import to ensure schema availability

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    
    // Disable Foreign Key Checks to allow dropping tables with relationships
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    
    await sequelize.sync({ force: true }); // Reset DB for seeding

    // Re-enable Foreign Key Checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

    // Create Sample Users (Vendors)
    const vendorUser1 = await User.create({
      name: 'Owner Gourmet',
      email: 'vendor1@christ.edu',
      role: 'vendor',
      password_hash: 'hashedpassword123',
    });

    const vendorUser2 = await User.create({
      name: 'Owner Juice',
      email: 'vendor2@christ.edu',
      role: 'vendor',
      password_hash: 'hashedpassword123',
    });

    // Create Vendors linked to Users
    const vendor1 = await Vendor.create({
      user_id: vendorUser1.id,
      name: 'Gourmet Express',
      status: 'open',
    });

    const vendor2 = await Vendor.create({
      user_id: vendorUser2.id,
      name: 'Juice Bar',
      status: 'open',
    });

    // Create Menu Items for Gourmet Express
    await MenuItem.bulkCreate([
      { vendor_id: vendor1.id, name: 'Tandoori Chicken Sandwich', price: 60, category: 'Food', base_prep_time: 8 },
      { vendor_id: vendor1.id, name: 'Veg Grilled Sandwich', price: 50, category: 'Food', base_prep_time: 6 },
      { vendor_id: vendor1.id, name: 'Chicken Burger', price: 80, category: 'Food', base_prep_time: 10 },
      { vendor_id: vendor1.id, name: 'French Fries', price: 40, category: 'Snacks', base_prep_time: 5 },
      { vendor_id: vendor1.id, name: 'Cold Coffee', price: 50, category: 'Beverage', base_prep_time: 3 },
    ]);

    // Create Menu Items for Juice Bar
    await MenuItem.bulkCreate([
      { vendor_id: vendor2.id, name: 'Orange Juice', price: 40, category: 'Beverage', base_prep_time: 3 },
      { vendor_id: vendor2.id, name: 'Watermelon Juice', price: 40, category: 'Beverage', base_prep_time: 3 },
      { vendor_id: vendor2.id, name: 'Mix Fruit Juice', price: 50, category: 'Beverage', base_prep_time: 4 },
      { vendor_id: vendor2.id, name: 'Oreo Shake', price: 70, category: 'Beverage', base_prep_time: 5 },
      { vendor_id: vendor2.id, name: 'Protein Shake', price: 90, category: 'Beverage', base_prep_time: 4 },
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
