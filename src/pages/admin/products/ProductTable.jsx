// webfrontend/src/pages/admin/products/ProductTable.jsx - Updated với Firebase Support
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ArrowsUpDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatPrice, formatDate } from '../../../lib/utils';
import { getImageUrl, SmartImage } from '../../../utils/imageHelper'; // ✅ UPDATED IMPORT
import { useDeleteProduct, useUpdateProductImages, useSetMainProductImage, useDeleteProductImage } from '../../../hooks/useProducts';

const ProductTable = ({ 
  products = [], 
  loading = false, 
  viewMode = 'table'
}) => {
  const navigate = useNavigate();
  const { deleteProduct, loading: deleteLoading } = useDeleteProduct();
  const { updateProductImages, loading: updateImagesLoading } = useUpdateProductImages();
  const { setMainProductImage, loading: setMainLoading } = useSetMainProductImage();
  const { deleteProductImage, loading: deleteImageLoading } = useDeleteProductImage();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleEdit = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  const handleView = (productId) => {
    // Sẽ implement sau
    console.log('View product:', productId);
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`)) {
      await deleteProduct(productId);
    }
  };

  const handleImageClick = (product) => {
    setSelectedProduct(product);
    setShowImageModal(true);
  };

  const handleSetMainImage = async (productId, imageIndex) => {
    try {
      await setMainProductImage({
        variables: {
          id: productId,
          imageIndex
        }
      });
    } catch (error) {
      console.error('Error setting main image:', error);
      alert('Có lỗi xảy ra khi đặt ảnh chính');
    }
  };

  const handleDeleteImage = async (productId, imageIndex) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      try {
        await deleteProductImage({
          variables: {
            id: productId,
            imageIndex
          }
        });
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Có lỗi xảy ra khi xóa ảnh');
      }
    }
  };

  // ✅ UPDATED: Image Modal Component với Firebase support
  const ImageModal = () => {
    if (!selectedProduct || !showImageModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowImageModal(false)}>
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Quản lý ảnh: {selectedProduct.name}
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                selectedProduct.images.map((image, index) => (
                  <div key={index} className="relative group">
                    {/* ✅ UPDATED: Sử dụng SmartImage với Firebase support */}
                    <SmartImage
                      src={image}
                      alt={`${selectedProduct.name} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      fallback="/placeholder-product.jpg"
                    />
                    
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                      {index !== 0 && (
                        <button
                          onClick={() => handleSetMainImage(selectedProduct._id, index)}
                          disabled={setMainLoading}
                          className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 disabled:opacity-50"
                          title="Đặt làm ảnh chính"
                        >
                          <StarIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteImage(selectedProduct._id, index)}
                        disabled={deleteImageLoading}
                        className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                        title="Xóa ảnh"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Main image indicator */}
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-blue-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                          Ảnh chính
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Chưa có ảnh nào</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6 -mx-5 -mb-5 rounded-b-md">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowImageModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <PhotoIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có sản phẩm nào
        </h3>
        <p className="text-gray-500 mb-6">
          Bắt đầu bằng cách thêm sản phẩm đầu tiên của bạn
        </p>
        <button
          onClick={() => navigate('/admin/products/create')}
          className="btn btn-primary"
        >
          Thêm sản phẩm đầu tiên
        </button>
      </div>
    );
  }

  // ✅ UPDATED: Product Image Component với Firebase support
  const productImage = (product, size = 'small') => (
    <div 
      className={`relative ${size === 'small' ? 'h-12 w-12' : 'h-48'} cursor-pointer group`}
      onClick={() => handleImageClick(product)}
    >
      {product.images && product.images.length > 0 ? (
        <SmartImage
          src={product.images[0]}
          alt={product.name}
          className={`${
            size === 'small' 
              ? 'h-12 w-12 rounded-lg object-cover border border-gray-200' 
              : 'w-full h-full object-cover'
          }`}
          fallback="/placeholder-product.jpg"
        />
      ) : (
        <div className={`${
          size === 'small'
            ? 'h-12 w-12 rounded-lg'
            : 'w-full h-full'
          } bg-gray-100 flex items-center justify-center`}
        >
          <PhotoIcon className={`${size === 'small' ? 'h-6 w-6' : 'h-12 w-12'} text-gray-400`} />
        </div>
      )}
      
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all">
          <button className="px-2 py-1 bg-white bg-opacity-90 rounded text-xs font-medium">
            Quản lý ảnh
          </button>
        </div>
      </div>
    </div>
  );

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              {productImage(product, 'large')}

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {product.category?.name} • {product.brand?.name}
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-lg font-bold text-red-600">
                    {formatPrice(product.price)}
                  </p>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <p className="text-sm text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">
                    SKU: {product.sku}
                  </span>
                  <span className="text-sm text-gray-600">
                    Kho: {product.stock}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {product.isFeatured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <StarIcon className="h-3 w-3 mr-1" />
                        Nổi bật
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Đang bán' : 'Tạm dừng'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(product._id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      disabled={deleteLoading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Xóa"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {showImageModal && <ImageModal />}
      </div>
    );
  }

  // Table View
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sản phẩm
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giá
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Danh mục
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kho
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày tạo
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-gray-50">
              {/* Product Info */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {/* ✅ UPDATED: Product image với Firebase support */}
                  {productImage(product)}
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      SKU: {product.sku}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.brand?.name}
                    </div>
                  </div>
                </div>
              </td>

              {/* Price */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-sm text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
              </td>

              {/* Category */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.category?.name || 'Chưa phân loại'}
              </td>

              {/* Stock */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.stock > 10 
                    ? 'bg-green-100 text-green-800'
                    : product.stock > 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock}
                </span>
              </td>

              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col space-y-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? 'Đang bán' : 'Tạm dừng'}
                  </span>
                  {product.isFeatured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <StarIcon className="h-3 w-3 mr-1" />
                      Nổi bật
                    </span>
                  )}
                </div>
              </td>

              {/* Created Date */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(product.createdAt)}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleView(product._id)}
                    className="text-gray-600 hover:text-gray-900"
                    title="Xem chi tiết"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(product._id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Chỉnh sửa"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id, product.name)}
                    disabled={deleteLoading}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    title="Xóa"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showImageModal && <ImageModal />}
    </div>
  );
};

export default ProductTable;