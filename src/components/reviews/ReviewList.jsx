import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import ReviewItem from './ReviewItem';
import ReviewFilter from './ReviewFilter';

const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($productId: ID!, $filter: ReviewFilter) {
    getProductReviews(productId: $productId, filter: $filter) {
      items {
        _id
        rating
        comment
        images
        createdAt
        user {
          _id
          username
          firstName
          lastName
        }
        adminReply
        adminReplyUpdatedAt
      }
      totalCount
    }
  }
`;

const ReviewList = ({ productId, isAuthenticated }) => {
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const filter = {
    rating: selectedRating ? parseInt(selectedRating) : undefined,
    first: itemsPerPage,
    offset: currentPage * itemsPerPage
  };

  const { data, loading, error, refetch } = useQuery(GET_PRODUCT_REVIEWS, {
    variables: { productId, filter },
    fetchPolicy: 'cache-and-network'
  });

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    // Handle write review logic here
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p>Error loading reviews: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const reviews = data?.getProductReviews?.items || [];
  const totalCount = data?.getProductReviews?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Filter */}
      <ReviewFilter
        selectedRating={selectedRating}
        onRatingChange={handleRatingChange}
        totalReviews={totalCount}
      />

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-500">
              {selectedRating 
                ? `No ${selectedRating}-star reviews found.`
                : 'No reviews yet. Be the first to review this product!'
              }
            </p>
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Đăng nhập để viết đánh giá
              </button>
            )}
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <ReviewItem key={review._id} review={review} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {currentPage + 1} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewList; 