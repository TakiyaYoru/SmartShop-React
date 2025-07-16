// src/graphql/upload.js
import { gql } from '@apollo/client';

// Upload single file mutation 
export const UPLOAD_FILE = gql`
  mutation Upload($file: File!) {
    upload(file: $file)
  }
`;

// Upload single image for product
export const UPLOAD_PRODUCT_IMAGE = gql`
  mutation UploadProductImage($productId: ID!, $file: File!) {
    uploadProductImage(productId: $productId, file: $file) {
      success
      message
      filename
      url
    }
  }
`;

// Upload multiple images for product
export const UPLOAD_PRODUCT_IMAGES = gql`
  mutation UploadProductImages($productId: ID!, $files: [File!]!) {
    uploadProductImages(productId: $productId, files: $files) {
      success
      message
      filename
      url
    }
  }
`;

// Remove image from product
export const REMOVE_PRODUCT_IMAGE = gql`
  mutation RemoveProductImage($productId: ID!, $filename: String!) {
    removeProductImage(productId: $productId, filename: $filename)
  }
`;