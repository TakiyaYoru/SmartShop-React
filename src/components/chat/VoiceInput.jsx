import React, { useState, useEffect } from 'react';
import { 
  MicrophoneIcon, 
  StopIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const VoiceInput = ({ onVoiceInput, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Check if browser supports speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (!recognition) {
      setError('Trình duyệt không hỗ trợ voice recognition');
      return;
    }

    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'vi-VN'; // Vietnamese

    // Handle results
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    // Handle errors
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Lỗi: ${event.error}`);
      setIsListening(false);
    };

    // Handle end
    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  // Start listening
  const startListening = () => {
    if (!recognition) return;
    
    setError('');
    setTranscript('');
    setIsListening(true);
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('Không thể bắt đầu ghi âm');
      setIsListening(false);
    }
  };

  // Stop listening
  const stopListening = () => {
    if (!recognition) return;
    
    setIsListening(false);
    recognition.stop();
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    try {
      await onVoiceInput(transcript);
      onClose();
    } catch (error) {
      console.error('Voice input failed:', error);
      setError('Có lỗi xảy ra khi xử lý');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (isListening) {
      stopListening();
    }
    onClose();
  };

  if (!recognition) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XMarkIcon className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không hỗ trợ
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Trình duyệt của bạn không hỗ trợ voice recognition.
              Vui lòng sử dụng Chrome, Edge hoặc Safari.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tìm kiếm bằng giọng nói</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Voice Recording Area */}
        <div className="text-center space-y-4">
          {/* Recording Button */}
          <div className="relative">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isListening ? (
                <StopIcon className="h-8 w-8 text-white" />
              ) : (
                <MicrophoneIcon className="h-8 w-8 text-white" />
              )}
            </button>
            
            {/* Recording Indicator */}
            {isListening && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
            )}
          </div>

          {/* Status Text */}
          <div>
            {isListening ? (
              <p className="text-sm text-red-600 font-medium">
                Đang ghi âm... Hãy nói rõ ràng
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Nhấn nút để bắt đầu ghi âm
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Transcript */}
          {transcript && (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 font-medium mb-1">Bạn đã nói:</p>
                <p className="text-sm text-gray-900">{transcript}</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setTranscript('')}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Xóa
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || !transcript.trim()}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    'Tìm kiếm'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Hướng dẫn:</strong> Nói rõ ràng về sản phẩm bạn muốn tìm, 
            ví dụ: "Tìm iPhone 15", "Điện thoại Samsung giá rẻ", "Laptop gaming"
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput; 