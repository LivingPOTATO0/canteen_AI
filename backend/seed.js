const sequelize = require('./config/database');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order'); // Import to ensure schema availability
const OrderItem = require('./models/OrderItem'); // Import to ensure schema availability
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    
    // Disable Foreign Key Checks to allow dropping tables with relationships
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    
    await sequelize.sync({ force: true }); // Reset DB for seeding

    // Re-enable Foreign Key Checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Sample Users (Vendors)
    const vendorUser1 = await User.create({
      name: 'Owner Gourmet',
      email: 'vendor1@christ.edu',
      role: 'vendor',
      password_hash: hashedPassword,
    });

    const vendorUser2 = await User.create({
      name: 'Owner Juice',
      email: 'vendor2@christ.edu',
      role: 'vendor',
      password_hash: hashedPassword,
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

    // --- NEW VENDORS ---

    // 3. Pizza Hut
    const vendorUser3 = await User.create({ name: 'Pizza Manager', email: 'vendor3@christ.edu', role: 'vendor', password_hash: hashedPassword });
    const vendor3 = await Vendor.create({ user_id: vendorUser3.id, name: 'Pizza Hut', status: 'open' });
    await MenuItem.bulkCreate([
        { vendor_id: vendor3.id, name: 'Margherita Pizza', price: 120, category: 'Food', base_prep_time: 15 },
        { vendor_id: vendor3.id, name: 'Peppy Paneer Pizza', price: 180, category: 'Food', base_prep_time: 15 },
        { vendor_id: vendor3.id, name: 'Cheese Garlic Bread', price: 90, category: 'Snacks', base_prep_time: 8 },
        { vendor_id: vendor3.id, name: 'Pasta Italiano', price: 140, category: 'Food', base_prep_time: 12 },
        { vendor_id: vendor3.id, name: 'Choco Volcano', price: 99, category: 'Dessert', base_prep_time: 5 },
    ]);

    // 4. Subway
    const vendorUser4 = await User.create({ name: 'Subway Manager', email: 'vendor4@christ.edu', role: 'vendor', password_hash: hashedPassword });
    const vendor4 = await Vendor.create({ user_id: vendorUser4.id, name: 'Subway', status: 'busy' });
    await MenuItem.bulkCreate([
        { vendor_id: vendor4.id, name: 'Veggie Delite Sub', price: 110, category: 'Food', base_prep_time: 5 },
        { vendor_id: vendor4.id, name: 'Chicken Teriyaki Sub', price: 160, category: 'Food', base_prep_time: 6 },
        { vendor_id: vendor4.id, name: 'Paneer Tikka Sub', price: 140, category: 'Food', base_prep_time: 6 },
        { vendor_id: vendor4.id, name: 'Cookie', price: 40, category: 'Dessert', base_prep_time: 0 },
        { vendor_id: vendor4.id, name: 'Iced Tea', price: 50, category: 'Beverage', base_prep_time: 1 },
    ]);

    // 5. Starbucks
    const vendorUser5 = await User.create({ name: 'Starbucks Manager', email: 'vendor5@christ.edu', role: 'vendor', password_hash: hashedPassword });
    const vendor5 = await Vendor.create({ user_id: vendorUser5.id, name: 'Starbucks', status: 'open' });
    await MenuItem.bulkCreate([
        { vendor_id: vendor5.id, name: 'Cappuccino', price: 180, category: 'Beverage', base_prep_time: 5 },
        { vendor_id: vendor5.id, name: 'Frappuccino', price: 220, category: 'Beverage', base_prep_time: 6 },
        { vendor_id: vendor5.id, name: 'Latte', price: 190, category: 'Beverage', base_prep_time: 5 },
        { vendor_id: vendor5.id, name: 'Croissant', price: 120, category: 'Snacks', base_prep_time: 2 },
        { vendor_id: vendor5.id, name: 'Muffin', price: 110, category: 'Snacks', base_prep_time: 1 },
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
