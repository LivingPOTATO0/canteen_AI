const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); // Import http
const { Server } = require('socket.io'); // Import Socket.IO
const sequelize = require('./config/database');
const User = require('./models/User');
const Vendor = require('./models/Vendor');

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow both frontends
    methods: ["GET", "POST", "PUT"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(express.json());

// Make io accessible in routes
app.set('io', io);

// Routes
// Routes
const vendorRoutes = require('./routes/vendorRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const supportRoutes = require('./routes/supportRoutes');

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running correctly', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/support', supportRoutes);

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Join vendor room
  socket.on('join_vendor', (vendorId) => {
    socket.join(`vendor_${vendorId}`);
    console.log(`Socket ${socket.id} joined vendor_${vendorId}`);
  });

  // Join student room (using student ID)
  socket.on('join_student', (studentId) => {
    socket.join(`student_${studentId}`);
    console.log(`Socket ${socket.id} joined student_${studentId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Sync Database and Start Server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    // Listen on server, not app
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();

