import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const CAN_USER_REVIEW = gql`
  query CanUserReviewProduct($productId: ID!) {
    canUserReviewProduct(productId: $productId) {
      canReview
      reason
    }
  }
`;

const ReviewStatus = ({ productId, user }) => {
  const { data: eligibilityData, loading } = useQuery(CAN_USER_REVIEW, {
    variables: { productId },
    skip: !user
  });

  if (!user || loading) return null;

  const canReview = eligibilityData?.canUserReviewProduct?.canReview || false;
  const reviewReason = eligibilityData?.canUserReviewProduct?.reason || '';

  if (canReview) return null; // Don't show status if user can still review

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
        <div>
          <h4 className="text-sm font-medium text-green-800">
            Review Submitted
          </h4>
          <p className="text-sm text-green-600 mt-1">
            You have already reviewed this product. Thank you for your feedback!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewStatus; 