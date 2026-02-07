const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const MenuItem = require('../models/MenuItem');
const Vendor = require('../models/Vendor');

// Utility to generate a short token
const generateToken = () => {
  return '#' + Math.floor(1000 + Math.random() * 9000);
};

// PREDICTION ENGINE LOGIC
const calculatePickupTime = async (vendorId, newOrderItems) => {
  // 1. Get vendor's current active orders (pending or preparing)
  const activeOrders = await Order.findAll({
    where: {
      vendor_id: vendorId,
      status: {
        [Op.in]: ['pending', 'preparing'],
      },
    },
    include: [{ model: OrderItem, include: [MenuItem] }],
    order: [['predicted_pickup_time', 'DESC']], // Get the one finishing last
  });

  // 2. Calculate Queue Finish Time
  let queueFinishTime = new Date(); // Start now
  
  if (activeOrders.length > 0) {
    // If there are orders, the queue "frees up" when the last order is predicted to be done
    // However, to be more robust, we might want to look at the MAX predicted_pickup_time
    const lastOrderTime = activeOrders[0].predicted_pickup_time;
    if (lastOrderTime > queueFinishTime) {
      queueFinishTime = new Date(lastOrderTime);
    }
  }

  // 3. Calculate New Order Prep Time
  // Simple heuristic: Total Prep = Sum(ItemPrep * Qty)
  // Optimization: Parallel factor? For now, we'll keep it linear (single cook hypothesis) for safety.
  // Or maybe reduce it slightly if we assume parallel cooking (e.g., 2 burners).
  // Let's stick to linear for specific items to ensure we don't under-predict.
  
  let newOrderPrepTimeMs = 0;
  for (const item of newOrderItems) {
    const menuItem = await MenuItem.findByPk(item.menu_item_id);
    if (menuItem) {
        newOrderPrepTimeMs += (menuItem.base_prep_time * item.quantity) * 60000;
    }
  }

  // 4. Final Predicted Time
  // Logic: We can start preparing ONLY when a "slot" opens? 
  // OR: If the kitchen processes in parallel, maybe we just add to NOW?
  // Safe bet: The kitchen is "FIFO" for the main cook.
  // Predicted Time = Max(Now, QueueFinish) + OrderPrep
  
  const predictedTime = new Date(queueFinishTime.getTime() + newOrderPrepTimeMs);
  
  return predictedTime;
};

// POST /api/orders - Place a new order
router.post('/', async (req, res) => {
  try {
    const { studentId, vendorId, items } = req.body; 
    
    if (!vendorId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    // Calculate prediction
    const predictedTime = await calculatePickupTime(vendorId, items);

    // Calculate Total Price
    let totalPrice = 0;
    for (const item of items) {
       const menuItem = await MenuItem.findByPk(item.menu_item_id);
       if(menuItem) {
         totalPrice += parseFloat(menuItem.price) * item.quantity;
       }
    }

    // Create Order
    const newOrder = await Order.create({
      student_id: studentId || null,
      vendor_id: vendorId,
      status: 'pending',
      total_price: totalPrice,
      predicted_pickup_time: predictedTime,
      token: generateToken(),
    });

    // Create Order Items
    for (const item of items) {
        const menuItem = await MenuItem.findByPk(item.menu_item_id);
        await OrderItem.create({
            order_id: newOrder.id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            price_at_order: menuItem.price
        });
    }

    // Fetch full order details for the socket emit
    const fullOrder = await Order.findByPk(newOrder.id, {
        include: [{ model: OrderItem, include: [MenuItem] }]
    });

    // Emit Socket Event to Vendor
    const io = req.app.get('io');
    io.to(`vendor_${vendorId}`).emit('new_order', fullOrder);

    res.status(201).json(newOrder);

  } catch (error) {
    console.error('Order Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // pending, preparing, ready, completed

        const order = await Order.findByPk(id, {
             include: [{ model: User, as: 'Student' }] 
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = status;
        // If ready, update actual pickup time? 
        if (status === 'completed') {
            order.actual_pickup_time = new Date();
        }

        await order.save();

        // Emit to Student
        const io = req.app.get('io');
        if (order.student_id) {
             io.to(`student_${order.student_id}`).emit('order_status_update', {
                 orderId: order.id,
                 status: status,
                 token: order.token,
                 predicted_pickup_time: order.predicted_pickup_time
             });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/orders/student/:studentId
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const orders = await Order.findAll({
            where: { student_id: studentId },
            include: [
                { model: Vendor, attributes: ['name'] },
                { model: OrderItem, include: [MenuItem] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/orders/vendor/:vendorId
router.get('/vendor/:vendorId', async (req, res) => {
    try {
        const { vendorId } = req.params;
        // Fetch orders that are NOT completed or cancelled to keep the list clean?
        // Or all of them. Let's filter for active ones primarily or sort by status.
        const orders = await Order.findAll({
            where: { 
                vendor_id: vendorId,
                status: {
                    [Op.ne]: 'cancelled' // Show everything else
                }
            },
            include: [
                 { model: User, as: 'Student', attributes: ['name'] },
                 { model: OrderItem, include: [MenuItem] }
            ],
            order: [['predicted_pickup_time', 'ASC']]
        });
        res.json(orders);
    } catch (error) {
         res.status(500).json({ error: error.message });
    }
});

module.exports = router;
