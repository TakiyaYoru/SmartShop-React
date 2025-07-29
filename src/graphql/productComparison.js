import { gql } from '@apollo/client';

export const COMPARE_PRODUCTS = gql`
  mutation CompareProducts($input: CompareProductsInput!) {
    compareProducts(input: $input) {
      products {
        _id
        name
        description
        price
        originalPrice
        images
        stock
        isActive
        isFeatured
        brand {
          _id
          name
        }
        category {
          _id
          name
        }
      }
      analysis {
        strengths {
          productId
          productName
          strengths
        }
        differences {
          category
          product1 {
            productId
            productName
            value
            isBest
          }
          product2 {
            productId
            productName
            value
            isBest
          }
          product3 {
            productId
            productName
            value
            isBest
          }
        }
        similarities
        bestValue
        bestPerformance
        bestCamera
        bestBattery
      }
      recommendations
      createdAt
    }
  }
`; 