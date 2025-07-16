// src/components/common/Layout.jsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatWidget from '../chat/ChatWidget';

const Layout = ({ 
  children, 
  showHeader = true, 
  showFooter = true, 
  containerClass = "min-h-screen bg-gray-50",
  contentClass = "flex-1",
  showChat = true
}) => {
  return (
    <div className={containerClass}>
      {showHeader && <Header />}
      
      <main className={contentClass}>
        {children}
      </main>
      
      {showFooter && <Footer />}
      
      {/* AI Chat Widget */}
      {showChat && <ChatWidget />}
    </div>
  );
};

// Specialized Layout variants
export const AuthLayout = ({ children }) => (
  <Layout 
    showHeader={false} 
    showFooter={false}
    containerClass="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
    contentClass="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    {children}
  </Layout>
);

export const AdminLayout = ({ children }) => (
  <Layout 
    showFooter={false}
    containerClass="min-h-screen bg-gray-100"
    contentClass="flex-1"
  >
    {children}
  </Layout>
);

export const ShopLayout = ({ children }) => (
  <Layout 
    containerClass="min-h-screen bg-white"
    contentClass="flex-1"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  </Layout>
);

export const CheckoutLayout = ({ children }) => (
  <Layout 
    showFooter={false}
    containerClass="min-h-screen bg-gray-50"
    contentClass="flex-1"
  >
    {children}
  </Layout>
);

export default Layout;