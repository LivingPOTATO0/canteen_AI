# Canteen Rush AI - Detailed Implementation Phases

This document provides a step-by-step breakdown of the technical implementation. Each phase builds upon the previous one.

> **Before Starting:**
>
> 1. Create a workspace folder: `mkdir Canteen_Rush_AI`
> 2. Initialize Git: `git init`
> 3. Create a `.gitignore` (node_modules, .env)

---

## Phase 1: Infrastructure & Core Foundation

### User Setup Instructions

**Execute these commands in your `Canteen_Rush_AI` directory:**

1. **Backend (Node.js + Express + MySQL)**:

   ```bash
   mkdir backend && cd backend
   npm init -y
   # Install dependencies: Express, CORS, Dotenv, MySQL2, Sequelize (ORM)
   npm install express cors dotenv mysql2 sequelize
   npm install --save-dev nodemon
   # Create a .env file with your DB credentials:
   # DB_HOST=localhost, DB_USER=root, DB_PASSWORD=yourpassword, DB_NAME=canteen_rush
   cd ..
   ```

2. **Frontend (React + Tailwind)**:

   ```bash
   npm create vite@latest frontend -- --template react
   cd frontend
   npm install
   # Tailwind Setup
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   # Update tailwind.config.js content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
   # Add @tailwind directives to src/index.css
   # Additional Libraries
   npm install axios react-router-dom lucide-react framer-motion
   cd ..
   ```

3. **Database**:
   - Ensure MySQL is running.
   - Create a database named: `canteen_rush`.

### AI Implementation Prompt (Copy & Paste to Start Phase 1)

> "I have set up the project structure with a `backend` (Node/Express) and `frontend` (React/Vite/Tailwind). The MySQL database `canteen_rush` is ready and credentials are in `backend/.env`.
>
> Please implement the basic foundation for Canteen Rush AI:
> **Backend:**
>
> 1. Set up `server.js` with Express, CORS, and BodyParser.
> 2. Configure `config/database.js` using Sequelize to connect to MySQL.
> 3. Create the `User` model (id, name, email, role: 'student'|'vendor', password_hash).
> 4. Create the `Vendor` model (id, user_id, name, status: 'open'|'closed'|'busy').
> 5. Create a basic `/api/health` route to test connectivity.
> 6. Implement a script `syncDatabase.js` to sync models.
>
> **Frontend:**
>
> 1. Clear the default Vite boilerplate.
> 2. Create a basic layout with a Navbar (Logo "Canteen Rush", Login/Signup buttons).
> 3. Set up React Router with routes for `/`, `/login`, `/dashboard`.
> 4. Fetch the `/api/health` endpoint on load and log the result to ensure connection works."

### Verification / Testing

- **Backend**: Run `npm run dev` (with nodemon). Check logs for "Database Connected Successfully".
- **Frontend**: Run `npm run dev`. Open `http://localhost:5173`.
- **Database**: Check MySQL (via Workbench/CLI) to confirm tables `Users` and `Vendors` exist.

---

## Phase 2: Vendor Management & Menu System

### AI Implementation Prompt

> "Phase 1 is complete. Now, let's build the Vendor Management System.
>
> **Backend:**
>
> 1. Create `MenuItem` model (id, vendor_id, name, price, category, base_prep_time, is_available).
> 2. Implement API routes:
>    - `POST /api/vendor/menu`: Add item.
>    - `GET /api/vendor/menu`: Fetch vendor's menu.
>    - `PUT /api/vendor/status`: Update shop status (Open/Busy).
> 3. Seed the database with 2 sample vendors (e.g., 'Gourmet Express', 'Juice Bar') and 5 menu items each.
>
> **Frontend:**
>
> 1. create a `VendorDashboard` page.
> 2. Display the list of menu items in a clean table/card layout.
> 3. Add a form to 'Add New Item' (Name, Price, Prep Time).
> 4. Add a Status Toggle (Open/Closed) at the top of the dashboard.
>
> Use standard React hooks for state management."

### Verification / Testing

- **Action**: Go to Vendor Dashboard. Add a "Veg Burger" (Price: 50, Prep: 5 mins).
- **Check**: Verify the item appears in the list immediately.
- **Check DB**: Verify the new row in `MenuItems` table.

---

## Phase 3: Student Ordering & Deterministic Prediction Engine

### AI Implementation Prompt

