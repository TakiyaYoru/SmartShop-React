import { gql } from '@apollo/client';

export const SEARCH_BY_IMAGE = gql`
  mutation SearchByImage($input: ImageSearchInput!) {
    searchByImage(input: $input) {
      message
      suggestions {
        product {
          _id
          name
          price
          images
          brand {
            name
          }
          isFeatured
        }
        reason
      }
      analysis {
        intent
        query
        category
        brand
        maxPrice
        minPrice
        features
        productType
        excludeBrands
      }
    }
  }
`; 