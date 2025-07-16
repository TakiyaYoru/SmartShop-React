// src/graphql/products.js
import { gql } from '@apollo/client';

// Fragment cho Product data
export const PRODUCT_FRAGMENT = gql`
  fragment ProductData on Product {
    _id
    name
    description
    price
    originalPrice
    sku
    images
    stock
    isActive
    isFeatured
    createdAt
    updatedAt
    category {
      _id
      name
      description
      image
      isActive
    }
    brand {
      _id
      name
      description
      logo
      banner
      website
      country
      foundedYear
      isActive
      isFeatured
    }
  }
`;

// Query để lấy danh sách products với pagination và filter
export const GET_PRODUCTS = gql`
  query GetProducts(
    $first: Int = 12,
    $offset: Int = 0,
    $orderBy: ProductsOrderBy = CREATED_DESC,
    $condition: ProductConditionInput
  ) {
    products(
      first: $first,
      offset: $offset,
      orderBy: $orderBy,
      condition: $condition
    ) {
      nodes {
        ...ProductData
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// Query để lấy chi tiết 1 product
export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      ...ProductData
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// Query để search products
export const SEARCH_PRODUCTS = gql`
  query SearchProducts(
    $query: String!,
    $first: Int = 12,
    $offset: Int = 0,
    $orderBy: ProductsOrderBy = CREATED_DESC
  ) {
    searchProducts(
      query: $query,
      first: $first,
      offset: $offset,
      orderBy: $orderBy
    ) {
      nodes {
        ...ProductData
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// Query để lấy featured products
export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts {
    featuredProducts {
      ...ProductData
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// Query để lấy products theo category
export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: ID!) {
    productsByCategory(categoryId: $categoryId) {
      ...ProductData
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// Query để lấy products theo brand
export const GET_PRODUCTS_BY_BRAND = gql`
  query GetProductsByBrand($brandId: ID!) {
    productsByBrand(brandId: $brandId) {
      ...ProductData
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// Query để lấy tất cả products (simple)
export const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    allProducts {
      ...ProductData
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// Mutations cho Admin
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      ...ProductData
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      ...ProductData
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

// Thêm input type cho filter condition
export const PRODUCT_CONDITION_INPUT = gql`
  input ProductConditionInput {
    # Text search
    name: String
    
    # Price range
    price: PriceRangeInput
    
    # Category & Brand
    category: ID
    brand: ID
    
    # Stock filter
    stock: StockRangeInput
    
    # Featured filter
    isFeatured: Boolean
  }

  input PriceRangeInput {
    min: Float
    max: Float
  }

  input StockRangeInput {
    min: Int
    max: Int
  }
`;

export const UPDATE_PRODUCT_IMAGES = gql`
  mutation UpdateProductImages($id: ID!, $images: [String!]!) {
    updateProductImages(id: $id, images: $images) {
      ...ProductData
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const SET_MAIN_PRODUCT_IMAGE = gql`
  mutation SetMainProductImage($id: ID!, $imageIndex: Int!) {
    setMainProductImage(id: $id, imageIndex: $imageIndex) {
      ...ProductData
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const DELETE_PRODUCT_IMAGE = gql`
  mutation DeleteProductImage($id: ID!, $imageIndex: Int!) {
    deleteProductImage(id: $id, imageIndex: $imageIndex) {
      ...ProductData
    }
  }
  ${PRODUCT_FRAGMENT}
`;