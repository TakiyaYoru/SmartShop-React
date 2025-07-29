// src/lib/apollo.js
import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

// Danh sách các query không yêu cầu xác thực
const PUBLIC_OPERATIONS = [
  'GetProducts',
  'GetProduct',
  'GetFeaturedProducts',
  'GetProductsByCategory',
  'GetProductsByBrand',
  'GetAllCategories',
  'GetAllBrands',
  'SearchProducts',
  'SendMessage',
  'SearchProductsByVoice'
];
/*
// Link deloy server
const uploadLink = createUploadLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'https://smartshop-backend-8d0k.onrender.com/',
});
*/

// Link localhost
const uploadLink = createUploadLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/',
});


// Auth link để thêm JWT token vào headers
const authLink = setContext((operation, { headers }) => {
  // Kiểm tra nếu operation là public thì không thêm token
  if (PUBLIC_OPERATIONS.includes(operation.operationName)) {
    return { headers };
  }
  
  const token = localStorage.getItem('smartshop_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Error link để handle errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
      
      // Chỉ redirect to login nếu không phải là public operation
      if (!PUBLIC_OPERATIONS.includes(operation.operationName) && 
          (message.includes('Authentication required') || message.includes('jwt'))) {
        localStorage.removeItem('smartshop_token');
        localStorage.removeItem('smartshop_user');
        window.location.href = '/login';
      }
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
  }
});

// Apollo Client instance với upload support
export const client = new ApolloClient({
  link: from([errorLink, authLink, uploadLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['condition', 'orderBy'],
            merge(existing = { nodes: [], totalCount: 0 }, incoming, { args }) {
              // If offset is 0 or not provided, replace the entire list
              if (!args?.offset || args.offset === 0) {
                return incoming;
              }
              
              // Otherwise, append new items
              return {
                ...incoming,
                nodes: [...(existing.nodes || []), ...incoming.nodes],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});