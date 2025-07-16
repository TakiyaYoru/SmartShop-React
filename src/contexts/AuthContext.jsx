// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Auth utilities functions
const getToken = () => {
  return localStorage.getItem('smartshop_token');
};

const getUser = () => {
  const userStr = localStorage.getItem('smartshop_user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const setAuth = (token, user) => {
  localStorage.setItem('smartshop_token', token);
  localStorage.setItem('smartshop_user', JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem('smartshop_token');
  localStorage.removeItem('smartshop_user');
};

// Create Auth Context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'INIT':
      return {
        ...state,
        isAuthenticated: !!action.payload.token,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state từ localStorage
  useEffect(() => {
    const token = getToken();
    const user = getUser();
    
    dispatch({
      type: 'INIT',
      payload: { token, user }
    });
  }, []);

  // Login function
  const login = (token, user) => {
    setAuth(token, user);
    dispatch({
      type: 'LOGIN',
      payload: { token, user }
    });
  };

  // Logout function
  const logout = () => {
    clearAuth();
    dispatch({ type: 'LOGOUT' });
  };

  // Set loading function
  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  // Context value
  const value = {
    ...state,
    login,
    logout,
    setLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};