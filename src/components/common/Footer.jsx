// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Sản phẩm',
      links: [
        { name: 'Tất cả sản phẩm', href: '/products' },
        { name: 'Sản phẩm mới', href: '/products?sort=newest' },
        { name: 'Sản phẩm bán chạy', href: '/products?sort=bestseller' },
        { name: 'Sản phẩm giảm giá', href: '/products?discount=true' },
      ]
    },
    {
      title: 'Danh mục',
      links: [
        { name: 'Điện thoại', href: '/categories/phones' },
        { name: 'Laptop', href: '/categories/laptops' },
        { name: 'Tablet', href: '/categories/tablets' },
        { name: 'Phụ kiện', href: '/categories/accessories' },
      ]
    },
    {
      title: 'Hỗ trợ',
      links: [
        { name: 'Liên hệ', href: '/contact' },
        { name: 'Hướng dẫn mua hàng', href: '/help/shopping' },
        { name: 'Chính sách đổi trả', href: '/policies/return' },
        { name: 'Bảo hành', href: '/policies/warranty' },
      ]
    },
    {
      title: 'Công ty',
      links: [
        { name: 'Về chúng tôi', href: '/about' },
        { name: 'Tuyển dụng', href: '/careers' },
        { name: 'Tin tức', href: '/news' },
        { name: 'Đối tác', href: '/partners' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: '📘' },
    { name: 'Instagram', href: '#', icon: '📷' },
    { name: 'Twitter', href: '#', icon: '🐦' },
    { name: 'YouTube', href: '#', icon: '📺' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">SmartShop</h3>
                <p className="text-gray-400 text-sm">E-commerce Platform</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Nền tảng thương mại điện tử hàng đầu Việt Nam, mang đến trải nghiệm mua sắm tuyệt vời với hàng triệu sản phẩm chất lượng.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                  title={social.name}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h4 className="text-lg font-semibold text-white mb-2">
                Đăng ký nhận tin khuyến mãi
              </h4>
              <p className="text-gray-400 text-sm">
                Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt qua email
              </p>
            </div>
            <div className="mt-4 lg:mt-0 lg:w-1/2 lg:ml-8">
              <form className="sm:flex">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto btn btn-primary"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © {currentYear} SmartShop. Tất cả quyền được bảo lưu.
              </p>
              <div className="flex space-x-6">
                <Link to="/policies/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Chính sách bảo mật
                </Link>
                <Link to="/policies/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Điều khoản sử dụng
                </Link>
                <Link to="/policies/cookie" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Chính sách Cookie
                </Link>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">Phương thức thanh toán:</span>
                <div className="flex space-x-2">
                  <div className="w-8 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">V</span>
                  </div>
                  <div className="w-8 h-6 bg-gradient-to-r from-red-600 to-orange-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">MC</span>
                  </div>
                  <div className="w-8 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;