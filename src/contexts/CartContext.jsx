// src/contexts/CartContext.jsx - FIXED VERSION
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import {
  GET_CART,
  GET_CART_ITEM_COUNT,
  ADD_TO_CART,
  UPDATE_CART_ITEM,
  REMOVE_FROM_CART,
  CLEAR_CART
} from '../graphql/cart';

// Cart Context
const CartContext = createContext();

// Cart state structure
const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  loading: false,
  error: null
};

// Cart actions
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CART: 'SET_CART',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_ITEM_COUNT: 'SET_ITEM_COUNT'
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case CART_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case CART_ACTIONS.SET_CART:
      const cartData = action.payload || { items: [], totalItems: 0, subtotal: 0 };
      return {
        ...state,
        items: cartData.items || [],
        totalItems: cartData.totalItems || 0,
        subtotal: cartData.subtotal || 0,
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.ADD_ITEM:
      // Logic thêm item vào cart
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.productId === newItem.productId);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update existing item
        updatedItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: newItem.quantity, totalPrice: newItem.totalPrice }
            : item
        );
      } else {
        // Add new item
        updatedItems = [...state.items, newItem];
      }
      
      const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return {
        ...state,
        items: updatedItems,
        totalItems: newTotalItems,
        subtotal: newSubtotal,
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.UPDATE_ITEM:
      const updatedItem = action.payload;
      const updatedItemsArray = state.items.map(item =>
        item.productId === updatedItem.productId
          ? { ...item, quantity: updatedItem.quantity, totalPrice: updatedItem.totalPrice }
          : item
      );
      
      const updatedTotalItems = updatedItemsArray.reduce((sum, item) => sum + item.quantity, 0);
      const updatedSubtotal = updatedItemsArray.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return {
        ...state,
        items: updatedItemsArray,
        totalItems: updatedTotalItems,
        subtotal: updatedSubtotal,
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.REMOVE_ITEM:
      const filteredItems = state.items.filter(item => item.productId !== action.payload);
      const filteredTotalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      const filteredSubtotal = filteredItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredTotalItems,
        subtotal: filteredSubtotal,
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        subtotal: 0,
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.SET_ITEM_COUNT:
      return {
        ...state,
        totalItems: action.payload || 0
      };
    
    default:
      return state;
  }
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // GraphQL queries and mutations
  const { data: cartData, loading: cartLoading, error: cartError, refetch: refetchCart } = useQuery(GET_CART, {
    skip: !isAuthenticated,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      console.log('Cart data loaded:', data);
      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: data?.getMyCart
      });
    },
    onError: (error) => {
      console.error('Cart query error:', error);
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.message
      });
    }
  });

  const { data: itemCountData } = useQuery(GET_CART_ITEM_COUNT, {
    skip: !isAuthenticated,
    errorPolicy: 'all',
    pollInterval: 30000, // Poll every 30 seconds
    onCompleted: (data) => {
      dispatch({
        type: CART_ACTIONS.SET_ITEM_COUNT,
        payload: data?.getCartItemCount
      });
    }
  });

  // Mutations
  const [addToCartMutation] = useMutation(ADD_TO_CART, {
    onCompleted: (data) => {
      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: data.addToCart
      });
      toast.success('Đã thêm vào giỏ hàng!');
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể thêm vào giỏ hàng');
    }
  });

  const [updateCartItemMutation] = useMutation(UPDATE_CART_ITEM, {
    onCompleted: (data) => {
      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM,
        payload: data.updateCartItem
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể cập nhật giỏ hàng');
    }
  });

  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART, {
    onCompleted: (data) => {
      if (data.removeFromCart) {
        // Refresh cart data
        refetchCart();
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể xóa khỏi giỏ hàng');
    }
  });

  const [clearCartMutation] = useMutation(CLEAR_CART, {
    onCompleted: (data) => {
      if (data.clearCart) {
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
        toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể xóa giỏ hàng');
    }
  });

  // Cart actions
  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      await addToCartMutation({
        variables: {
          input: {
            productId,
            quantity
          }
        }
      });
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  }, [isAuthenticated, addToCartMutation]);

  const updateCartItem = useCallback(async (productId, quantity) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      await updateCartItemMutation({
        variables: {
          input: {
            productId,
            quantity
          }
        }
      });
    } catch (error) {
      console.error('Update cart item error:', error);
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  }, [isAuthenticated, updateCartItemMutation]);

  const removeFromCart = useCallback(async (productId) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      await removeFromCartMutation({
        variables: { productId }
      });
      
      // Update local state immediately
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM,
        payload: productId
      });
      
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      console.error('Remove from cart error:', error);
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  }, [isAuthenticated, removeFromCartMutation]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      await clearCartMutation();
    } catch (error) {
      console.error('Clear cart error:', error);
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  }, [isAuthenticated, clearCartMutation]);

  // ✅ FIX: Thêm refreshCart function
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      console.log('Refreshing cart data...');
      await refetchCart();
    } catch (error) {
      console.error('Refresh cart error:', error);
    }
  }, [isAuthenticated, refetchCart]);

  // Effect to handle authentication changes
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear cart when user logs out
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isAuthenticated]);

  // Effect to set loading state from query
  useEffect(() => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: cartLoading });
  }, [cartLoading]);

  // Effect to handle cart error
  useEffect(() => {
    if (cartError) {
      dispatch({ 
        type: CART_ACTIONS.SET_ERROR, 
        payload: cartError.message 
      });
    }
  }, [cartError]);

  // Create context value
  const contextValue = {
    // Cart state
    cart: {
      items: state.items,
      totalItems: state.totalItems,
      subtotal: state.subtotal
    },
    loading: state.loading,
    error: state.error,
    
    // Cart actions
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart, // ✅ FIX: Export refreshCart function
    
    // Computed values
    isEmpty: state.items.length === 0,
    itemCount: state.totalItems
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use Cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// Export default
export default CartProvider;