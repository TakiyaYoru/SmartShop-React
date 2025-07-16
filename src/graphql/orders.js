// webfrontend/src/graphql/orders.js
import { gql } from '@apollo/client';

// Fragments
export const ORDER_FRAGMENT = gql`
  fragment OrderInfo on Order {
    _id
    orderNumber
    customerInfo {
      fullName
      phone
      address
      city
      notes
    }
    status
    paymentMethod
    paymentStatus
    subtotal
    totalAmount
    orderDate
    confirmedAt
    processedAt
    shippedAt
    deliveredAt
    cancelledAt
    customerNotes
    adminNotes
  }
`;

export const ORDER_ITEM_FRAGMENT = gql`
  fragment OrderItemInfo on OrderItem {
    _id
    productId
    productName
    productSku
    quantity
    unitPrice
    totalPrice
    productSnapshot {
      description
      images
      brand
      category
    }
    product {
      _id
      name
      images
      price
      stock
    }
  }
`;

// Queries
export const GET_MY_ORDERS = gql`
  query GetMyOrders($first: Int, $offset: Int, $orderBy: OrdersOrderBy) {
    getMyOrders(first: $first, offset: $offset, orderBy: $orderBy) {
      nodes {
        ...OrderInfo
        items {
          ...OrderItemInfo
        }
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
  ${ORDER_FRAGMENT}
  ${ORDER_ITEM_FRAGMENT}
`;

export const GET_MY_ORDER = gql`
  query GetMyOrder($orderNumber: String!) {
    getMyOrder(orderNumber: $orderNumber) {
      ...OrderInfo
      items {
        ...OrderItemInfo
      }
      user {
        _id
        username
        email
        firstName
        lastName
      }
    }
  }
  ${ORDER_FRAGMENT}
  ${ORDER_ITEM_FRAGMENT}
`;

// Admin queries
export const GET_ALL_ORDERS = gql`
  query GetAllOrders($first: Int, $offset: Int, $orderBy: OrdersOrderBy, $condition: OrderConditionInput, $search: String) {
    getAllOrders(first: $first, offset: $offset, orderBy: $orderBy, condition: $condition, search: $search) {
      nodes {
        ...OrderInfo
        user {
          _id
          username
          email
          firstName
          lastName
        }
        items {
          ...OrderItemInfo
        }
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
  ${ORDER_FRAGMENT}
  ${ORDER_ITEM_FRAGMENT}
`;

export const GET_ORDER_STATS = gql`
  query GetOrderStats {
    getOrderStats {
      totalOrders
      pendingOrders
      confirmedOrders
      shippingOrders
      deliveredOrders
      cancelledOrders
      totalRevenue
      todayOrders
    }
  }
`;

export const GET_ORDER_ADMIN = gql`
  query GetOrder($orderNumber: String!) {
    getOrder(orderNumber: $orderNumber) {
      ...OrderInfo
      items {
        ...OrderItemInfo
      }
      user {
        _id
        username
        email
        firstName
        lastName
      }
    }
  }
  ${ORDER_FRAGMENT}
  ${ORDER_ITEM_FRAGMENT}
`;

// Mutations
export const CREATE_ORDER = gql`
  mutation CreateOrderFromCart($input: CreateOrderInput!) {
    createOrderFromCart(input: $input) {
      ...OrderInfo
      items {
        ...OrderItemInfo
      }
    }
  }
  ${ORDER_FRAGMENT}
  ${ORDER_ITEM_FRAGMENT}
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderNumber: String!, $status: OrderStatus!, $adminNotes: String) {
    updateOrderStatus(orderNumber: $orderNumber, status: $status, adminNotes: $adminNotes) {
      ...OrderInfo
    }
  }
  ${ORDER_FRAGMENT}
`;

export const UPDATE_PAYMENT_STATUS = gql`
  mutation UpdatePaymentStatus($orderNumber: String!, $paymentStatus: PaymentStatus!) {
    updatePaymentStatus(orderNumber: $orderNumber, paymentStatus: $paymentStatus) {
      ...OrderInfo
    }
  }
  ${ORDER_FRAGMENT}
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderNumber: String!, $reason: String) {
    cancelOrder(orderNumber: $orderNumber, reason: $reason) {
      ...OrderInfo
    }
  }
  ${ORDER_FRAGMENT}
`;

// Order status options for forms
export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xác nhận', color: 'yellow' },
  { value: 'confirmed', label: 'Đã xác nhận', color: 'blue' },
  { value: 'processing', label: 'Đang xử lý', color: 'purple' },
  { value: 'shipping', label: 'Đang giao hàng', color: 'indigo' },
  { value: 'delivered', label: 'Đã giao hàng', color: 'green' },
  { value: 'cancelled', label: 'Đã hủy', color: 'red' }
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ thanh toán', color: 'yellow' },
  { value: 'paid', label: 'Đã thanh toán', color: 'green' },
  { value: 'failed', label: 'Thanh toán thất bại', color: 'red' },
  { value: 'refunded', label: 'Đã hoàn tiền', color: 'gray' }
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' }
];

// Helper functions - ĐÂY LÀ CÁC FUNCTION BỊ THIẾU
export const getOrderStatusInfo = (status) => {
  return ORDER_STATUS_OPTIONS.find(option => option.value === status) || 
         { value: status, label: status, color: 'gray' };
};

export const getPaymentStatusInfo = (paymentStatus) => {
  return PAYMENT_STATUS_OPTIONS.find(option => option.value === paymentStatus) || 
         { value: paymentStatus, label: paymentStatus, color: 'gray' };
};

export const getPaymentMethodLabel = (paymentMethod) => {
  const option = PAYMENT_METHOD_OPTIONS.find(option => option.value === paymentMethod);
  return option ? option.label : paymentMethod;
};

// Format helpers
export const formatOrderDate = (dateString) => {
  if (!dateString) return 'Chưa cập nhật';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

// Order by options for sorting
export const ORDER_BY_OPTIONS = {
  ORDER_DATE_DESC: 'DATE_DESC',
  ORDER_DATE_ASC: 'DATE_ASC',
  STATUS_DESC: 'STATUS_DESC',
  STATUS_ASC: 'STATUS_ASC',
  TOTAL_AMOUNT_DESC: 'TOTAL_DESC',
  TOTAL_AMOUNT_ASC: 'TOTAL_ASC'
};