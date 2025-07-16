import React from 'react';
import { StarIcon } from '@heroicons/react/20/solid';
import { formatDistanceToNow } from 'date-fns';

const ReviewItem = ({ review }) => {
  const { rating, comment, images, createdAt, user, adminReply, adminReplyUpdatedAt } = review;

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Review Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username || 'Anonymous'}
            </p>
            <div className="flex items-center space-x-1 mt-1">
              {renderStars(rating)}
              <span className="text-sm text-gray-500 ml-2">
                {rating} star{rating !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {formatDate(createdAt)}
        </span>
      </div>

      {/* Review Comment */}
      {comment && (
        <div className="text-gray-700">
          <p className="text-sm leading-relaxed">{comment}</p>
        </div>
      )}

      {/* Review Images */}
      {images && images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div key={index} className="aspect-square">
              <img
                src={image}
                alt={`Review image ${index + 1}`}
                className="w-full h-full object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.open(image, '_blank')}
                title="Click to view full size"
              />
            </div>
          ))}
        </div>
      )}

      {/* Admin Reply */}
      {adminReply && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">A</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-blue-900">Admin Response</span>
                {adminReplyUpdatedAt && (
                  <span className="text-xs text-blue-600">
                    {formatDate(adminReplyUpdatedAt)}
                  </span>
                )}
              </div>
              <p className="text-sm text-blue-800">{adminReply}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewItem; 