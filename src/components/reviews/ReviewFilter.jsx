import React from 'react';
import { StarIcon } from '@heroicons/react/20/solid';

const ReviewFilter = ({ selectedRating, onRatingChange, totalReviews }) => {
  const ratings = [
    { value: 5, label: '5 stars', count: 0 },
    { value: 4, label: '4 stars', count: 0 },
    { value: 3, label: '3 stars', count: 0 },
    { value: 2, label: '2 stars', count: 0 },
    { value: 1, label: '1 star', count: 0 },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-3 w-3 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        Filter by Rating
      </h4>

      <div className="space-y-2">
        {/* All Reviews Option */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="rating-filter"
            value=""
            checked={selectedRating === ''}
            onChange={(e) => onRatingChange(e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-sm text-gray-700">All Reviews ({totalReviews})</span>
        </label>

        {/* Rating Options */}
        {ratings.map((rating) => (
          <label key={rating.value} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="rating-filter"
              value={rating.value.toString()}
              checked={selectedRating === rating.value.toString()}
              onChange={(e) => onRatingChange(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(rating.value)}
              </div>
              <span className="text-sm text-gray-700">
                {rating.label} ({rating.count})
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* Clear Filter Button */}
      {selectedRating !== '' && (
        <button
          onClick={() => onRatingChange('')}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Clear filter
        </button>
      )}
    </div>
  );
};

export default ReviewFilter; 