import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  HeartIcon,
  TrashIcon,
  ShoppingCartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import Layout from '../components/common/Layout';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ProductCard from '../components/products/ProductCard';
import { 
  GET_MY_WISHLIST, 
  REMOVE_FROM_WISHLIST,
  REMOVE_MULTIPLE_FROM_WISHLIST,
  MOVE_WISHLIST_ITEM_UP,
  MOVE_WISHLIST_ITEM_DOWN
} from '../graphql/wishlist';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../lib/utils';
import { getImageUrl, SmartImage } from '../utils/imageHelper';

const WishlistPage = () => {
  const { addToCart } = useCart();
  const location = useLocation();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isRemoving, setIsRemoving] = useState(false);
  const [reorderingItem, setReorderingItem] = useState(null);
  const [reorderStatus, setReorderStatus] = useState(''); // 'moving', 'success', 'error'

  // Query wishlist
  const { data, loading, error, refetch } = useQuery(GET_MY_WISHLIST, {
    variables: { first: 50, offset: 0 },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network', // Luôn fetch từ network khi có thể
    notifyOnNetworkStatusChange: true // Thông báo khi network status thay đổi
  });

  // Mutations
  const [removeFromWishlist] = useMutation(REMOVE_FROM_WISHLIST, {
    onCompleted: () => {
      toast.success('Đã xóa khỏi danh sách yêu thích!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể xóa khỏi danh sách yêu thích');
    }
  });

  const [removeMultipleFromWishlist] = useMutation(REMOVE_MULTIPLE_FROM_WISHLIST, {
    onCompleted: (data) => {
      console.log('Remove multiple completed:', data);
      toast.success('Đã xóa các sản phẩm đã chọn!');
      setSelectedItems(new Set());
      refetch();
    },
    onError: (error) => {
      console.error('Remove multiple error:', error);
      toast.error(error.message || 'Không thể xóa các sản phẩm');
    },
    onSettled: () => {
      setIsRemoving(false);
    }
  });

  const [moveItemUp] = useMutation(MOVE_WISHLIST_ITEM_UP, {
    onCompleted: () => {
      setReorderStatus('success');
      setReorderingItem(null);
      toast.success('Đã di chuyển lên thành công!');
      setTimeout(() => setReorderStatus(''), 2000);
      refetch();
    },
    onError: (error) => {
      setReorderStatus('error');
      setReorderingItem(null);
      toast.error('Không thể di chuyển lên');
      setTimeout(() => setReorderStatus(''), 2000);
    }
  });

  const [moveItemDown] = useMutation(MOVE_WISHLIST_ITEM_DOWN, {
    onCompleted: () => {
      setReorderStatus('success');
      setReorderingItem(null);
      toast.success('Đã di chuyển xuống thành công!');
      setTimeout(() => setReorderStatus(''), 2000);
      refetch();
    },
    onError: (error) => {
      setReorderStatus('error');
      setReorderingItem(null);
      toast.error('Không thể di chuyển xuống');
      setTimeout(() => setReorderStatus(''), 2000);
    }
  });

  const wishlistItems = data?.getMyWishlist?.nodes || [];
  const totalCount = data?.getMyWishlist?.totalCount || 0;
  const isRefreshing = loading && !data; // Chỉ hiển thị loading khi chưa có data

  // Refresh data when component mounts or when returning to this page
  useEffect(() => {
    // Refresh data when component mounts
    refetch();
    
    // Refresh data when window gains focus (user returns to tab)
    const handleFocus = () => {
      console.log('Window focused, refreshing wishlist data...');
      refetch().then(() => {
        toast.success('Đã cập nhật danh sách yêu thích!');
      });
    };

    // Refresh data when user navigates back to this page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing wishlist data...');
        refetch().then(() => {
          toast.success('Đã cập nhật danh sách yêu thích!');
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch, location.pathname]); // Re-run when location changes

  // Handle select/deselect item
  const handleSelectItem = (productId) => {
    console.log('Selecting productId:', productId);
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    console.log('New selected items:', Array.from(newSelected));
    setSelectedItems(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.size === wishlistItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wishlistItems.map(item => item.productId)));
    }
  };

  // Handle remove selected
  const handleRemoveSelected = async () => {
    if (selectedItems.size === 0) {
      toast.error('Vui lòng chọn sản phẩm cần xóa');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedItems.size} sản phẩm khỏi danh sách yêu thích?`)) {
      return;
    }

    setIsRemoving(true);
    try {
      console.log('Removing products:', Array.from(selectedItems));
      const result = await removeMultipleFromWishlist({
        variables: { productIds: Array.from(selectedItems) }
      });
      console.log('Remove result:', result);
    } catch (error) {
      console.error('Remove multiple error:', error);
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setIsRemoving(false);
    }
  };

  // Handle move item up/down
  const handleMoveItem = async (itemId, direction) => {
    setReorderingItem(itemId);
    setReorderStatus('moving');
    
    try {
      if (direction === 'up') {
        await moveItemUp({
          variables: { itemId }
        });
      } else {
        await moveItemDown({
          variables: { itemId }
        });
      }
    } catch (error) {
      console.error('Move item error:', error);
      setReorderStatus('error');
      setReorderingItem(null);
      setTimeout(() => setReorderStatus(''), 2000);
    }
  };

  // Handle add to cart and remove from wishlist
  const handleAddToCart = async (item) => {
    try {
      await addToCart(item.productId, 1);

      // Tự động xóa khỏi wishlist
      await removeFromWishlist({
        variables: { productId: item.productId }
      });

      toast.success('Đã thêm vào giỏ hàng và xóa khỏi danh sách yêu thích!');
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  if (isRefreshing) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-8">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="btn btn-primary"
            >
              Thử lại
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Danh sách yêu thích</h1>
                {loading && data && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Đang cập nhật...</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mt-2">
                {totalCount} sản phẩm trong danh sách yêu thích
              </p>
              
              {/* Reorder Status */}
              {reorderStatus && (
                <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
                  reorderStatus === 'moving' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : reorderStatus === 'success'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {reorderStatus === 'moving' && (
                    <div className="flex items-center">
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Đang di chuyển...
                    </div>
                  )}
                  {reorderStatus === 'success' && '✅ Di chuyển thành công!'}
                  {reorderStatus === 'error' && '❌ Có lỗi xảy ra khi di chuyển'}
                </div>
              )}
            </div>
            
            {wishlistItems.length > 0 && (
              <div className="flex items-center space-x-4">
                {selectedItems.size > 0 && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Đã chọn: {selectedItems.size}/{wishlistItems.length}
                  </span>
                )}
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {selectedItems.size === wishlistItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
                
                {/* Manual Refresh Button */}
                <button
                  onClick={() => {
                    console.log('Manual refresh triggered');
                    refetch().then(() => {
                      toast.success('Đã cập nhật danh sách yêu thích!');
                    });
                  }}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Làm mới dữ liệu"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>
                
                {selectedItems.size > 0 && (
                  <button
                    onClick={handleRemoveSelected}
                    disabled={isRemoving}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isRemoving ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                    <span>{isRemoving ? 'Đang xóa...' : `Xóa (${selectedItems.size})`}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Danh sách yêu thích trống</h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong danh sách yêu thích
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item, index) => {
              // Sử dụng thông tin từ product nếu có, fallback về productSnapshot
              const product = item.product || {
                _id: item.productId,
                name: item.productSnapshot?.name || 'Sản phẩm không tồn tại',
                description: '',
                price: item.productSnapshot?.price || 0,
                originalPrice: item.productSnapshot?.originalPrice || 0,
                sku: item.productSnapshot?.sku || '',
                images: item.productSnapshot?.images || [],
                stock: 0,
                category: { name: item.productSnapshot?.category || '' },
                brand: { name: item.productSnapshot?.brand || '' },
                isActive: true,
                isFeatured: false
              };

              return (
                <div key={item._id} className="relative group">
                  {/* Order Number Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
                      {index + 1}
                    </span>
                  </div>

                  {/* Wishlist Controls Overlay */}
                  <div className="absolute top-2 left-10 z-10 flex items-center space-x-2">
                    {/* Checkbox */}
                    <div className={`p-1 rounded-full transition-colors ${
                      selectedItems.has(item.productId) 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.productId)}
                        onChange={() => handleSelectItem(item.productId)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 bg-white shadow-sm cursor-pointer"
                        title={selectedItems.has(item.productId) ? 'Bỏ chọn' : 'Chọn'}
                      />
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromWishlist({ variables: { productId: item.productId } })}
                      className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                      title="Xóa khỏi danh sách yêu thích"
                    >
                      <XMarkIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Order Controls */}
                  <div className="absolute top-2 right-2 z-10 flex items-center space-x-1">
                    <button
                      onClick={() => handleMoveItem(item._id, 'up')}
                      disabled={index === 0 || reorderingItem === item._id}
                      className={`p-1 bg-white rounded-full shadow-sm transition-colors ${
                        reorderingItem === item._id 
                          ? 'text-blue-500 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-gray-600 disabled:opacity-30'
                      }`}
                      title={index === 0 ? 'Đã ở đầu danh sách' : 'Di chuyển lên'}
                    >
                      {reorderingItem === item._id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <ArrowUpIcon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleMoveItem(item._id, 'down')}
                      disabled={index === wishlistItems.length - 1 || reorderingItem === item._id}
                      className={`p-1 bg-white rounded-full shadow-sm transition-colors ${
                        reorderingItem === item._id 
                          ? 'text-blue-500 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-gray-600 disabled:opacity-30'
                      }`}
                      title={index === wishlistItems.length - 1 ? 'Đã ở cuối danh sách' : 'Di chuyển xuống'}
                    >
                      {reorderingItem === item._id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Product Card */}
                  <ProductCard 
                    product={product}
                    showQuickActions={false}
                    className="w-full"
                  />

                  {/* Add to Cart Button */}
                  <div className="absolute bottom-2 right-2 z-10">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shadow-lg"
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      <span>Thêm vào giỏ</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WishlistPage; 