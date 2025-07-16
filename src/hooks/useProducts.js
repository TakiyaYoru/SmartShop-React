// src/hooks/useProducts.js - Key fixes for product creation
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import React from 'react';

// Import GraphQL operations
import {
  GET_PRODUCTS,
  GET_PRODUCT,
  SEARCH_PRODUCTS,
  GET_FEATURED_PRODUCTS,
  GET_PRODUCTS_BY_CATEGORY,
  GET_PRODUCTS_BY_BRAND,
  GET_ALL_PRODUCTS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  UPDATE_PRODUCT_IMAGES,
  SET_MAIN_PRODUCT_IMAGE,
  DELETE_PRODUCT_IMAGE
} from '../graphql/products';

import {
  GET_ALL_CATEGORIES
} from '../graphql/categories';

import {
  GET_ALL_BRANDS
} from '../graphql/brands';

// Import upload hooks
import { useUploadProductImages } from './useUpload';

// Default values for null/undefined data
const DEFAULT_BRAND = { 
  _id: 'default-brand', 
  name: 'Unknown Brand', 
  description: 'Brand information not available',
  logo: '',
  banner: '',
  website: '',
  country: '',
  foundedYear: null,
  isActive: true,
  isFeatured: false
};

const DEFAULT_CATEGORY = { 
  _id: 'default-category', 
  name: 'Unknown Category', 
  description: 'Category information not available',
  image: '',
  isActive: true
};

// Safe product data processor
const processProductData = (product) => {
  if (!product) return null;
  
  if (!product._id || !product.name || typeof product.price !== 'number') {
    console.warn('Invalid product data:', product);
    return null;
  }
  
  return {
    ...product,
    brand: (product.brand && typeof product.brand === 'object' && product.brand._id) 
      ? product.brand 
      : DEFAULT_BRAND,
    category: (product.category && typeof product.category === 'object' && product.category._id) 
      ? product.category 
      : DEFAULT_CATEGORY,
    images: Array.isArray(product.images) ? product.images : [],
    stock: typeof product.stock === 'number' ? product.stock : 0,
    price: typeof product.price === 'number' ? product.price : 0,
    originalPrice: typeof product.originalPrice === 'number' ? product.originalPrice : null,
    isActive: typeof product.isActive === 'boolean' ? product.isActive : true,
    isFeatured: typeof product.isFeatured === 'boolean' ? product.isFeatured : false
  };
};

// =================
// PUBLIC HOOKS (Customer facing)
// =================

export const useProducts = (options = {}) => {
  const {
    first = 12,
    offset = 0,
    orderBy = 'CREATED_DESC',
    condition = null,
    skip = false
  } = options;

  // Build filter condition
  const buildCondition = () => {
    if (!condition) return null;

    const filterCondition = {};

    // Price range
    if (condition.price?.min || condition.price?.max) {
      filterCondition.price = {};
      if (condition.price.min) filterCondition.price.min = parseFloat(condition.price.min);
      if (condition.price.max) filterCondition.price.max = parseFloat(condition.price.max);
    }

    // Category
    if (condition.category) {
      filterCondition.category = condition.category;
    }

    // Brand
    if (condition.brand) {
      filterCondition.brand = condition.brand;
    }

    // Stock
    if (condition.stock?.min || condition.stock?.max) {
      filterCondition.stock = {};
      if (condition.stock.min) filterCondition.stock.min = parseInt(condition.stock.min);
      if (condition.stock.max) filterCondition.stock.max = parseInt(condition.stock.max);
    }

    // Featured
    if (condition.isFeatured) {
      filterCondition.isFeatured = true;
    }

    console.log('useProducts - Final filter condition:', filterCondition);
    return Object.keys(filterCondition).length > 0 ? filterCondition : null;
  };

  const { data, loading, error, fetchMore, refetch } = useQuery(GET_PRODUCTS, {
    variables: {
      first,
      offset,
      orderBy,
      condition: buildCondition()
    },
    skip,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only' // Force fetch from network
  });

  const loadMore = () => {
    if (data?.products?.hasNextPage) {
      return fetchMore({
        variables: {
          offset: data.products.nodes.length
        }
      });
    }
  };

  const products = React.useMemo(() => {
    const nodes = data?.products?.nodes || [];
    return nodes
      .map(processProductData)
      .filter(Boolean);
  }, [data?.products?.nodes]);

  return {
    products,
    totalCount: data?.products?.totalCount || 0,
    hasNextPage: data?.products?.hasNextPage || false,
    hasPreviousPage: data?.products?.hasPreviousPage || false,
    loading,
    error,
    loadMore,
    refetch
  };
};