> "Phase 2 is verified. Now, implement the core Student Ordering flow and the Prediction Engine.
>
> **Backend:**
>
> 1. Create `Order` model (id, student_id, vendor_id, status: 'pending'|'preparing'|'ready'|'completed', predicted_pickup_time, token).
> 2. Create `OrderItem` junction table (order_id, menu_item_id, quantity).
> 3. **Implement the Prediction Logic (Crucial):**
>    - Create a utility function `calculatePickupTime(vendorId, newOrderItems)`.
>    - Logic: Fetch vendor's current active orders. Sum up their remaining prep times. Add the new order's total prep time (sum of items \* quantity).
>    - Return a timestamp: `NOW() + queue_wait_time + order_prep_time`.
> 4. `POST /api/orders`: Validate items, calculate time, create order, return predicted time & token.
>
> **Frontend:**
>
> 1. Create `StudentDashboard`: List available vendors.
> 2. Clicking a vendor shows their Menu.
> 3. Implement 'Add to Cart' functionality (local state).
> 4. **Cart/Checkout**:
>    - Show 'Estimated Wait: X mins' _before_ confirming.
>    - 'Place Order' button sends the request.
> 5. **Order Success Screen**:
>    - Display: 'Order Placed! Token: #1234'.
>    - Display: 'Pickup at: 12:45 PM' (The predicted time).
>    - Display: 'Status: Pending'."

### Verification / Testing

- **Action**: Place an order for 2 Burgers (5 mins each).
- **Check**: Does the confirmation screen say pickup in ~10-12 mins?
- **Action**: Immediately place a SECOND order (different user/browser).
- **Check**: Does the second order's time account for the FIRST order? (Should be ~20+ mins).

---

## Phase 4: Real-time Coordination Layer

### User Setup Instructions

**Execute in `backend` folder:**

```bash
npm install socket.io
```

**Execute in `frontend` folder:**

```bash
npm install socket.io-client
```

### AI Implementation Prompt

> "Phase 3 is working. Now, make the system Real-Time using Socket.IO.
>
> **Backend:**
>
> 1. Initialize `socket.io` in `server.js`.
> 2. Update `POST /api/orders`: Emit `new_order` event to the specific vendor's room.
> 3. Implement `PUT /api/orders/:id/status`:
>    - When Vendor updates status (Pending -> Preparing -> Ready), emit `order_status_update` to the specific student.
>
> **Frontend:**
>
> 1. **Vendor Dashboard**: Listen for `new_order`. Update the 'Active Orders' list instantly without refresh. Add sound alert (optional).
> 2. **Student Order Tracking**: Listen for `order_status_update`.
>    - When status becomes 'Ready', show a Green 'Ready for Pickup!' banner.
>    - Update the progress bar (Placed -> Preparing -> Ready).
>
> **UI Polish**: Use framer-motion for smooth transitions when new orders appear."

### Verification / Testing

- **Setup**: Open two browser windows side-by-side. Left: Student. Right: Vendor.
- **Action**: Student places order.
- **Check**: Vendor dashboard updates instantly (visible in < 1s).
- **Action**: Vendor marks "Ready".
- **Check**: Student screen turns Green instantly.

---

## Phase 5: Groq AI Integration (Explainability)

### AI Implementation Prompt

> "Phase 4 is complete. Finally, integrate Groq AI to explain the wait times.
>
> **Backend:**
>
> 1. Install Groq SDK (`npm install groq-sdk`).
> 2. Create endpoint `GET /api/vendor/:id/insight`.
> 3. **Logic**:
>    - Gather context: Vendor's current queue length, number of active orders, last 5 order completion times.
>    - Prompt Groq: 'The vendor has 5 active orders, total prep time is 45 mins. Explain this to a student briefly.'
>    - Return the AI text response.
>
> **Frontend:**
>
> 1. On the Vendor Menu page, display a 'Live Shop Status' card.
> 2. Fetch and display the AI insight.
>    - Example: 'The kitchen is busy! 5 orders ahead. Expect a slightly longer wait for grilled items.'
>
> **Final Polish**: Ensure the UI looks 'Premium' (Glassmorphism, clean typography, dark mode accents)."

### Verification / Testing

- **Action**: View a vendor with active orders.
- **Check**: Does the AI text appear? Is it context-aware (mentioning "busy" or "quiet")?
