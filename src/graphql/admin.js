// src/graphql/admin.js
import { gql } from '@apollo/client';

// Queries cho form data - lấy tất cả categories và brands
export const GET_ALL_CATEGORIES = gql`
  query GetAllCategoriesForAdmin {
    allCategories {
      _id
      name
      description
      isActive
    }
  }
`;

export const GET_ALL_BRANDS = gql`
  query GetAllBrandsForAdmin {
    allBrands {
      _id
      name
      description
      isActive
    }
  }
`;

// Query để lấy products với đầy đủ thông tin cho admin
export const GET_ADMIN_PRODUCTS = gql`
  query GetAdminProducts(
    $first: Int = 10,
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
        }
        brand {
          _id
          name
          description
        }
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`;

// Query để lấy chi tiết 1 product cho admin
export const GET_ADMIN_PRODUCT = gql`
  query GetAdminProduct($id: ID!) {
    product(id: $id) {
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
      }
      brand {
        _id
        name
        description
      }
    }
  }
`;

// Mutations cho admin
export const ADMIN_CREATE_PRODUCT = gql`
  mutation AdminCreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
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
      category {
        _id
        name
      }
      brand {
        _id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export const ADMIN_UPDATE_PRODUCT = gql`
  mutation AdminUpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
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
      category {
        _id
        name
      }
      brand {
        _id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export const ADMIN_DELETE_PRODUCT = gql`
  mutation AdminDeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;