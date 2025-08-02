// src/graphql/reports.js
import { gql } from '@apollo/client';

// Query lấy báo cáo theo tháng
export const GET_MONTHLY_REPORT = gql`
  query GetMonthlyReport($year: Int!) {
    getMonthlyReport(year: $year) {
      month
      year
      revenue
      orderCount
      productCount
    }
  }
`;

// Query lấy báo cáo chi tiết bán hàng
export const GET_SALES_REPORT = gql`
  query GetSalesReport(
    $dateRange: DateRangeInput!
    $first: Int
    $offset: Int
    $search: String
  ) {
    getSalesReport(
      dateRange: $dateRange
      first: $first
      offset: $offset
      search: $search
    ) {
      nodes {
        productId
        productName
        productSku
        category
        brand
        quantitySold
        revenue
        revenuePercentage
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`;

// Query lấy thống kê báo cáo
export const GET_REPORT_STATS = gql`
  query GetReportStats($dateRange: DateRangeInput!) {
    getReportStats(dateRange: $dateRange) {
      totalRevenue
      totalOrders
      totalProducts
      averageOrderValue
    }
  }
`;

// Query lấy chi tiết đơn hàng của sản phẩm
export const GET_PRODUCT_ORDERS = gql`
  query GetProductOrders($productId: ID!, $dateRange: DateRangeInput!) {
    getProductOrders(productId: $productId, dateRange: $dateRange) {
      orderNumber
      orderDate
      status
      customerInfo {
        fullName
        phone
      }
      quantity
      unitPrice
      totalPrice
    }
  }
`; 