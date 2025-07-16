// webfrontend/src/router.jsx - Complete with Admin Orders Routes

import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

// ===== CUSTOMER PAGES =====
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
import ReviewPage from './pages/ReviewPage';
import NotFoundPage from './pages/NotFoundPage';

// ===== ADMIN COMPONENTS =====
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import CreateProductPage from './pages/admin/CreateProductPage';
import EditProductPage from './pages/admin/EditProductPage';

// ✅ THÊM MỚI: Admin Orders Components
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import CreateOrderPage from './pages/admin/CreateOrderPage';

// ✅ THÊM MỚI: Admin Reviews Component
import AdminReviewsPage from './pages/admin/AdminReviewsPage';

// ===== PROTECTED ROUTES =====
import ProtectedRoute, { AdminRoute, ManagerRoute } from './components/auth/ProtectedRoute';

// Router configuration với future flags
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Create routes
const routes = createRoutesFromElements(
  <Route>
    {/* ===== PUBLIC ROUTES ===== */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    
    {/* ===== PUBLIC PAGES ===== */}
    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/products/:id" element={<ProductDetailPage />} />
    
    {/* ===== PROTECTED CUSTOMER ROUTES ===== */}
    <Route 
      path="/cart" 
      element={
        <ProtectedRoute>
          <CartPage />
        </ProtectedRoute>
      } 
    />

    <Route 
      path="/checkout" 
      element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      } 
    />

    <Route 
      path="/orders" 
      element={
        <ProtectedRoute>
          <OrdersPage />
        </ProtectedRoute>
      } 
    />

    <Route 
      path="/orders/:orderNumber" 
      element={
        <ProtectedRoute>
          <OrderDetailPage />
        </ProtectedRoute>
      } 
    />

    <Route 
      path="/order-success/:orderNumber" 
      element={
        <ProtectedRoute>
          <OrderSuccessPage />
        </ProtectedRoute>
      } 
    />

    <Route 
      path="/review/:orderNumber/:productId" 
      element={
        <ProtectedRoute>
          <ReviewPage />
        </ProtectedRoute>
      } 
    />
    
    {/* ===== ADMIN ROUTES ===== */}
    <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>}>
      {/* Dashboard */}
      <Route index element={<DashboardPage />} />
      
      {/* Products Management */}
      <Route path="products" element={<AdminProductsPage />} />
      <Route path="products/create" element={<CreateProductPage />} />
      <Route path="products/edit/:id" element={<EditProductPage />} />
      
      {/* ✅ THÊM MỚI: Orders Management Routes */}
      <Route path="orders" element={<AdminOrdersPage />} />
      <Route path="orders/create" element={<CreateOrderPage />} />
      <Route path="orders/:orderNumber" element={<AdminOrderDetailPage />} />
      
      {/* ✅ THÊM MỚI: Reviews Management Route */}
      <Route path="reviews" element={<AdminReviewsPage />} />
      
      {/* Placeholder admin routes - sẽ implement sau */}
      <Route path="categories" element={
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Categories Management</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Categories management will be implemented soon! 📂</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Features sẽ có:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Tạo/sửa/xóa danh mục</li>
                <li>Cây danh mục phân cấp</li>
                <li>Upload hình ảnh danh mục</li>
                <li>SEO optimization</li>
              </ul>
            </div>
          </div>
        </div>
      } />
      
      <Route path="brands" element={
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Brands Management</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Brands management will be implemented soon! 🏷️</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Features sẽ có:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Quản lý thương hiệu</li>
                <li>Logo và mô tả thương hiệu</li>
                <li>Thống kê sản phẩm theo thương hiệu</li>
                <li>Featured brands</li>
              </ul>
            </div>
          </div>
        </div>
      } />
      
      <Route path="users" element={
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Users Management</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Users management will be implemented soon! 👥</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Features sẽ có:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Quản lý tài khoản khách hàng</li>
                <li>Phân quyền admin/manager</li>
                <li>Lịch sử hoạt động</li>
                <li>Báo cáo khách hàng</li>
              </ul>
            </div>
          </div>
        </div>
      } />
      
      <Route path="reports" element={
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Reports and analytics will be implemented soon! 📊</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Features sẽ có:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Báo cáo doanh thu</li>
                <li>Thống kê sản phẩm bán chạy</li>
                <li>Phân tích khách hàng</li>
                <li>Dashboard analytics</li>
              </ul>
            </div>
          </div>
        </div>
      } />
      
      <Route path="settings" element={
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Settings will be implemented soon! ⚙️</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Features sẽ có:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Cài đặt hệ thống</li>
                <li>Quản lý thông báo</li>
                <li>Cấu hình thanh toán</li>
                <li>Backup & restore</li>
              </ul>
            </div>
          </div>
        </div>
      } />
    </Route>
    
    {/* ===== MANAGER ROUTES ===== */}
    <Route path="/manager/*" element={
      <ManagerRoute>
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                👨‍💼 Manager Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome to SmartShop Manager Panel!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-3">📊 Thống kê nhanh</h3>
                <p className="text-gray-600 text-sm">
                  Dashboard với các KPI quan trọng sẽ được triển khai ở đây.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-3">📋 Quản lý đơn hàng</h3>
                <p className="text-gray-600 text-sm">
                  Manager có thể xem và cập nhật trạng thái đơn hàng.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-3">📦 Quản lý kho</h3>
                <p className="text-gray-600 text-sm">
                  Theo dõi tồn kho và cảnh báo hết hàng.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-3">👥 Hỗ trợ khách hàng</h3>
                <p className="text-gray-600 text-sm">
                  Công cụ chat và hỗ trợ khách hàng trực tuyến.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ManagerRoute>
    } />
    
    {/* ===== 404 PAGE ===== */}
    <Route path="*" element={<NotFoundPage />} />
  </Route>
);

// Create router với configuration
export const router = createBrowserRouter(routes, routerConfig);