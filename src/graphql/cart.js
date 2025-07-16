// webfrontend/src/graphql/cart.js
import { gql } from '@apollo/client';

// Fragment cho CartItem data
export const CART_ITEM_FRAGMENT = gql`
  fragment CartItemData on CartItem {
    _id
    userId
    quantity
    unitPrice
    productName
    totalPrice
    addedAt
    product {
      _id
      name
      description
      price
      originalPrice
      sku
      images
      stock
      isActive
      category {
        _id
        name
      }
      brand {
        _id
        name
      }
    }
  }
`;

// Fragment cho CartSummary
export const CART_SUMMARY_FRAGMENT = gql`
  fragment CartSummaryData on CartSummary {
    totalItems
    subtotal
    items {
      ...CartItemData
    }
  }
  ${CART_ITEM_FRAGMENT}
`;

// Query để lấy giỏ hàng
export const GET_CART = gql`
  query GetCart {
    getCart {
      ...CartSummaryData
    }
  }
  ${CART_SUMMARY_FRAGMENT}
`;

// Query để lấy số lượng items trong cart (cho badge)
export const GET_CART_ITEM_COUNT = gql`
  query GetCartItemCount {
    getCartItemCount
  }
`;

// Mutation thêm vào giỏ hàng
export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      ...CartItemData
    }
  }
  ${CART_ITEM_FRAGMENT}
`;

// Mutation cập nhật số lượng
export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($input: UpdateCartInput!) {
    updateCartItem(input: $input) {
      ...CartItemData
    }
  }
  ${CART_ITEM_FRAGMENT}
`;

// Mutation xóa khỏi giỏ hàng
export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId)
  }
`;

// Mutation xóa toàn bộ giỏ hàng
export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart
  }
`;