// src/hooks/useUpload.js
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';

import { 
  UPLOAD_FILE,
  UPLOAD_PRODUCT_IMAGE, 
  UPLOAD_PRODUCT_IMAGES, 
  REMOVE_PRODUCT_IMAGE 
} from '../graphql/upload';

// Hook for basic file upload
export const useUpload = () => {
  const [uploadMutation, { loading, error }] = useMutation(UPLOAD_FILE, {
    onCompleted: (data) => {
      if (data.upload) {
        toast.success('Upload file thành công!');
      }
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Lỗi upload file');
    }
  });

  const upload = async (file) => {
    try {
      const result = await uploadMutation({
        variables: { file }
      });
      return result.data.upload; // Returns filename
    } catch (err) {
      throw err;
    }
  };

  return { upload, loading, error };
};

// Hook for uploading single product image
export const useUploadProductImage = () => {
  const [uploadMutation, { loading, error }] = useMutation(UPLOAD_PRODUCT_IMAGE, {
    onCompleted: (data) => {
      if (data.uploadProductImage.success) {
        toast.success('Upload ảnh thành công!');
      } else {
        toast.error(data.uploadProductImage.message);
      }
    },
    onError: (error) => {
      console.error('Upload image error:', error);
      toast.error('Lỗi upload ảnh');
    }
  });

  const uploadImage = async (productId, file) => {
    try {
      const result = await uploadMutation({
        variables: { productId, file }
      });
      return result.data.uploadProductImage;
    } catch (err) {
      throw err;
    }
  };

  return { uploadImage, loading, error };
};

// Hook for uploading multiple product images
export const useUploadProductImages = () => {
  const [uploadMutation, { loading, error }] = useMutation(UPLOAD_PRODUCT_IMAGES, {
    onCompleted: (data) => {
      if (data.uploadProductImages.success) {
        toast.success(`Upload ${data.uploadProductImages.filename.split(', ').length} ảnh thành công!`);
      } else {
        toast.error(data.uploadProductImages.message);
      }
    },
    onError: (error) => {
      console.error('Upload images error:', error);
      toast.error('Lỗi upload ảnh');
    }
  });

  const uploadImages = async (productId, files) => {
    try {
      console.log('🖼️ Uploading images:', { productId, filesCount: files.length });
      
      const result = await uploadMutation({
        variables: { productId, files }
      });
      
      console.log('📦 Upload result:', result.data);
      return result.data.uploadProductImages;
    } catch (err) {
      console.error('❌ Upload images error:', err);
      throw err;
    }
  };

  return { uploadImages, loading, error };
};

// Hook for removing product image
export const useRemoveProductImage = () => {
  const [removeMutation, { loading, error }] = useMutation(REMOVE_PRODUCT_IMAGE, {
    onCompleted: () => {
      toast.success('Xóa ảnh thành công!');
    },
    onError: (error) => {
      console.error('Remove image error:', error);
      toast.error('Lỗi xóa ảnh');
    }
  });

  const removeImage = async (productId, filename) => {
    try {
      await removeMutation({
        variables: { productId, filename }
      });
      return true;
    } catch (err) {
      throw err;
    }
  };

  return { removeImage, loading, error };
};