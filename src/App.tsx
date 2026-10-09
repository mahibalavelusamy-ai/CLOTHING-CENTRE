import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/authContext';
import { Storefront } from './components/Storefront';
import { StaffLogin } from './components/staff/StaffLogin';
import { StaffProtectedRoute } from './components/staff/StaffProtectedRoute';
import { StaffPortalLayout } from './components/staff/StaffPortalLayout';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { StaffProducts } from './components/staff/StaffProducts';
import { StaffInventory } from './components/staff/StaffInventory';
import { StaffOrders } from './components/staff/StaffOrders';
import { StaffTeam } from './components/staff/StaffTeam';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Customer Storefront */}
          <Route path="/" element={<Storefront />} />

          {/* Staff Login */}
          <Route path="/staff/login" element={<StaffLogin />} />

          {/* Protected Staff & Administration Portal */}
          <Route
            path="/staff"
            element={
              <StaffProtectedRoute>
                <StaffPortalLayout />
              </StaffProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="products" element={<StaffProducts />} />
            <Route path="inventory" element={<StaffInventory />} />
            <Route path="orders" element={<StaffOrders />} />
            <Route path="team" element={<StaffTeam />} />
          </Route>

          {/* Fallback wildcard to Storefront */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
