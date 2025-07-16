import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarHalf } from '@heroicons/react/24/solid';

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

function renderStars(averageRating, size = 'md') {
  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  const starSize = starSizes[size] || starSizes.md;

  const stars = [];
  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating - fullStars >= 0.25 && averageRating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<StarSolid key={i} className={`${starSize} text-yellow-400`} />);
  }
  if (hasHalfStar) {
    stars.push(
      <svg key="half" className={`${starSize} text-yellow-400`} viewBox="0 0 20 20" fill="currentColor">
        <defs>
          <linearGradient id="half-gradient">
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="50%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path fill="url(#half-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
      </svg>
    );
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<StarOutline key={fullStars + i + 1} className={`${starSize} text-gray-300`} />);
  }
  return stars;
}

const ProductRating = ({ productId, size = 'md' }) => {
  const { data, loading, error } = useQuery(GET_PRODUCT_REVIEW_STATS, {
    variables: { productId },
    fetchPolicy: 'cache-and-network'
  });

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <div key={index} className={`${size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} bg-gray-200 rounded animate-pulse`} />
          ))}
        </div>
        <div className="ml-2 w-24 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <StarOutline
              key={index}
              className={`${size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} text-gray-300`}
            />
          ))}
        </div>
        <span className={`ml-2 ${size === 'sm' ? 'text-xs' : 'text-sm'} text-gray-500`}>(0.0 • 0 đánh giá)</span>
      </div>
    );
  }

  const stats = data?.getProductReviewStats || {
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { one: 0, two: 0, three: 0, four: 0, five: 0 }
  };

  const { totalReviews, averageRating } = stats;

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  const textSize = textSizes[size] || textSizes.md;

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {renderStars(averageRating, size)}
      </div>
      <span className={`ml-2 ${textSize} font-semibold text-gray-900`}>
        {averageRating.toFixed(1)}
      </span>
      <span className={`ml-1 ${textSize} text-gray-500`}>/5</span>
      <span className={`ml-2 ${textSize} text-gray-500`}>({totalReviews} đánh giá)</span>
    </div>
  );
};

export default ProductRating; 