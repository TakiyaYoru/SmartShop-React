// src/contexts/WishlistContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from './AuthContext';
import { 
  GET_WISHLIST_ITEM_COUNT,
  ADD_TO_WISHLIST,
  REMOVE_FROM_WISHLIST,
  REMOVE_MULTIPLE_FROM_WISHLIST
} from '../graphql/wishlist';

// Wishlist Context
const WishlistContext = createContext();

// Wishlist state structure
const initialState = {
  itemCount: 0,
  loading: false,
  error: null
};

// Wishlist actions
const WISHLIST_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_ITEM_COUNT: 'SET_ITEM_COUNT',
  INCREMENT_COUNT: 'INCREMENT_COUNT',
  DECREMENT_COUNT: 'DECREMENT_COUNT',
  DECREMENT_MULTIPLE: 'DECREMENT_MULTIPLE'
};

// Wishlist reducer
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case WISHLIST_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case WISHLIST_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case WISHLIST_ACTIONS.SET_ITEM_COUNT:
      return { 
        ...state, 
        itemCount: action.payload, 
        loading: false, 
        error: null 
      };
    
    case WISHLIST_ACTIONS.INCREMENT_COUNT:
      return { 
        ...state, 
        itemCount: Math.max(0, state.itemCount + 1),
        loading: false,
        error: null
      };
    
    case WISHLIST_ACTIONS.DECREMENT_COUNT:
      return { 
        ...state, 
        itemCount: Math.max(0, state.itemCount - 1),
        loading: false,
        error: null
      };
    
    case WISHLIST_ACTIONS.DECREMENT_MULTIPLE:
      return { 
        ...state, 
        itemCount: Math.max(0, state.itemCount - action.payload),
        loading: false,
        error: null
      };
    
    default:
      return state;
  }
};

// Wishlist Provider
export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Query để lấy số lượng wishlist items
  const { data: wishlistData, loading: wishlistLoading, refetch } = useQuery(
    GET_WISHLIST_ITEM_COUNT,
    {
      skip: !isAuthenticated,
      errorPolicy: 'all',
      onCompleted: (data) => {
        if (data?.getWishlistItemCount !== undefined) {
          dispatch({ 
            type: WISHLIST_ACTIONS.SET_ITEM_COUNT, 
            payload: data.getWishlistItemCount 
          });
        }
      },
      onError: (error) => {
        dispatch({ 
          type: WISHLIST_ACTIONS.SET_ERROR, 
          payload: error.message 
        });
      }
    }
  );

  // Mutation thêm vào wishlist
  const [addToWishlist] = useMutation(ADD_TO_WISHLIST, {
    onCompleted: () => {
      dispatch({ type: WISHLIST_ACTIONS.INCREMENT_COUNT });
      refetch();
    },
    onError: (error) => {
      dispatch({ 
        type: WISHLIST_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
    }
  });

  // Mutation xóa khỏi wishlist
  const [removeFromWishlist] = useMutation(REMOVE_FROM_WISHLIST, {
    onCompleted: () => {
      dispatch({ type: WISHLIST_ACTIONS.DECREMENT_COUNT });
      refetch();
    },
    onError: (error) => {
      dispatch({ 
        type: WISHLIST_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
    }
  });

  // Mutation xóa nhiều items khỏi wishlist
  const [removeMultipleFromWishlist] = useMutation(REMOVE_MULTIPLE_FROM_WISHLIST, {
    onCompleted: (data) => {
      const removedCount = data?.removeMultipleFromWishlist || 0;
      dispatch({ 
        type: WISHLIST_ACTIONS.DECREMENT_MULTIPLE, 
        payload: removedCount 
      });
      refetch();
    },
    onError: (error) => {
      dispatch({ 
        type: WISHLIST_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
    }
  });

  // Cập nhật loading state
  useEffect(() => {
    dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: wishlistLoading });
  }, [wishlistLoading]);

  // Context value
  const value = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    removeMultipleFromWishlist,
    refetch
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Hook để sử dụng WishlistContext
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 