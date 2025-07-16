import { gql } from '@apollo/client';

// Login mutation
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      data {
        jwt
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
  }
`;

// Register mutation
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      data {
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

// ===== NEW: OTP-based Password Reset mutations =====
export const FORGOT_PASSWORD_MUTATION = gql`
  mutation SendPasswordResetOTP($input: SendOTPInput!) {
    sendPasswordResetOTP(input: $input) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation VerifyOTPAndResetPassword($input: VerifyOTPAndResetPasswordInput!) {
    verifyOTPAndResetPassword(input: $input) {
      success
      message
    }
  }
`;

// Me query
export const ME_QUERY = gql`
  query Me {
    me {
      _id
      username
      email
      firstName
      lastName
      role
    }
  }
`;