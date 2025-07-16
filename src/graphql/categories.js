// src/graphql/categories.js
import { gql } from '@apollo/client';

// Fragment cho Category data
export const CATEGORY_FRAGMENT = gql`
  fragment CategoryData on Category {
    _id
    name
    description
    image
    isActive
    createdAt
    updatedAt
  }
`;

// Query để lấy danh sách categories với pagination
export const GET_CATEGORIES = gql`
  query GetCategories(
    $first: Int = 20,
    $offset: Int = 0,
    $orderBy: CategoriesOrderBy = NAME_ASC,
    $condition: CategoryConditionInput
  ) {
    categories(
      first: $first,
      offset: $offset,
      orderBy: $orderBy,
      condition: $condition
    ) {
      nodes {
        ...CategoryData
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
  ${CATEGORY_FRAGMENT}
`;

// Query để lấy tất cả categories (simple)
export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    allCategories {
      ...CategoryData
    }
  }
  ${CATEGORY_FRAGMENT}
`;

// Query để lấy chi tiết 1 category
export const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      ...CategoryData
    }
  }
  ${CATEGORY_FRAGMENT}
`;

// Mutations
export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      ...CategoryData
    }
  }
  ${CATEGORY_FRAGMENT}
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      ...CategoryData
    }
  }
  ${CATEGORY_FRAGMENT}
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;