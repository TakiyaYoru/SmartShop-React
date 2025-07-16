// File: webfrontend/src/App.jsx (FIXED COMPLETE VERSION)

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/common/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage'; 
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import NotFoundPage from './pages/NotFoundPage';
import ChatTest from './components/chat/ChatTest';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import CreateProductPage from './pages/admin/CreateProductPage';
import EditProductPage from './pages/admin/EditProductPage';

// ✅ THÊM MỚI: Admin Orders Components
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import CreateOrderPage from './pages/admin/CreateOrderPage';

// Protected Routes
import ProtectedRoute, { AdminRoute, ManagerRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/chat-test" element={<ChatTest />} />
        
        {/* ===== PROTECTED CUSTOMER ROUTES ===== */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <Layout>
                <ProductsPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/products/:id" 
          element={
            <ProtectedRoute>
              <Layout>
                <ProductDetailPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <Layout>
                <CartPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <Layout showChat={false}>
                <CheckoutPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Layout>
                <OrdersPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/orders/:orderNumber" 
          element={
            <ProtectedRoute>
              <Layout>
                <OrderDetailPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/order-success/:orderNumber" 
          element={
            <ProtectedRoute>
              <Layout>
                <OrderSuccessPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* ===== ADMIN ROUTES ===== */}
        
        {/* Admin Dashboard */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            </AdminRoute>
          } 
        />
        
        {/* Admin Products Routes */}
        <Route 
          path="/admin/products" 
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProductsPage />
              </AdminLayout>
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/products/create" 
          element={
            <AdminRoute>
              <AdminLayout>
                <CreateProductPage />
              </AdminLayout>
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/products/:id/edit" 
          element={
            <AdminRoute>
              <AdminLayout>
                <EditProductPage />
              </AdminLayout>
            </AdminRoute>
          } 
        />

        {/* ✅ THÊM MỚI: Admin Orders Routes */}
        <Route 
          path="/admin/orders" 
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOrdersPage />
              </AdminLayout>
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/orders/create" 
          element={
            <AdminRoute>
              <AdminLayout>
                <CreateOrderPage />
              </AdminLayout>
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/orders/:orderNumber" 
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOrderDetailPage />
              </AdminLayout>
            </AdminRoute>
          } 
        />
        
        {/* Admin placeholder routes - có thể implement sau */}
        <Route 
          path="/admin/categories" 
          element={
            <AdminRoute>
              <AdminLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Categories Management</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Categories management will be implemented soon! 📂</p>
                  </div>
                </div>
              </AdminLayout>
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/brands" 
          element={
            <AdminRoute>
              <AdminLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Brands Management</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Brands management will be implemented soon! 🏷️</p>
                  </div>
                </div>
              </AdminLayout>
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <AdminLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Users Management</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Users management will be implemented soon! 👥</p>
                  </div>
                </div>
              </AdminLayout>
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/reports" 
          element={
            <AdminRoute>
              <AdminLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Reports will be implemented soon! 📊</p>
                  </div>
                </div>
              </AdminLayout>
            </AdminRoute>
          } 
        />
        
        {/* ===== MANAGER ROUTE (PLACEHOLDER) ===== */}
        <Route 
          path="/manager" 
          element={
            <ManagerRoute>
              <div className="p-8 text-center">
                <div className="max-w-md mx-auto">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Manager Dashboard 📊
                  </h1>
                  <p className="text-gray-600 mb-4">
                    Manager features will be implemented here.
                  </p>
                </div>
              </div>
            </ManagerRoute>
          } 
        />
        
        {/* ===== 404 PAGE ===== */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;