import { gql } from '@apollo/client';

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: ChatInput!) {
    sendMessage(input: $input) {
      message
      suggestions {
        product {
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
        relevance
        reason
      }
      analysis {
        brand
        maxPrice
        minPrice
        features
        priceRange
        targetUser
        keywords
      }
    }
  }
`;

export const SEARCH_PRODUCTS_BY_VOICE = gql`
  mutation SearchProductsByVoice($audioUrl: String!) {
    searchProductsByVoice(audioUrl: $audioUrl) {
      message
      suggestions {
        product {
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
        relevance
        reason
      }
      analysis {
        brand
        maxPrice
        minPrice
        features
        priceRange
        targetUser
        keywords
      }
    }
  }
`;

export const GET_CHAT_HISTORY = gql`
  query GetChatHistory($userId: ID!) {
    chatHistory(userId: $userId) {
      id
      content
      role
      timestamp
      userId
    }
  }
`; 