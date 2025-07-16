import React from 'react';
import { useQuery, gql } from '@apollo/client';
import ReviewList from './ReviewList';
import ReviewStats from './ReviewStats';
// import ReviewStatus from './ReviewStatus';
// import UserReview from './UserReview';
// import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const GET_PRODUCT_REVIEW_STATS = gql`
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

const CAN_USER_REVIEW = gql`
  query CanUserReviewProduct($productId: ID!) {
    canUserReviewProduct(productId: $productId) {
      canReview
      reason
    }
  }
`;

const ProductReviews = ({ productId, orderId }) => {
  const { user, isAuthenticated } = useAuth();

  // Get review stats
  const { data: statsData, loading: statsLoading } = useQuery(
    GET_PRODUCT_REVIEW_STATS,
    { variables: { productId } }
  );

  // Check if user can review (only if user is logged in)
  const { data: eligibilityData, loading: eligibilityLoading } = useQuery(
    CAN_USER_REVIEW,
    { 
      variables: { productId },
      skip: !isAuthenticated // Skip if user is not logged in
    }
  );

  const stats = statsData?.getProductReviewStats || {
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { one: 0, two: 0, three: 0, four: 0, five: 0 }
  };

  const canReview = isAuthenticated && (eligibilityData?.canUserReviewProduct?.canReview || false);
  // const reviewReason = eligibilityData?.canUserReviewProduct?.reason || '';

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {!statsLoading && (
        <ReviewStats stats={stats} />
      )}

      {/* Reviews List */}
      <ReviewList 
        productId={productId} 
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default ProductReviews; 