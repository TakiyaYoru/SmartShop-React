// src/pages/admin/CreateProductPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from './products/ProductForm';
import { useCreateProduct } from '../../hooks/useProducts';
import { useUploadProductImages } from '../../hooks/useUpload';
import toast from 'react-hot-toast';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const { createProduct, loading: createLoading, error: createError } = useCreateProduct();
  const { uploadImages, loading: uploadLoading } = useUploadProductImages();

  const handleSubmit = async (productData, imageFiles) => {
    console.log('🚀 CreateProductPage: Starting product creation...');
    console.log('📝 Product data:', productData);
    console.log('🖼️ Image files:', imageFiles);

    try {
      // Step 1: Create product first
      console.log('🔸 Step 1: Creating product...');
      const createdProduct = await createProduct(productData);
      
      if (!createdProduct) {
        throw new Error('Failed to create product - no product returned');
      }

      if (!createdProduct._id) {
        throw new Error('Failed to create product - no product ID returned');
      }

      console.log('✅ Product created successfully:', createdProduct);

      // Step 2: Upload images if any
      if (imageFiles && imageFiles.length > 0) {
        console.log('🔸 Step 2: Uploading images...');
        
        try {
          const uploadResult = await uploadImages(createdProduct._id, imageFiles);
          
          if (uploadResult && uploadResult.success) {
            console.log('✅ Images uploaded successfully');
            toast.success(`Tạo sản phẩm và upload ${imageFiles.length} ảnh thành công!`);
          } else {
            console.warn('⚠️ Image upload failed:', uploadResult?.message);
            toast.warn(`Sản phẩm đã tạo thành công nhưng upload ảnh thất bại: ${uploadResult?.message || 'Unknown error'}`);
          }
        } catch (uploadError) {
          console.error('❌ Image upload error:', uploadError);
          toast.warn(`Sản phẩm đã tạo thành công nhưng upload ảnh thất bại: ${uploadError.message}`);
        }
      } else {
        console.log('ℹ️ No images to upload');
        toast.success('Tạo sản phẩm thành công!');
      }

      // Step 3: Navigate back to products list
      console.log('🔸 Step 3: Navigating to products list...');
      navigate('/admin/products');

    } catch (error) {
      console.error('❌ Create product error:', error);
      
      // Handle specific error cases
      if (error.message.includes('duplicate key error')) {
        toast.error('SKU đã tồn tại, vui lòng chọn SKU khác');
      } else if (error.message.includes('Category not found')) {
        toast.error('Danh mục không tồn tại');
      } else if (error.message.includes('Brand not found')) {
        toast.error('Thương hiệu không tồn tại');
      } else {
        toast.error(`Lỗi tạo sản phẩm: ${error.message}`);
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const isLoading = createLoading || uploadLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tạo sản phẩm mới cho cửa hàng
        </p>
      </div>

      {/* Error display */}
      {createError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Lỗi tạo sản phẩm
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {createError.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <ProductForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={isLoading}
      />
    </div>
  );
};

export default CreateProductPage;