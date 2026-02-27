import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import Locations from './pages/Locations';
import Halls from './pages/Halls';
import Services from './pages/Services';
import SaleLeads from './pages/SaleLeads';
import SaleCustomers from './pages/SaleCustomers';
import LeadDetail from './pages/LeadDetail';
import CustomerDetail from './pages/CustomerDetail';
import './App.css';

const themeConfig = {
  token: {
    colorPrimary: '#667eea',
    borderRadius: 8,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  },
  components: {
    Table: {
      headerBg: '#fafafa',
      headerBorderRadius: 8,
    },
    Card: {
      borderRadius: 12,
    },
  },
};

export default function App() {
  return (
    <ConfigProvider theme={themeConfig} locale={viVN}>
      <AntApp>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="leads" element={<Leads />} />
                <Route path="customers" element={<Customers />} />
                <Route path="locations" element={<Locations />} />
                <Route path="halls" element={<Halls />} />
                <Route path="services" element={<Services />} />
                <Route path="sales/leads" element={<SaleLeads />} />
                <Route path="sales/customers" element={<SaleCustomers />} />
                <Route path="sales/lead/:id" element={<LeadDetail />} />
                <Route path="sales/customer/:id" element={<CustomerDetail />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
