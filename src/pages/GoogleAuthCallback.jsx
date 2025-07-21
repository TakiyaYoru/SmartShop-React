// src/pages/GoogleAuthCallback.jsx - Handle Google OAuth redirect

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔥 Google Auth Callback page loaded');
    console.log('🔥 Current URL:', window.location.href);
    
    // Parse URL hash for tokens (implicit flow)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = hashParams.get('id_token');
    const accessToken = hashParams.get('access_token');
    
    // Parse URL search params for authorization code (code flow)
    const searchParams = new URLSearchParams(window.location.search);
    const authCode = searchParams.get('code');
    const error = searchParams.get('error');
    
    console.log('🔍 ID Token:', idToken ? 'Present' : 'Not found');
    console.log('🔍 Access Token:', accessToken ? 'Present' : 'Not found');
    console.log('🔍 Auth Code:', authCode ? 'Present' : 'Not found');
    console.log('🔍 Error:', error);
    
    if (error) {
      console.error('❌ Google Auth error:', error);
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error
        }, window.location.origin);
        window.close();
      } else {
        navigate('/login?error=google_auth_failed');
      }
      return;
    }
    
    if (idToken) {
      console.log('✅ ID Token found, sending to parent window');
      // Send ID token to parent window (popup method)
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          id_token: idToken,
          access_token: accessToken
        }, window.location.origin);
        window.close();
      } else {
        // Direct navigation (not popup) - store token and redirect
        localStorage.setItem('google_id_token', idToken);
        navigate('/auth/process-google-token');
      }
      return;
    }
    
    if (authCode) {
      console.log('✅ Authorization code found, exchanging for tokens...');
      exchangeCodeForTokens(authCode);
      return;
    }
    
    // No tokens found
    console.error('❌ No tokens or auth code found in callback');
    if (window.opener) {
      window.opener.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: 'no_tokens_found'
      }, window.location.origin);
      window.close();
    } else {
      navigate('/login?error=no_tokens');
    }
  }, [navigate]);

  const exchangeCodeForTokens = async (authCode) => {
    try {
      console.log('🔄 Exchanging authorization code for tokens...');
      
      // This should be done on your backend for security
      // For now, we'll redirect to a processing page
      const params = new URLSearchParams({
        code: authCode,
        redirect_uri: window.location.origin + '/auth/callback'
      });
      
      // Store auth code temporarily and redirect to processing
      sessionStorage.setItem('google_auth_code', authCode);
      navigate('/auth/process-google-code');
      
    } catch (error) {
      console.error('❌ Error exchanging code for tokens:', error);
      navigate('/login?error=token_exchange_failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Đang xử lý đăng nhập Google...
        </h2>
        <p className="text-gray-600">
          Vui lòng chờ trong giây lát
        </p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;