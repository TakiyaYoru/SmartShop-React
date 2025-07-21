// src/graphql/googleAuth.js

import { gql } from '@apollo/client';

// Google Auth mutation
export const GOOGLE_AUTH_MUTATION = gql`
  mutation GoogleAuth($input: GoogleAuthInput!) {
    googleAuth(input: $input) {
      success
      message
      token
      user {
        _id
        username
        email
        firstName
        lastName
        role
      }
      requiresProfileCompletion
    }
  }
`;

// Complete profile mutation
export const COMPLETE_PROFILE_MUTATION = gql`
  mutation CompleteProfile($input: CompleteProfileInput!) {
    completeProfile(input: $input) {
      success
      message
      user {
        _id
        username
        email
        firstName
        lastName
        role
      }
    }
  }
`;