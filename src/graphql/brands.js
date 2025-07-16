// src/graphql/brands.js
import { gql } from '@apollo/client';

// Fragment cho Brand data
export const BRAND_FRAGMENT = gql`
  fragment BrandData on Brand {
    _id
    name
    slug
    description
    logo
    banner
    website
    country
    foundedYear
    isActive
    isFeatured
    createdAt
    updatedAt
    categories {
      _id
      name
    }
  }
`;

// Query để lấy danh sách brands với pagination
export const GET_BRANDS = gql`
  query GetBrands(
    $first: Int = 20,
    $offset: Int = 0,
    $orderBy: BrandsOrderBy = NAME_ASC,
    $condition: BrandConditionInput
  ) {
    brands(
      first: $first,
      offset: $offset,
      orderBy: $orderBy,
      condition: $condition
    ) {
      nodes {
        ...BrandData
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
  ${BRAND_FRAGMENT}
`;

// Query để lấy tất cả brands (simple)
export const GET_ALL_BRANDS = gql`
  query GetAllBrands {
    allBrands {
      ...BrandData
    }
  }
  ${BRAND_FRAGMENT}
`;

// Query để lấy featured brands
export const GET_FEATURED_BRANDS = gql`
  query GetFeaturedBrands {
    featuredBrands {
      ...BrandData
    }
  }
  ${BRAND_FRAGMENT}
`;

// Query để lấy chi tiết 1 brand
export const GET_BRAND = gql`
  query GetBrand($id: ID, $slug: String) {
    brand(id: $id, slug: $slug) {
      ...BrandData
    }
  }
  ${BRAND_FRAGMENT}
`;

// Query để lấy brands theo category
export const GET_BRANDS_BY_CATEGORY = gql`
  query GetBrandsByCategory($categoryId: ID!) {
    brandsByCategory(categoryId: $categoryId) {
      ...BrandData
    }
  }
  ${BRAND_FRAGMENT}
`;

// Mutations
export const CREATE_BRAND = gql`
  mutation CreateBrand($input: BrandInput!) {
    createBrand(input: $input) {
      ...BrandData
    }
  }
  ${BRAND_FRAGMENT}
`;

export const UPDATE_BRAND = gql`
  mutation UpdateBrand($id: ID!, $input: BrandInput!) {
    updateBrand(id: $id, input: $input) {
      ...BrandData
    }
  }
  ${BRAND_FRAGMENT}
`;

export const DELETE_BRAND = gql`
  mutation DeleteBrand($id: ID!) {
    deleteBrand(id: $id)
  }
`;