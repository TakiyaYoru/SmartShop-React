import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { SEND_MESSAGE } from '../../graphql/chat.js';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { formatPrice } from '../../lib/utils';
import { getImageUrl } from '../../utils/imageHelper';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const [sendMessage] = useMutation(SEND_MESSAGE);

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
      setMessages([
        {
          id: 'welcome',
          content: 'Xin chào! Tôi là trợ lý AI của SmartShop. Tôi có thể giúp bạn tìm kiếm điện thoại phù hợp. Hãy cho tôi biết bạn đang tìm kiếm gì nhé!',
          role: 'ASSISTANT',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'USER',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🔍 Sending message to backend:', inputMessage);
      
      const { data } = await sendMessage({
        variables: {
          input: {
            message: inputMessage
          }
        }
      });

      console.log('📦 Received data from backend:', data);
      console.log('💬 Response message:', data.sendMessage.message);
      console.log('🎯 Suggestions count:', data.sendMessage.suggestions?.length);
      console.log('📊 Analysis:', data.sendMessage.analysis);

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

  const quickMessages = [
    "iPhone dưới 20 triệu",
    "Samsung chụp ảnh đẹp",
    "Điện thoại cho học sinh",
    "Gaming phone tầm trung"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Open chat"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">SmartShop AI</h3>
                  <p className="text-sm opacity-90">Trợ lý tìm kiếm sản phẩm</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'USER'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Product Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs opacity-80 mb-2">Gợi ý sản phẩm:</p>
                      {message.suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                          onClick={() => {
                            console.log('🔗 Navigating to product:', suggestion.product._id);
                            setIsOpen(false); // Close chat widget
                            navigate(`/products/${suggestion.product._id}`);
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={getImageUrl(suggestion.product.images?.[0])}
                              alt={suggestion.product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = '/placeholder-product.jpg';
                              }}
                            />
                                                         <div className="flex-1 min-w-0">
                               <p className="text-sm font-semibold text-gray-900 truncate">
                                 {suggestion.product.name}
                               </p>
                               <p className="text-xs text-gray-500">
                                 {suggestion.reason}
                               </p>
                               <div className="flex items-center justify-between mt-1">
                                 <p className="text-sm font-bold text-blue-600">
                                   {formatPrice(suggestion.product.price)}
                                 </p>
                                 {suggestion.product.isFeatured && (
                                   <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                     Nổi bật
                                   </span>
                                 )}
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

          {/* Quick Messages */}
          {messages.length === 1 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-500 mb-2">Gợi ý nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {quickMessages.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickMessage(msg)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => {/* TODO: Voice input */}}
                >
                  <MicrophoneIcon className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-2xl transition-colors"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget; 