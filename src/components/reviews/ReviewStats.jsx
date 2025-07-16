import React from 'react';
import { StarIcon } from '@heroicons/react/20/solid';

const ReviewStats = ({ stats }) => {
  const { totalReviews, averageRating, ratingDistribution } = stats;

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

  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Customer Reviews
      </h3>

      {/* Overall Rating */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center mt-1">
            {renderStars(Math.round(averageRating))}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {[
            { rating: 5, field: 'five' },
            { rating: 4, field: 'four' },
            { rating: 3, field: 'three' },
            { rating: 2, field: 'two' },
            { rating: 1, field: 'one' }
          ].map(({ rating, field }) => {
            const count = ratingDistribution?.[field] || 0;
            const percentage = getPercentage(count);
            
            return (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 w-4">
                  {rating}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600">
        {totalReviews > 0 ? (
          <p>
            Based on {totalReviews} customer review{totalReviews !== 1 ? 's' : ''}, 
            this product has an average rating of {averageRating.toFixed(1)} out of 5 stars.
          </p>
        ) : (
          <p>No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  );
};

export default ReviewStats; 