export const useSearchProducts = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [searchProducts] = useLazyQuery(SEARCH_PRODUCTS, {
    onCompleted: (data) => {
      const nodes = data?.searchProducts?.nodes || [];
      const results = nodes
        .map(processProductData)
        .filter(Boolean);
      
      setSearchResults(results);
      setIsSearching(false);
    },
    onError: (error) => {
      console.error('Search error:', error);
      toast.error('Lỗi khi tìm kiếm sản phẩm');
      setIsSearching(false);
      setSearchResults([]);
    },
    errorPolicy: 'all'
  });

  const search = async (query, options = {}) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      await searchProducts({
        variables: {
          query: query.trim(),
          first: options.first || 20,
          offset: options.offset || 0,
          orderBy: options.orderBy || 'CREATED_DESC'
        }
      });
    } catch (error) {
      console.error('Search execution error:', error);
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
  };

  return {
    searchResults,
    isSearching,
    search,
    clearSearch
  };
};

export const useProduct = (productId) => {
  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id: productId },
    skip: !productId,
    errorPolicy: 'all'
  });

  const product = data?.product ? processProductData(data.product) : null;

  return {
    product,
    loading,
    error
  };
};

export const useFeaturedProducts = () => {
  const { data, loading, error } = useQuery(GET_FEATURED_PRODUCTS, {
    errorPolicy: 'all'
  });

  const featuredProducts = (data?.featuredProducts || [])
    .map(processProductData)
    .filter(Boolean);

  return {
    featuredProducts,
    loading,
    error
  };
};

export const useProductsByCategory = (categoryId) => {
  const { data, loading, error } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categoryId },
    skip: !categoryId,
    errorPolicy: 'all'
  });

  const products = (data?.productsByCategory || [])
    .map(processProductData)
    .filter(Boolean);

  return {
    products,
    loading,
    error
  };
};

export const useProductsByBrand = (brandId) => {
  const { data, loading, error } = useQuery(GET_PRODUCTS_BY_BRAND, {
    variables: { brandId },
    skip: !brandId,
    errorPolicy: 'all'
  });

  const products = (data?.productsByBrand || [])
    .map(processProductData)
    .filter(Boolean);

  return {
    products,
    loading,
    error
  };
};

export const useCategories = () => {
  const { data, loading, error } = useQuery(GET_ALL_CATEGORIES, {
    errorPolicy: 'all'
  });

  return {
    categories: data?.allCategories || [],
    loading,
    error
  };
};

export const useBrands = () => {
  const { data, loading, error } = useQuery(GET_ALL_BRANDS, {
    errorPolicy: 'all'
  });

  return {
    brands: data?.allBrands || [],
    loading,
    error
  };
};

// =================
// ADMIN HOOKS
// =================

export const useCreateProduct = () => {
  const [createProductMutation, { loading, error }] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [
      { query: GET_PRODUCTS },
      { query: GET_ALL_PRODUCTS }
    ],
    onCompleted: (data) => {
      console.log('✅ Create product mutation completed:', data);
    },
    onError: (error) => {
      console.error('❌ Create product mutation error:', error);
    }
  });

  const createProduct = async (productData) => {
    try {
      console.log('🚀 Creating product with data:', productData);
      
      const result = await createProductMutation({
        variables: {
          input: productData
        }
      });
      
      console.log('📦 Create product result:', result);
      
      if (!result?.data?.createProduct) {
        throw new Error('No product returned from create mutation');
      }
      
      return result.data.createProduct;
      
    } catch (err) {
      console.error('❌ Create product error:', err);
      throw err;
    }
  };

  return {
    createProduct,
    loading,
    error
  };
};

export const useUpdateProduct = () => {
  const [updateProductMutation, { loading, error }] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [
      { query: GET_PRODUCTS },
      { query: GET_ALL_PRODUCTS }
    ],
    onCompleted: (data) => {
      console.log('✅ Update product completed:', data);
    },
    onError: (error) => {
      console.error('❌ Update product error:', error);
    }
  });

  const updateProduct = async (productId, productData) => {
    try {
      console.log('🔄 Updating product:', productId, 'with data:', productData);
      
      const result = await updateProductMutation({
        variables: {
          id: productId,
          input: productData
        }
      });
      
      console.log('📦 Update result:', result);
      
      if (!result?.data?.updateProduct) {
        throw new Error('No product returned from update mutation');
      }
      
      return result.data.updateProduct;
      
    } catch (err) {
      console.error('❌ Update product error:', err);
      throw err;
    }
  };

  return {
    updateProduct,
    loading,
    error
  };
};

