import React, { useState } from 'react';
import ProductSpecifications from './ProductSpecifications';
import ProductSpecificationsAdvanced from './ProductSpecificationsAdvanced';

const ProductSpecificationsDemo = () => {
  const [selectedVersion, setSelectedVersion] = useState('advanced');
  
  // Data mẫu từ user
  const sampleSpecs = {
    "manHinh": {
      "kichThuoc": "6.6 inches",
      "congNghe": "Super AMOLED",
      "doPhanGiai": "1080 x 2340 pixels (FullHD+)",
      "tanSoQuet": "120Hz"
    },
    "chip": "Exynos 1380",
    "ram": "8 GB",
    "camera": {
      "chinh": {
        "doPhanGiai": "50 MP",
        "congNghe": "OIS+HDR",
        "khauDo": ""
      },
      "gocRong": {
        "doPhanGiai": "8MP",
        "loai": "Góc siêu rộng",
        "khauDo": "f/2.2"
      },
      "telephoto": {
        "doPhanGiai": "",
        "zoomQuang": "10x",
        "khauDo": ""
      }
    },
    "pin": "5000 mAh, sạc nhanh 25W",
    "heDieuHanh": "Android 14",
    "tinhNang": [
      "Kháng nước, bụi IP67",
      "Cảm biến vân tay trong màn hình",
      "Hỗ trợ 5G",
      "Sạc nhanh 25W",
      "Màn hình 120Hz"
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Demo: Thông số kỹ thuật sản phẩm</h1>
        <p className="text-gray-600">Component hiển thị thông số kỹ thuật với UI đẹp và responsive</p>
      </div>

      {/* Version Selector */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedVersion('basic')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedVersion === 'basic'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Basic Version
          </button>
          <button
            onClick={() => setSelectedVersion('advanced')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedVersion === 'advanced'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Advanced Version
          </button>
        </div>
      </div>
      
      {selectedVersion === 'basic' ? (
        <ProductSpecifications specifications={sampleSpecs} />
      ) : (
        <ProductSpecificationsAdvanced specifications={sampleSpecs} />
      )}
      
      {/* JSON Data Display */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Raw JSON Data:</h3>
        <pre className="text-sm text-gray-700 bg-white p-4 rounded border overflow-x-auto">
          {JSON.stringify(sampleSpecs, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ProductSpecificationsDemo; 