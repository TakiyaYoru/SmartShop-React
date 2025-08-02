import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { IS_PRODUCT_IN_WISHLIST } from '../../graphql/wishlist';

const WishlistButton = ({ productId, size = "md", className = "" }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const [isToggling, setIsToggling] = useState(false);
  const [localWishlistState, setLocalWishlistState] = useState(null);
  const [showRipple, setShowRipple] = useState(false);

  // Query để kiểm tra trạng thái wishlist
  const { data: wishlistData, loading: wishlistLoading, refetch } = useQuery(
    IS_PRODUCT_IN_WISHLIST,
    {
      variables: { productId },
      skip: !isAuthenticated,
      errorPolicy: 'all',
      onCompleted: (data) => {
        // Reset local state khi có dữ liệu mới từ server
        if (!isToggling) {
          setLocalWishlistState(null);
        }
      }
    }
  );

  const isInWishlist = localWishlistState !== null ? localWishlistState : (wishlistData?.isProductInWishlist || false);
  const isLoading = wishlistLoading || isToggling;

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (isLoading) return;

    // Lưu trạng thái hiện tại để có thể revert nếu cần
    const currentState = isInWishlist;
    
    setIsToggling(true);
    // Optimistic update: cập nhật state ngay lập tức để có hiệu ứng trực quan
    setLocalWishlistState(!currentState);
    
    // Hiệu ứng ripple khi thêm vào wishlist
    if (!currentState) {
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 600);
    }

    try {
      if (currentState) {
        // Đang trong wishlist -> remove
        await removeFromWishlist({
          variables: { productId }
        });
        toast.success('Đã xóa khỏi danh sách yêu thích!');
      } else {
        // Không trong wishlist -> add
        await addToWishlist({
          variables: { productId }
        });
        toast.success('Đã thêm vào danh sách yêu thích!');
      }
      
      // Reset local state để sử dụng dữ liệu từ server
      setTimeout(() => setLocalWishlistState(null), 100);
      refetch();
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      // Revert optimistic update nếu có lỗi
      setLocalWishlistState(currentState);
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsToggling(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-xl border-2 transition-all duration-300 ease-in-out
        ${isInWishlist 
          ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-600 shadow-md' 
          : 'border-gray-300 bg-white text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${className}
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
        relative overflow-hidden
      `}
      title={isInWishlist ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
    >
      {isLoading ? (
        <div className={`${iconSizeClasses[size]} animate-spin rounded-full border-2 border-current border-t-transparent`} />
      ) : isInWishlist ? (
        <HeartSolidIcon className={`${iconSizeClasses[size]} transition-all duration-300 ease-in-out transform scale-110`} />
      ) : (
        <HeartIcon className={`${iconSizeClasses[size]} transition-all duration-300 ease-in-out`} />
      )}
      
      {/* Ripple effect */}
      {showRipple && (
        <div className="absolute inset-0 bg-red-200 rounded-xl opacity-0 animate-ping" />
      )}
    </button>
  );
};

export default WishlistButton; 