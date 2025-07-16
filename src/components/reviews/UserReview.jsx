import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { StarIcon } from '@heroicons/react/20/solid';
import { formatDistanceToNow } from 'date-fns';

const GET_USER_REVIEW = gql`
  query GetUserReview($productId: ID!) {
    getProductReviews(productId: $productId, filter: { first: 1 }) {
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

const UserReview = ({ productId, user }) => {
  const { data, loading } = useQuery(GET_USER_REVIEW, {
    variables: { productId },
    skip: !user
  });

  if (!user || loading) return null;

  const reviews = data?.getProductReviews?.items || [];
  const userReview = reviews.find(review => review.user?._id === user.id);

  if (!userReview) return null;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-sm font-medium text-blue-900">
              Your Review
            </h4>
            <div className="flex items-center space-x-1">
              {renderStars(userReview.rating)}
              <span className="text-sm text-blue-600 ml-1">
                {userReview.rating} star{userReview.rating !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {userReview.comment && (
            <p className="text-sm text-blue-800 mb-2">
              {userReview.comment}
            </p>
          )}

          {userReview.images && userReview.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-2">
              {userReview.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(image, '_blank')}
                  title="Click to view full size"
                />
              ))}
            </div>
          )}

          <p className="text-xs text-blue-600">
            Submitted {formatDate(userReview.createdAt)}
          </p>

          {userReview.adminReply && (
            <div className="mt-3 p-2 bg-white rounded border border-blue-200">
              <p className="text-xs font-medium text-blue-900 mb-1">Admin Response:</p>
              <p className="text-xs text-blue-800">{userReview.adminReply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReview; 