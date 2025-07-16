import { gql } from '@apollo/client';

// Query để lấy reviews của sản phẩm
export const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($productId: ID!, $filter: ReviewFilter) {
    getProductReviews(productId: $productId, filter: $filter) {
      items {
        _id
        rating
        comment
        images
        createdAt
        adminReply
        adminReplyUpdatedAt
        user {
          _id
          username
          firstName
          lastName
        }
      }
      totalCount
    }
  }
`;

// Query để lấy review của user cho sản phẩm cụ thể
export const GET_USER_REVIEW = gql`
  query GetUserReview($productId: ID!) {
    getProductReviews(productId: $productId, filter: { first: 100 }) {
      items {
        _id
        rating
        comment
        images
        createdAt
        adminReply
        adminReplyUpdatedAt
        user {
          _id
          username
          firstName
          lastName
        }
      }
    }
  }
`;

// Query để lấy thống kê review của sản phẩm
export const GET_PRODUCT_REVIEW_STATS = gql`
  query GetProductReviewStats($productId: ID!) {
    getProductReviewStats(productId: $productId) {
      totalReviews
      averageRating
      ratingDistribution {
        one
        two
        three
        four
        five
      }
    }
  }
`;

// Query để lấy rating trung bình của sản phẩm
export const GET_PRODUCT_AVERAGE_RATING = gql`
  query GetProductAverageRating($productId: ID!) {
    getProductAverageRating(productId: $productId)
  }
`;

// Query để kiểm tra user có thể review sản phẩm không
export const CAN_USER_REVIEW_PRODUCT = gql`
  query CanUserReviewProduct($productId: ID!) {
    canUserReviewProduct(productId: $productId) {
      canReview
      reason
    }
  }
`;

// Mutation để tạo review
export const CREATE_REVIEW = gql`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
      _id
      productId
      orderId
      rating
      comment
      images
      createdAt
      adminReply
      adminReplyUpdatedAt
      isVerified
      user {
        _id
        username
        firstName
        lastName
      }
    }
  }
`;

// Mutation để admin reply review
export const ADMIN_REPLY_TO_REVIEW = gql`
  mutation AdminReplyToReview($reviewId: ID!, $reply: String!) {
    adminReplyToReview(reviewId: $reviewId, reply: $reply) {
      _id
      adminReply
      adminReplyUpdatedAt
    }
  }
`;

// Mutation để xóa admin reply
export const DELETE_ADMIN_REPLY = gql`
  mutation DeleteAdminReply($reviewId: ID!) {
    deleteAdminReply(reviewId: $reviewId) {
      _id
      adminReply
      adminReplyUpdatedAt
    }
  }
`;

// Query để admin lấy tất cả reviews
export const GET_ALL_REVIEWS_FOR_ADMIN = gql`
  query GetAllReviewsForAdmin($filter: ReviewFilter) {
    getAllReviewsForAdmin(filter: $filter) {
      items {
        _id
        productId
        orderId
        rating
        comment
        images
        createdAt
        adminReply
        adminReplyUpdatedAt
        isVerified
        user {
          _id
          username
          firstName
          lastName
        }
        product {
          _id
          name
        }
        order {
          _id
          orderNumber
        }
      }
      totalCount
    }
  }
`;

// Query để admin lấy reviews chưa có reply
export const GET_PENDING_ADMIN_REVIEWS = gql`
  query GetPendingAdminReviews($filter: ReviewFilter) {
    getPendingAdminReviews(filter: $filter) {
      items {
        _id
        productId
        orderId
        rating
        comment
        images
        createdAt
        adminReply
        adminReplyUpdatedAt
        isVerified
        user {
          _id
          username
          firstName
          lastName
        }
        product {
          _id
          name
        }
        order {
          _id
          orderNumber
        }
      }
      totalCount
    }
  }
`;

// Query để lấy thống kê tổng quan cho admin dashboard
export const GET_ADMIN_REVIEW_STATS = gql`
  query GetAdminReviewStats {
    getAllReviewsForAdmin(filter: { first: 1000 }) {
      items {
        _id
        rating
        adminReply
        createdAt
      }
      totalCount
    }
    getPendingAdminReviews(filter: { first: 1000 }) {
      totalCount
    }
  }
`; 