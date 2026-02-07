const Order = require('./models/Order');
const sequelize = require('./config/database');

const checkOrder = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        const token = '8423';
        const order = await Order.findOne({ where: { token } });
        
        if (order) {
            console.log(`Found Order #${token}:`, JSON.stringify(order.toJSON(), null, 2));
        } else {
            console.log(`Order #${token} NOT FOUND.`);
            
            // List last 5 orders to see valid tokens
            const recentOrders = await Order.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
            console.log("Recent Orders Tokens:", recentOrders.map(o => o.token));
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await sequelize.close();
    }
};

checkOrder();
