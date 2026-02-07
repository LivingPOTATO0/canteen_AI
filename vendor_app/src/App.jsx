import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VendorDashboard from './pages/VendorDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 font-sans text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<VendorDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;