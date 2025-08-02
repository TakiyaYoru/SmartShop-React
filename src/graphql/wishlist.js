// src/graphql/wishlist.js
import { gql } from '@apollo/client';

// Fragment cho WishlistItem
export const WISHLIST_ITEM_FRAGMENT = gql`
  fragment WishlistItemData on WishlistItem {
    _id
    userId
    productId
    displayOrder
    addedAt
    productSnapshot {
      name
      price
      originalPrice
      images
      sku
      brand
      category
    }
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
      isFeatured
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

// Query kiểm tra sản phẩm có trong wishlist không
export const IS_PRODUCT_IN_WISHLIST = gql`
  query IsProductInWishlist($productId: ID!) {
    isProductInWishlist(productId: $productId)
  }
`;

// Query lấy danh sách wishlist
export const GET_MY_WISHLIST = gql`
  query GetMyWishlist($first: Int = 20, $offset: Int = 0) {
    getMyWishlist(first: $first, offset: $offset) {
      nodes {
        ...WishlistItemData
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
  ${WISHLIST_ITEM_FRAGMENT}
`;

// Query lấy số lượng items trong wishlist
export const GET_WISHLIST_ITEM_COUNT = gql`
  query GetWishlistItemCount {
    getWishlistItemCount
  }
`;

// Mutation thêm vào wishlist
export const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($productId: ID!) {
    addToWishlist(productId: $productId) {
      ...WishlistItemData
    }
  }
  ${WISHLIST_ITEM_FRAGMENT}
`;

// Mutation xóa khỏi wishlist
export const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($productId: ID!) {
    removeFromWishlist(productId: $productId)
  }
`;

// Mutation thay đổi thứ tự
export const REORDER_WISHLIST = gql`
  mutation ReorderWishlist($input: ReorderWishlistInput!) {
    reorderWishlist(input: $input) {
      ...WishlistItemData
    }
  }
  ${WISHLIST_ITEM_FRAGMENT}
`;

// Mutation di chuyển item lên
export const MOVE_WISHLIST_ITEM_UP = gql`
  mutation MoveWishlistItemUp($itemId: ID!) {
    moveWishlistItemUp(itemId: $itemId) {
      ...WishlistItemData
    }
  }
  ${WISHLIST_ITEM_FRAGMENT}
`;

// Mutation di chuyển item xuống
export const MOVE_WISHLIST_ITEM_DOWN = gql`
  mutation MoveWishlistItemDown($itemId: ID!) {
    moveWishlistItemDown(itemId: $itemId) {
      ...WishlistItemData
    }
  }
  ${WISHLIST_ITEM_FRAGMENT}
`;

// Mutation xóa nhiều sản phẩm
export const REMOVE_MULTIPLE_FROM_WISHLIST = gql`
  mutation RemoveMultipleFromWishlist($productIds: [ID!]!) {
    removeMultipleFromWishlist(productIds: $productIds)
  }
`; 