// src/pages/admin/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  CalendarIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { GET_MONTHLY_REPORT, GET_SALES_REPORT, GET_REPORT_STATS, GET_PRODUCT_ORDERS } from '../../graphql/reports';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState({
    fromDate: format(new Date().setDate(1), 'yyyy-MM-dd'),
    toDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Tạo dateRange cho năm được chọn
  const yearDateRange = {
    fromDate: `${selectedYear}-01-01`,
    toDate: `${selectedYear}-12-31`
  };

  // Queries với polling để auto-refresh
  const { data: monthlyData, loading: monthlyLoading, refetch: refetchMonthly } = useQuery(GET_MONTHLY_REPORT, {
    variables: { year: selectedYear },
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000, // Refresh mỗi 30 giây
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      setLastUpdate(new Date());
      setShowUpdateNotification(true);
      setTimeout(() => setShowUpdateNotification(false), 3000);
    }
  });

  const { data: salesData, loading: salesLoading } = useQuery(GET_SALES_REPORT, {
    variables: {
      dateRange,
      first: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
      search: searchTerm
    },
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000, // Refresh mỗi 30 giây
    notifyOnNetworkStatusChange: true
  });

  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useQuery(GET_REPORT_STATS, {
    variables: { dateRange: yearDateRange },
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000, // Refresh mỗi 30 giây
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      setLastUpdate(new Date());
      setShowUpdateNotification(true);
      setTimeout(() => setShowUpdateNotification(false), 3000);
    }
  });

  // Query để lấy chi tiết đơn hàng của sản phẩm
  const { data: productOrdersData, loading: productOrdersLoading } = useQuery(GET_PRODUCT_ORDERS, {
    variables: { 
      productId: selectedProduct?.productId || '', 
      dateRange 
    },
    skip: !selectedProduct,
    fetchPolicy: 'cache-and-network'
  });

  // Auto refresh khi có đơn hàng mới (sau khi đã khai báo queries)
  useEffect(() => {
    const interval = setInterval(() => {
      // Kiểm tra xem có đơn hàng mới không (có thể thay bằng WebSocket sau này)
      if (refetchStats && refetchMonthly) {
        refetchStats();
        refetchMonthly();
      }
    }, 30000); // 30 giây

    return () => clearInterval(interval);
  }, [refetchStats, refetchMonthly]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Chart colors
  const chartColors = {
    revenue: '#3B82F6',
    orders: '#10B981',
    products: '#F59E0B',
    percentage: '#8B5CF6'
  };

  // KPI Cards Component
  const KPICards = () => {
    if (statsLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    const stats = statsData?.getReportStats || {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      averageOrderValue: 0
    };

    const kpiData = [
      {
        title: 'Tổng doanh thu',
        value: formatCurrency(stats.totalRevenue),
        change: '+12%',
        changeType: 'positive',
        color: 'blue'
      },
      {
        title: 'Tổng đơn hàng',
        value: stats.totalOrders.toLocaleString('vi-VN'),
        change: '+8%',
        changeType: 'positive',
        color: 'green'
      },
      {
        title: 'Tổng sản phẩm',
        value: stats.totalProducts.toLocaleString('vi-VN'),
        change: '+15%',
        changeType: 'positive',
        color: 'orange'
      },
      {
        title: 'AOV',
        value: formatCurrency(stats.averageOrderValue),
        change: '+5%',
        changeType: 'positive',
        color: 'purple'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className={`text-sm ${
                  kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change} từ tháng trước
                </p>
              </div>
              <div className={`w-12 h-12 bg-${kpi.color}-500 rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">📊</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Monthly Overview Charts
  const MonthlyCharts = () => {
    if (monthlyLoading) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      );
    }

    const data = monthlyData?.getMonthlyReport || [];

    return (
      <div className="space-y-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Doanh thu theo tháng</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={(value) => {
                  if (value >= 1000000000) {
                    return `${(value / 1000000000).toFixed(1)}T`;
                  } else if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`;
                  } else if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}K`;
                  }
                  return value.toString();
                }}
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                labelFormatter={(label) => `${label} ${selectedYear}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill={chartColors.revenue} 
                name="Doanh thu"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders and Products Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Số đơn hàng theo tháng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  width={60}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="orderCount" 
                  stroke={chartColors.orders} 
                  strokeWidth={3}
                  name="Số đơn hàng"
                  dot={{ fill: chartColors.orders, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: chartColors.orders, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Số sản phẩm bán ra</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  width={60}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="productCount" 
                  fill={chartColors.products} 
                  name="Số sản phẩm"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Detailed Sales Table
  const SalesTable = () => {
    if (salesLoading) {
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      );
    }

    const sales = salesData?.getSalesReport?.nodes || [];
    const totalCount = salesData?.getSalesReport?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm sản phẩm
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm hoặc SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setSearchTerm('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FunnelIcon className="h-4 w-4 inline mr-2" />
                Làm mới
              </button>
              <button
                onClick={() => {
                  // Export functionality
                  alert('Tính năng export đang phát triển');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <DocumentArrowDownIcon className="h-4 w-4 inline mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỷ lệ %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((item, index) => (
                <tr key={item.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.productName}
                      </div>
                      <div className="text-sm text-gray-500">
                        SKU: {item.productSku}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantitySold.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.revenuePercentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => {
                        setSelectedProduct(item);
                        setShowProductModal(true);
                      }}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Xem đơn hàng
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến{' '}
                {Math.min(currentPage * itemsPerPage, totalCount)} trong tổng số {totalCount} sản phẩm
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Báo cáo kinh doanh 📊
        </h1>
        <p className="text-blue-100">
          Phân tích chi tiết doanh thu, đơn hàng và sản phẩm bán ra
        </p>
      </div>

      {/* Update Notification */}
      {showUpdateNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center">
            <span className="mr-2">🔄</span>
            <span>Dữ liệu đã được cập nhật!</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'detailed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chi tiết
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
                             {/* Year Selector và Refresh */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                   <label className="text-sm font-medium text-gray-700">Năm:</label>
                   <select
                     value={selectedYear}
                     onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                     className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   >
                     {[2023, 2024, 2025].map(year => (
                       <option key={year} value={year}>{year}</option>
                     ))}
                   </select>
                 </div>
                 
                 <div className="flex items-center space-x-4">
                   <div className="text-xs text-gray-500">
                     Cập nhật lần cuối: {lastUpdate.toLocaleTimeString('vi-VN')}
                   </div>
                   <button
                     onClick={() => {
                       refetchStats();
                       refetchMonthly();
                       setLastUpdate(new Date());
                     }}
                     disabled={statsLoading || monthlyLoading}
                     className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <ArrowPathIcon className={`h-4 w-4 mr-2 ${(statsLoading || monthlyLoading) ? 'animate-spin' : ''}`} />
                     Làm mới
                   </button>
                 </div>
               </div>

              {/* KPI Cards */}
              <KPICards />

              {/* Charts */}
              <MonthlyCharts />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Date Range Selector */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={dateRange.fromDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, fromDate: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={dateRange.toDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, toDate: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sales Table */}
              <SalesTable />
            </div>
          )}
        </div>
      </div>

      {/* Modal chi tiết đơn hàng sản phẩm */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết đơn hàng - {selectedProduct.productName}
                </h3>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setSelectedProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">SKU:</span> {selectedProduct.productSku}
                  </div>
                  <div>
                    <span className="font-medium">Tổng số lượng:</span> {selectedProduct.quantitySold.toLocaleString('vi-VN')}
                  </div>
                  <div>
                    <span className="font-medium">Tổng doanh thu:</span> {formatCurrency(selectedProduct.revenue)}
                  </div>
                  <div>
                    <span className="font-medium">Tỷ lệ:</span> {selectedProduct.revenuePercentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {productOrdersLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mã đơn
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày đặt
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Khách hàng
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số lượng
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Đơn giá
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thành tiền
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productOrdersData?.getProductOrders?.map((order, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {order.orderNumber}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {order.orderDate}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{order.customerInfo.fullName}</div>
                              <div className="text-gray-500">{order.customerInfo.phone}</div>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {order.quantity}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.unitPrice)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(order.totalPrice)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipping' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status === 'delivered' ? 'Đã giao' :
                               order.status === 'shipping' ? 'Đang giao' :
                               order.status === 'confirmed' ? 'Đã xác nhận' :
                               order.status === 'processing' ? 'Đang xử lý' :
                               'Chờ xác nhận'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {(!productOrdersData?.getProductOrders || productOrdersData.getProductOrders.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      Không có đơn hàng nào cho sản phẩm này trong khoảng thời gian đã chọn.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage; 