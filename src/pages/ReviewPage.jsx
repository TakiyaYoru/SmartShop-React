// webfrontend/src/pages/ReviewPage.jsx - Customer Review Page
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  ArrowLeftIcon,
  StarIcon,
  PhotoIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

import Layout from '../components/common/Layout';
import ReviewSuccess from '../components/reviews/ReviewSuccess';
import { SmartImage } from '../utils/imageHelper';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// GraphQL Queries
const GET_ORDER_PRODUCT = gql`
  query GetOrderProduct($orderNumber: String!) {
    getMyOrder(orderNumber: $orderNumber) {
      _id
      orderNumber
      status
      deliveredAt
      items {
        _id
        productId
        productName
        productSku
        quantity
        unitPrice
        totalPrice
        productSnapshot {
          description
          images
          brand
          category
        }
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

const GET_USER_REVIEW = gql`
  query GetUserReview($productId: ID!) {
    getProductReviews(productId: $productId, filter: { first: 100 }) {
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

const UPLOAD_REVIEW_IMAGES = gql`
  mutation UploadReviewImages($files: [File!]!) {
    uploadReviewImages(files: $files) {
      success
      message
      urls
      filenames
    }
  }
`;

const CREATE_REVIEW = gql`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
      _id
      rating
      comment
      images
      createdAt
    }
  }
`;

const ReviewPage = () => {
  const { orderNumber, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // State
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [submittedReview, setSubmittedReview] = useState(null);

  // GraphQL hooks
  const { data: orderData, loading: orderLoading, error: orderError } = useQuery(GET_ORDER_PRODUCT, {
    variables: { orderNumber },
    skip: !orderNumber
  });

  const { data: eligibilityData, loading: eligibilityLoading } = useQuery(CAN_USER_REVIEW, {
    variables: { productId },
    skip: !productId
  });

  const { data: userReviewData, loading: userReviewLoading } = useQuery(GET_USER_REVIEW, {
    variables: { productId },
    skip: !productId || !user
  });

  const [createReview] = useMutation(CREATE_REVIEW);
  const [uploadReviewImages] = useMutation(UPLOAD_REVIEW_IMAGES);

  // Get product from order
  const order = orderData?.getMyOrder;
  const product = order?.items?.find(item => item.productId === productId);
  const canReview = eligibilityData?.canUserReviewProduct?.canReview || false;
  const reviewReason = eligibilityData?.canUserReviewProduct?.reason || '';

  // Check if user already reviewed
  const userReviews = userReviewData?.getProductReviews?.items || [];
  const existingReview = userReviews.find(review => review.user?._id === user?.id);

  // Check if user can review
  useEffect(() => {
    if (!eligibilityLoading && !canReview) {
      toast.error(`Không thể đánh giá: ${reviewReason}`);
      navigate(`/orders/${orderNumber}`);
    }
  }, [canReview, reviewReason, eligibilityLoading, navigate, orderNumber]);

  // Check if order is delivered
  useEffect(() => {
    if (order && order.status !== 'delivered' && !order.deliveredAt) {
      toast.error('Chỉ có thể đánh giá sản phẩm sau khi đã nhận hàng');
      navigate(`/orders/${orderNumber}`);
    }
  }, [order, navigate, orderNumber]);

  // Handle rating change
  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...imageUrls]);
    setImageFiles(prev => [...prev, ...files]);
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!comment.trim()) {
      setError('Vui lòng viết nhận xét về sản phẩm');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let uploadedImageUrls = [];
      
      // Upload images if any
      if (imageFiles.length > 0) {
        setIsUploading(true);
        try {
          const uploadResult = await uploadReviewImages({
            variables: { files: imageFiles }
          });
          
          if (uploadResult.data.uploadReviewImages.success) {
            uploadedImageUrls = uploadResult.data.uploadReviewImages.urls;
            toast.success('Tải ảnh thành công!');
          } else {
            throw new Error(uploadResult.data.uploadReviewImages.message);
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Tải ảnh thất bại. Vui lòng thử lại.');
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Create review
      const input = {
        productId,
        orderId: order._id,
        rating,
        comment: comment.trim(),
        images: uploadedImageUrls
      };

      const result = await createReview({
        variables: { input }
      });

      // Success
      toast.success('Đánh giá đã được gửi thành công! Cảm ơn bạn đã chia sẻ trải nghiệm.');
      
      // Set submitted review to show success page
      setSubmittedReview(result.data.createReview);
      
    } catch (err) {
      setError(err.message);
      toast.error('Gửi đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success page after review submission
  if (submittedReview) {
    return (
      <Layout>
        <ReviewSuccess
          orderNumber={orderNumber}
          productId={productId}
          productName={product.productName}
          review={submittedReview}
        />
      </Layout>
    );
  }

  // Loading state
  if (orderLoading || eligibilityLoading || userReviewLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (orderError) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không thể tải thông tin</h2>
            <p className="text-gray-600 mb-8">{orderError.message}</p>
            <button
              onClick={() => navigate(`/orders/${orderNumber}`)}
              className="btn btn-primary"
            >
              Quay lại đơn hàng
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Product not found in order
  if (!product) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h2>
            <p className="text-gray-600 mb-8">Sản phẩm này không có trong đơn hàng.</p>
            <button
              onClick={() => navigate(`/orders/${orderNumber}`)}
              className="btn btn-primary"
            >
              Quay lại đơn hàng
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // User already reviewed this product
  if (existingReview) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/orders/${orderNumber}`)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Quay lại đơn hàng
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đánh giá của bạn
            </h1>
            <p className="text-gray-600">
              Bạn đã đánh giá sản phẩm này rồi
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Product Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                    {product.productSnapshot?.images?.[0] ? (
                      <SmartImage
                        src={product.productSnapshot.images[0]}
                        alt={product.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <PhotoIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {product.productName}
                  </h2>
                  <p className="text-gray-600 mb-2">
                    SKU: {product.productSku}
                  </p>
                  <p className="text-gray-600 mb-2">
                    Số lượng: {product.quantity}
                  </p>
                  <p className="text-lg font-semibold text-blue-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.unitPrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* User's Review */}
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900">
                        Đánh giá của bạn
                      </h3>
                      <p className="text-sm text-blue-600">
                        {new Date(existingReview.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <StarSolidIcon
                        key={index}
                        className={`h-5 w-5 ${
                          index < existingReview.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-blue-900">
                      {existingReview.rating} sao
                    </span>
                  </div>
                </div>

                {/* Review Comment */}
                {existingReview.comment && (
                  <div className="mb-4">
                    <p className="text-blue-800 leading-relaxed">
                      {existingReview.comment}
                    </p>
                  </div>
                )}

                {/* Review Images */}
                {existingReview.images && existingReview.images.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Ảnh đánh giá:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {existingReview.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(image, '_blank')}
                            title="Click để xem ảnh gốc"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Reply */}
                {existingReview.adminReply && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <h4 className="text-sm font-medium text-green-900">
                        Phản hồi từ Admin
                      </h4>
                      {existingReview.adminReplyUpdatedAt && (
                        <span className="text-xs text-green-600">
                          {new Date(existingReview.adminReplyUpdatedAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <p className="text-green-800 text-sm leading-relaxed">
                      {existingReview.adminReply}
                    </p>
                  </div>
                )}

                {/* Info Message */}
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Mỗi sản phẩm chỉ có thể đánh giá một lần. 
                    Cảm ơn bạn đã chia sẻ trải nghiệm!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/orders/${orderNumber}`)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại đơn hàng
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đánh giá sản phẩm
          </h1>
          <p className="text-gray-600">
            Chia sẻ trải nghiệm của bạn về sản phẩm này
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Product Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                  {product.productSnapshot?.images?.[0] ? (
                    <SmartImage
                      src={product.productSnapshot.images[0]}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <PhotoIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.productName}
                </h2>
                <p className="text-gray-600 mb-2">
                  SKU: {product.productSku}
                </p>
                <p className="text-gray-600 mb-2">
                  Số lượng: {product.quantity}
                </p>
                <p className="text-lg font-semibold text-blue-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(product.unitPrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Đánh giá của bạn *
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`p-2 rounded-md transition-colors ${
                      star <= rating
                        ? 'text-yellow-400 hover:text-yellow-500'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    {star <= rating ? (
                      <StarSolidIcon className="h-8 w-8" />
                    ) : (
                      <StarIcon className="h-8 w-8" />
                    )}
                  </button>
                ))}
                <span className="ml-4 text-lg font-medium text-gray-900">
                  {rating > 0 ? `${rating} sao` : 'Chọn số sao'}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét của bạn *
              </label>
              <textarea
                id="comment"
                rows={6}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... (Tối thiểu 10 ký tự)"
                required
                minLength={10}
              />
              <p className="mt-1 text-sm text-gray-500">
                {comment.length}/500 ký tự
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thêm ảnh (tùy chọn)
              </label>
              <div className="space-y-4">
                {/* Upload Button */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click để tải ảnh</span> hoặc kéo thả
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP (Tối đa 5 ảnh)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={images.length >= 5}
                    />
                  </label>
                </div>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/orders/${orderNumber}`)}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || isUploading || rating === 0 || !comment.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Gửi đánh giá</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ReviewPage; 