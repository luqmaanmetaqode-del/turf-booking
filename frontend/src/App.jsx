import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import TurfDetail from './pages/TurfDetail';
import MyBookings from './pages/MyBookings';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import PartnerLogin from './pages/partner/PartnerLogin';
import PartnerRegister from './pages/partner/PartnerRegister';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';

function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Partner Portal — No Navbar/Footer */}
            <Route path="/partner" element={<PartnerLogin />} />
            <Route path="/partner/login" element={<PartnerLogin />} />
            <Route path="/partner/register" element={<PartnerRegister />} />
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Main Site — With Navbar/Footer */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/explore" element={<MainLayout><Explore /></MainLayout>} />
            <Route path="/turf/:id" element={<MainLayout><TurfDetail /></MainLayout>} />
            <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
            <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
            <Route path="/checkout" element={
              <MainLayout><ProtectedRoute><Checkout /></ProtectedRoute></MainLayout>
            } />
            <Route path="/my-bookings" element={
              <MainLayout><ProtectedRoute><MyBookings /></ProtectedRoute></MainLayout>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