// Combined hook for creating product with images
export const useCreateProductWithImages = () => {
  const { createProduct, loading: createLoading, error: createError } = useCreateProduct();
  const { uploadImages, loading: uploadLoading } = useUploadProductImages();
  
  const [loading, setLoading] = useState(false);

  const createProductWithImages = async (productData, imageFiles) => {
    setLoading(true);
    
    try {
      console.log('🚀 Step 1: Creating product...');
      const createdProduct = await createProduct(productData);
      
      console.log('✅ Product created:', createdProduct);
      
      if (!createdProduct?._id) {
        throw new Error('Failed to create product - no product ID returned');
      }

      // Step 2: Upload images if provided
      if (imageFiles && imageFiles.length > 0) {
        console.log('🖼️ Step 2: Uploading images...');
        try {
          const uploadResult = await uploadImages(createdProduct._id, imageFiles);
          
          if (!uploadResult?.success) {
            console.warn('⚠️ Image upload failed:', uploadResult?.message);
            toast.warn(`Sản phẩm đã tạo thành công nhưng upload ảnh thất bại: ${uploadResult?.message || 'Unknown error'}`);
          } else {
            console.log('✅ Images uploaded successfully');
          }
        } catch (uploadError) {
          console.error('❌ Image upload error:', uploadError);
          toast.warn(`Sản phẩm đã tạo thành công nhưng upload ảnh thất bại: ${uploadError.message}`);
        }
      }

      setLoading(false);
      return createdProduct;
      
    } catch (error) {
      setLoading(false);
      console.error('❌ Create product with images error:', error);
      throw error;
    }
  };

  return {
    createProductWithImages,
    loading: loading || createLoading || uploadLoading,
    error: createError
  };
};

export const useUpdateProductWithImages = () => {
  const { updateProduct, loading: updateLoading, error: updateError } = useUpdateProduct();
  const { uploadImages, loading: uploadLoading } = useUploadProductImages();
  
  const [loading, setLoading] = useState(false);

  const updateProductWithImages = async (productId, productData, imageFiles) => {
    setLoading(true);
    
    try {
      console.log('🔄 Step 1: Updating product...');
      const updatedProduct = await updateProduct(productId, productData);
      
      // Step 2: Upload new images if provided
      if (imageFiles && imageFiles.length > 0) {
        console.log('🖼️ Step 2: Uploading new images...');
        try {
          const uploadResult = await uploadImages(productId, imageFiles);
          
          if (!uploadResult?.success) {
            toast.warn(`Cập nhật sản phẩm thành công nhưng upload ảnh thất bại: ${uploadResult?.message || 'Unknown error'}`);
          }
        } catch (uploadError) {
          console.error('❌ Image upload error:', uploadError);
          toast.warn(`Cập nhật sản phẩm thành công nhưng upload ảnh thất bại: ${uploadError.message}`);
        }
      }

      setLoading(false);
      return updatedProduct;
      
    } catch (error) {
      setLoading(false);
      console.error('❌ Update product with images error:', error);
      throw error;
    }
  };

  return {
    updateProductWithImages,
    loading: loading || updateLoading || uploadLoading,
    error: updateError
  };
};

export const useDeleteProduct = () => {
  const [deleteProductMutation, { loading, error }] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [
      { query: GET_PRODUCTS },
      { query: GET_ALL_PRODUCTS }
    ],
    onCompleted: (data) => {
      console.log('✅ Delete product completed:', data);
      toast.success('Xóa sản phẩm thành công!');
    },
    onError: (error) => {
      console.error('❌ Delete product error:', error);
      toast.error(`Lỗi xóa sản phẩm: ${error.message}`);
    }
  });

  const deleteProduct = async (productId) => {
    try {
      await deleteProductMutation({
        variables: {
          id: productId
        }
      });
      return true;
    } catch (err) {
      console.error('❌ Delete product error:', err);
      throw err;
    }
  };

  return {
    deleteProduct,
    loading,
    error
  };
};

export const useProductFormData = () => {
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_ALL_CATEGORIES, {
    errorPolicy: 'all'
  });
  const { data: brandsData, loading: brandsLoading } = useQuery(GET_ALL_BRANDS, {
    errorPolicy: 'all'
  });

  return {
    categories: categoriesData?.allCategories || [],
    brands: brandsData?.allBrands || [],
    loading: categoriesLoading || brandsLoading
  };
};

export const useUpdateProductImages = () => {
  const [updateImages, { loading }] = useMutation(UPDATE_PRODUCT_IMAGES, {
    refetchQueries: [{ query: GET_PRODUCTS }]
  });

  return {
    updateProductImages: updateImages,
    loading
  };
};

export const useSetMainProductImage = () => {
  const [setMain, { loading }] = useMutation(SET_MAIN_PRODUCT_IMAGE, {
    refetchQueries: [{ query: GET_PRODUCTS }]
  });

  return {
    setMainProductImage: setMain,
    loading
  };
};

export const useDeleteProductImage = () => {
  const [deleteImage, { loading }] = useMutation(DELETE_PRODUCT_IMAGE, {
    refetchQueries: [{ query: GET_PRODUCTS }]
  });

  return {
    deleteProductImage: deleteImage,
    loading
  };
};