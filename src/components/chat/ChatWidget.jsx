import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { SEND_MESSAGE } from '../../graphql/chat.js';
import { COMPARE_PRODUCTS } from '../../graphql/productComparison.js';
import { SEARCH_BY_IMAGE } from '../../graphql/imageSearch.js';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  SparklesIcon,
  ScaleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { formatPrice } from '../../lib/utils';
import { getImageUrl } from '../../utils/imageHelper';
import ComparisonTable from './ComparisonTable';
import ImageUpload from './ImageUpload';
import VoiceInput from './VoiceInput';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'compare'
  const [compareProducts, setCompareProducts] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const client = useApolloClient();
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [compareProductsMutation] = useMutation(COMPARE_PRODUCTS);
  const [searchByImageMutation] = useMutation(SEARCH_BY_IMAGE);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Clear Apollo cache to fix any cached issues
      client.clearStore();
      
      setMessages([
        {
          id: 'welcome',
          content: 'Xin chào! Tôi là trợ lý AI của SmartShop. Tôi có thể giúp bạn tìm kiếm điện thoại phù hợp. Hãy cho tôi biết bạn đang tìm kiếm gì nhé!',
          role: 'ASSISTANT',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [isOpen, client]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Store the message before clearing input
    const messageToSend = inputMessage.trim();

    // Auto switch to search tab when sending message
    setActiveTab('search');

    const userMessage = {
      id: Date.now().toString(),
      content: messageToSend,
      role: 'USER',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🔍 Sending message to backend:', messageToSend);
      
      const { data } = await sendMessage({
        variables: {
          input: {
            message: messageToSend
          }
        }
      });

      console.log('📦 Received data from backend:', data);
      console.log('💬 Response message:', data.sendMessage.message);
      console.log('🎯 Suggestions count:', data.sendMessage.suggestions?.length);
      console.log('📊 Analysis:', data.sendMessage.analysis);
      console.log('🔄 Mode:', data.sendMessage.mode);
      console.log('➕ Add to compare:', data.sendMessage.addToCompare);

      // Handle mode changes
      if (data.sendMessage.mode) {
        setActiveTab(data.sendMessage.mode);
      }

      // Store search results
      if (data.sendMessage.suggestions && data.sendMessage.suggestions.length > 0) {
        setSearchResults(data.sendMessage.suggestions);
      }

      // Handle adding product to comparison
      if (data.sendMessage.addToCompare) {
        const product = data.sendMessage.addToCompare;
        if (compareProducts.length < 3 && !compareProducts.find(p => p._id === product._id)) {
          setCompareProducts(prev => [...prev, product]);
        }
      }

      // Handle comparison request
      if (data.sendMessage.shouldCompare && compareProducts.length >= 2) {
        // TODO: Implement comparison logic
        console.log('🔄 Should compare products:', compareProducts);
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: data.sendMessage.message,
        role: 'ASSISTANT',
        timestamp: new Date().toISOString(),
        suggestions: data.sendMessage.suggestions || []
      };

      console.log('🤖 Assistant message to display:', assistantMessage);

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      let errorContent = 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.';
      
      // More specific error messages
      if (error.message.includes('NetworkError')) {
        errorContent = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      } else if (error.message.includes('GraphQL')) {
        errorContent = 'Lỗi xử lý yêu cầu. Vui lòng thử lại sau.';
      } else if (error.message.includes('Claude')) {
        errorContent = 'AI service tạm thời không khả dụng. Vui lòng thử lại sau.';
      }
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        role: 'ASSISTANT',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickMessage = (message) => {
    setInputMessage(message);
    // Auto send after a short delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleAddToCompare = (product) => {
    if (compareProducts.length >= 3) {
      alert('Bạn chỉ có thể so sánh tối đa 3 sản phẩm');
      return;
    }
    
    if (compareProducts.find(p => p._id === product._id)) {
      alert('Sản phẩm này đã được thêm vào so sánh');
      return;
    }
    
    setCompareProducts(prev => [...prev, product]);
    setActiveTab('compare'); // Switch to compare tab
  };

  // Clear comparison list
  const handleClearComparison = () => {
    setCompareProducts([]);
    setComparisonResult(null);
    setActiveTab('search');
  };

  // Clear search results
  const handleClearSearch = () => {
    setSearchResults([]);
    setMessages([]);
  };

  // Handle tab switching with validation
  const handleTabSwitch = (tab) => {
    if (tab === 'compare' && compareProducts.length === 0) {
      // If no products to compare, switch to search tab
      setActiveTab('search');
      return;
    }
    setActiveTab(tab);
  };

  // Handle image upload
  const handleImageUpload = async (imageData) => {
    const userMessage = {
      id: Date.now().toString(),
      content: `[Đã tải lên ảnh: ${imageData.name}]`,
      role: 'USER',
      timestamp: new Date().toISOString(),
      image: imageData.preview
    };

    setMessages(prev => [...prev, userMessage]);
    setActiveTab('search');
    setIsLoading(true);

    try {
      console.log('🖼️ Sending image to backend for analysis...');
      
      // Extract base64 data from image
      const base64Data = imageData.preview;
      const imageType = imageData.file.type;
      
      const { data } = await searchByImageMutation({
        variables: {
          input: {
            imageData: base64Data,
            imageType: imageType
          }
        }
      });

      console.log('🖼️ Image analysis result:', data);

      if (data?.searchByImage) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          content: data.searchByImage.message,
          role: 'ASSISTANT',
          timestamp: new Date().toISOString(),
          suggestions: data.searchByImage.suggestions || []
        };

        setMessages(prev => [...prev, botMessage]);

        // Auto-search using chatbot's search functionality
        if (data.searchByImage.analysis?.query) {
          console.log('🤖 Auto-searching for:', data.searchByImage.analysis.query);
          
          // Auto-send the search query immediately after image analysis
          setTimeout(async () => {
            console.log('🚀 Auto-sending search query...');
            
            // Create a temporary message to send
            const tempMessage = data.searchByImage.analysis.query;
            
            // Auto switch to search tab
            setActiveTab('search');
            
            // Create user message for the search
            const userMessage = {
              id: Date.now().toString(),
              content: tempMessage,
              role: 'USER',
              timestamp: new Date().toISOString()
            };
            
            setMessages(prev => [...prev, userMessage]);
            setIsLoading(true);
            
            try {
              console.log('🔍 Auto-sending search:', tempMessage);
              
              const { data: searchData } = await sendMessage({
                variables: {
                  input: {
                    message: tempMessage
                  }
                }
              });
              
              console.log('📦 Auto-search result:', searchData);
              
              // Handle search results
              if (searchData?.sendMessage) {
                // Store search results
                if (searchData.sendMessage.suggestions && searchData.sendMessage.suggestions.length > 0) {
                  setSearchResults(searchData.sendMessage.suggestions);
                }
                
                const assistantMessage = {
                  id: (Date.now() + 1).toString(),
                  content: searchData.sendMessage.message,
                  role: 'ASSISTANT',
                  timestamp: new Date().toISOString(),
                  suggestions: searchData.sendMessage.suggestions || []
                };
                
                setMessages(prev => [...prev, assistantMessage]);
              }
              
            } catch (error) {
              console.error('❌ Auto-search error:', error);
              
              const errorMessage = {
                id: (Date.now() + 1).toString(),
                content: 'Có lỗi xảy ra khi tự động tìm kiếm. Vui lòng thử lại.',
                role: 'ASSISTANT',
                timestamp: new Date().toISOString()
              };
              
              setMessages(prev => [...prev, errorMessage]);
            } finally {
              setIsLoading(false);
            }
          }, 1500); // Wait 1.5s after image analysis
        } else {
          console.log('❌ No query found in analysis:', data.searchByImage.analysis);
        }
      }
    } catch (error) {
      console.error('❌ Image search error:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Có lỗi xảy ra khi phân tích ảnh. Vui lòng thử lại hoặc mô tả sản phẩm bạn muốn tìm kiếm.',
        role: 'ASSISTANT',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice input
  const handleVoiceInput = async (transcript) => {
    setInputMessage(transcript);
    // Auto send the voice input
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleCompareProducts = async () => {
    if (compareProducts.length < 2) {
      alert('Cần ít nhất 2 sản phẩm để so sánh');
      return;
    }

    setIsComparing(true);
    setComparisonResult(null);

    try {
      const { data } = await compareProductsMutation({
        variables: {
          input: {
            productIds: compareProducts.map(p => p._id)
          }
        }
      });

      setComparisonResult({
        message: `Đã so sánh ${compareProducts.length} sản phẩm thành công. Dưới đây là phân tích chi tiết:`,
        data: data.compareProducts
      });
    } catch (error) {
      console.error('Error comparing products:', error);
      setComparisonResult({
        message: 'Có lỗi xảy ra khi so sánh sản phẩm. Vui lòng thử lại.',
        error: true
      });
    } finally {
      setIsComparing(false);
    }
  };

  const quickMessages = [
    'iPhone dưới 20 triệu',
    'Samsung flagship',
    'Điện thoại gaming',
    'Camera tốt nhất'
  ];

  return (
    <>
      {/* Chat Button - Mobile Responsive */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        <ChatBubbleLeftRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Chat Modal - Mobile Responsive */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-2 sm:p-4 z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg lg:max-w-xl h-[calc(100vh-2rem)] sm:h-[600px] flex flex-col">
            {/* Header - Mobile Responsive */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-t-2xl">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                    <h3 className="font-semibold text-sm sm:text-base">SmartShop AI</h3>
                    <p className="text-xs sm:text-sm opacity-90">Trợ lý tìm kiếm sản phẩm</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              
              {/* Tab Navigation - Mobile Responsive */}
              <div className="flex space-x-1">
                <button
                  onClick={() => handleTabSwitch('search')}
                  className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'search'
                      ? 'bg-white text-blue-600'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Tìm kiếm
                </button>
              <button
                  onClick={() => handleTabSwitch('compare')}
                  className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors relative ${
                    activeTab === 'compare'
                      ? 'bg-white text-blue-600'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  So sánh
                  {compareProducts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                      {compareProducts.length}
                    </span>
                  )}
              </button>
            </div>
          </div>

            {/* Tab Content */}
            {activeTab === 'search' ? (
              <>
                {/* Search Header with Clear Button - Mobile Responsive */}
                {messages.length > 0 && (
                  <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Kết quả tìm kiếm</h4>
                    <button
                      onClick={handleClearSearch}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                    >
                      Xóa tìm kiếm
                    </button>
                  </div>
                )}

                {/* Messages - Mobile Responsive */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                    message.role === 'USER'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                        <p className="text-xs sm:text-sm">{message.content}</p>
                        
                        {/* Display uploaded image */}
                        {message.image && (
                          <div className="mt-2">
                            <img
                              src={message.image}
                              alt="Uploaded"
                              className="max-w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        {/* Product Suggestions - Mobile Responsive */}
                  {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-2 sm:mt-3 space-y-2">
                      <p className="text-xs opacity-80 mb-2">Gợi ý sản phẩm:</p>
                      {message.suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                                className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                              >
                                <div className="flex items-center space-x-2 sm:space-x-3">
                            <img
                              src={getImageUrl(suggestion.product.images?.[0])}
                              alt={suggestion.product.name}
                                    className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg cursor-pointer"
                                    onClick={() => {
                                      console.log('🔗 Navigating to product:', suggestion.product._id);
                                      setIsOpen(false);
                                      navigate(`/products/${suggestion.product._id}`);
                                    }}
                              onError={(e) => {
                                e.target.src = '/placeholder-product.jpg';
                              }}
                            />
                                                         <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate cursor-pointer"
                                       onClick={() => {
                                         setIsOpen(false);
                                         navigate(`/products/${suggestion.product._id}`);
                                       }}>
                                 {suggestion.product.name}
                               </p>
                               <p className="text-xs text-gray-500">
                                 {suggestion.reason}
                               </p>
                               <div className="flex items-center justify-between mt-1">
                                      <p className="text-xs sm:text-sm font-bold text-blue-600">
                                   {formatPrice(suggestion.product.price)}
                                 </p>
                                      <div className="flex items-center space-x-1 sm:space-x-2">
                                 {suggestion.product.isFeatured && (
                                   <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                     Nổi bật
                                   </span>
                                 )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCompare(suggestion.product);
                                          }}
                                          className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded-full transition-colors"
                                        >
                                          + So sánh
                                        </button>
                                      </div>
                               </div>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

                {/* Quick Messages - Mobile Responsive */}
          {messages.length === 1 && (
                  <div className="px-2 sm:px-4 pb-2 sm:pb-3">
              <p className="text-xs text-gray-500 mb-2">Gợi ý nhanh:</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                {quickMessages.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickMessage(msg)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 sm:px-3 sm:py-1 rounded-full transition-colors"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>
          )}
              </>
            ) : (
                          /* Compare Tab Content - Mobile Responsive */
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              {isComparing ? (
                /* Loading State */
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="relative">
                    <ScaleIcon className="h-16 w-16 text-purple-400 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Đang phân tích sản phẩm...
                    </h3>
                    <p className="text-sm text-gray-500">
                      AI đang đọc và so sánh thông tin chi tiết
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              ) : comparisonResult ? (
                                /* Comparison Results */
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-600 mb-3 flex items-center">
                    <ScaleIcon className="h-5 w-5 mr-2" />
                    Kết quả so sánh
                  </h4>
                  <p className="text-sm text-gray-700">{comparisonResult.message}</p>
                </div>
                
                {/* Detailed Comparison Table */}
                <ComparisonTable 
                  products={compareProducts}
                  analysis={comparisonResult.data?.analysis}
                />
                
                <button
                  onClick={() => setComparisonResult(null)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  So sánh lại
                </button>
              </div>
                ) : (
                  /* Compare Products List */
                  <div className="space-y-4">
                    {/* Compare Header with Clear Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <ScaleIcon className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-900 mb-1">So sánh sản phẩm</h3>
                        <p className="text-sm text-gray-500">
                          Chọn tối đa 3 sản phẩm để so sánh
                        </p>
                      </div>
                      {compareProducts.length > 0 && (
                        <button
                          onClick={handleClearComparison}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                        >
                          Xóa so sánh
                        </button>
                      )}
                    </div>

                    {/* Selected Products - Mobile Responsive */}
                    <div className="space-y-2 sm:space-y-3">
                      {compareProducts.map((product) => (
                        <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <img
                              src={getImageUrl(product.images?.[0])}
                              alt={product.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{product.name}</p>
                              <p className="text-xs sm:text-sm text-gray-500">{product.brand?.name}</p>
                              <p className="text-base sm:text-lg font-bold text-blue-600">{formatPrice(product.price)}</p>
                            </div>
                            <button
                              onClick={() => setCompareProducts(prev => prev.filter(p => p._id !== product._id))}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Product Placeholder */}
                    {compareProducts.length < 3 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <p className="text-gray-500 text-sm">
                          Chọn thêm {3 - compareProducts.length} sản phẩm
                        </p>
                        <button
                          onClick={() => setActiveTab('search')}
                          className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Tìm kiếm sản phẩm
                        </button>
                      </div>
                    )}

                                      {/* Compare Button */}
                  {compareProducts.length >= 2 && (
                    <button
                      onClick={() => handleCompareProducts()}
                      disabled={isComparing}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        isComparing
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {isComparing ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang so sánh...</span>
                        </div>
                      ) : (
                        `So sánh ngay (${compareProducts.length} sản phẩm)`
                      )}
                    </button>
                  )}
                  </div>
                )}
              </div>
            )}

            {/* Input - Mobile Responsive */}
            <div className="p-2 sm:p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={() => setShowImageUpload(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isLoading}
                  title="Tìm kiếm bằng ảnh"
                >
                  <PhotoIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setShowVoiceInput(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isLoading}
                  title="Tìm kiếm bằng giọng nói"
                >
                  <MicrophoneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <PaperAirplaneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUpload
          onImageUpload={handleImageUpload}
          onClose={() => setShowImageUpload(false)}
        />
      )}

      {/* Voice Input Modal */}
      {showVoiceInput && (
        <VoiceInput
          onVoiceInput={handleVoiceInput}
          onClose={() => setShowVoiceInput(false)}
        />
      )}
    </>
  );
};

export default ChatWidget; 