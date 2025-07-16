// src/pages/admin/EditProductPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from './products/ProductForm';
import { useProduct, useUpdateProductWithImages } from '../../hooks/useProducts';
import toast from 'react-hot-toast';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading: productLoading, error: productError } = useProduct(id);
  const { updateProductWithImages, loading: updateLoading, error: updateError } = useUpdateProductWithImages();

  const handleSubmit = async (productData, imageFiles) => {
    console.log('🔄 EditProductPage: Starting product update...');
    console.log('📝 Product data:', productData);
    console.log('🖼️ Image files:', imageFiles);

    try {
      const updatedProduct = await updateProductWithImages(id, productData, imageFiles);
      
      console.log('✅ Product updated successfully:', updatedProduct);
      
      // Show success message and navigate
      if (imageFiles && imageFiles.length > 0) {
        toast.success(`Cập nhật sản phẩm và upload ${imageFiles.length} ảnh thành công!`);
      } else {
        toast.success('Cập nhật sản phẩm thành công!');
      }
      
      navigate('/admin/products');
      
    } catch (error) {
      console.error('❌ Update product error:', error);
      
      // Handle specific error cases
      if (error.message.includes('duplicate key error')) {
        toast.error('SKU đã tồn tại, vui lòng chọn SKU khác');
      } else if (error.message.includes('Category not found')) {
        toast.error('Danh mục không tồn tại');
      } else if (error.message.includes('Brand not found')) {
        toast.error('Thương hiệu không tồn tại');
      } else {
        toast.error(`Lỗi cập nhật sản phẩm: ${error.message}`);
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  // Loading state
  if (productLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (productError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
          <p className="mt-1 text-sm text-gray-500">
            Có lỗi xảy ra khi tải thông tin sản phẩm
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Lỗi tải sản phẩm
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {productError.message}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/admin/products')}
              className="btn btn-secondary mr-3"
            >
              Quay lại danh sách
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
          <p className="mt-1 text-sm text-gray-500">
            Không tìm thấy sản phẩm
          </p>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h3>
          <p className="text-gray-500 mb-6">
            Sản phẩm có thể đã bị xóa hoặc không tồn tại
          </p>
          <button
            onClick={() => navigate('/admin/products')}
            className="btn btn-primary"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
        <p className="mt-1 text-sm text-gray-500">
          Cập nhật thông tin cho: <span className="font-medium">{product.name}</span>
        </p>
      </div>

      {/* Update Error display */}
      {updateError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Lỗi cập nhật sản phẩm
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {updateError.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <ProductForm 
        product={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updateLoading}
      />
    </div>
  );
};

export default EditProductPage;