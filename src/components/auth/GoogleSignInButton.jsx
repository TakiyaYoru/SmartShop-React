// src/components/auth/GoogleSignInButton.jsx - SIMPLE VERSION với access token

import React, { useEffect, useRef } from 'react';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

const GOOGLE_CLIENT_ID = "202797233509-ml8j3bih2qvj1h5gq0p8eprgififmepg.apps.googleusercontent.com";

const GoogleSignInButton = ({ 
  text = "Đăng nhập với Google",
  className = "",
  disabled = false 
}) => {
  const { googleAuth, loading } = useGoogleAuth();
  const buttonRef = useRef(null);
  const googleInitialized = useRef(false);

  useEffect(() => {
    // Load Google Identity Services script
    if (!window.google && !document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('🔥 Google script loaded');
        initializeGoogle();
      };
      
      document.head.appendChild(script);
    } else if (window.google) {
      initializeGoogle();
    }
  }, []);

  const initializeGoogle = () => {
    if (window.google && !googleInitialized.current) {
      try {
        console.log('🔥 Initializing Google OAuth2...');
        
        googleInitialized.current = true;
        console.log('✅ Google initialized successfully');
      } catch (error) {
        console.error('❌ Google initialization error:', error);
      }
    }
  };

  const handleGoogleSignIn = () => {
    console.log('🔥 Google Sign-In clicked');
    
    if (window.google && googleInitialized.current) {
      try {
        console.log('🔥 Creating OAuth2 token client...');
        
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: (response) => {
            console.log('🔥 OAuth2 token response:', response);
            
            if (response.access_token) {
              console.log('✅ Received access token, sending to backend...');
              // Gửi access token trực tiếp đến backend
              googleAuth(response.access_token);
            } else if (response.error) {
              console.error('❌ OAuth2 error:', response.error);
            }
          },
        });
        
        console.log('🔥 Requesting access token...');
        client.requestAccessToken();
        
      } catch (error) {
        console.error('❌ OAuth2 error:', error);
        // Fallback to manual popup
        handleManualPopup();
      }
    } else {
      console.error('❌ Google not initialized');
      handleManualPopup();
    }
  };

  const handleManualPopup = () => {
    console.log('🔥 Trying manual popup method...');
    
    // Manual OAuth2 popup
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}&` +
      `response_type=token&` +  // Request access token
      `scope=openid email profile&` +
      `state=manual_popup`;
    
    const popup = window.open(
      authUrl,
      'google-signin',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // Listen for popup messages
    const messageListener = (event) => {
      if (event.origin !== window.location.origin) return;
      
      console.log('🔥 Received message from popup:', event.data);
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.access_token) {
        console.log('✅ Received access token from popup');
        googleAuth(event.data.access_token);
        popup.close();
        window.removeEventListener('message', messageListener);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.error('❌ Google Auth error from popup:', event.data.error);
        popup.close();
        window.removeEventListener('message', messageListener);
      }
    };
    
    window.addEventListener('message', messageListener);

    // Check if popup is closed
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        console.log('🔥 Google popup closed');
      }
    }, 1000);
  };

  return (
    <div className={`w-full ${className}`}>
      <button
        ref={buttonRef}
        onClick={handleGoogleSignIn}
        disabled={disabled || loading}
        className={`
          w-full flex items-center justify-center px-4 py-3 border border-gray-300 
          rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            Đang xử lý...
          </div>
        ) : (
          <div className="flex items-center">
            {/* Google Icon */}
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">{text}</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default GoogleSignInButton;