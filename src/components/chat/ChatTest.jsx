import React from 'react';
import ChatWidget from './ChatWidget';

const ChatTest = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Chat Widget Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Hướng dẫn test:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Nhìn vào góc phải dưới màn hình</li>
            <li>Click vào nút chat (icon chat bubble)</li>
            <li>Thử gửi tin nhắn: "iPhone dưới 20 triệu"</li>
            <li>Kiểm tra xem có nhận được response không</li>
          </ol>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Test Cases:</h3>
            <ul className="space-y-1 text-blue-800">
              <li>• "iPhone dưới 20 triệu"</li>
              <li>• "Samsung chụp ảnh đẹp"</li>
              <li>• "Điện thoại cho học sinh"</li>
              <li>• "Gaming phone tầm trung"</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Chat Widget sẽ hiển thị ở góc phải dưới */}
    </div>
  );
};

export default ChatTest; 