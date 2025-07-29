import React from 'react';
import { formatPrice } from '../../lib/utils';
import { getImageUrl } from '../../utils/imageHelper';
import { 
  CurrencyDollarIcon,
  StarIcon,
  DevicePhoneMobileIcon,
  Battery100Icon,
  CameraIcon,
  CpuChipIcon,
  CheckIcon,
  XMarkIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const ComparisonTable = ({ products, analysis }) => {
  if (!products || products.length < 2) return null;

  // Các tiêu chí so sánh
  const criteria = [
    {
      key: 'price',
      label: 'Giá',
      icon: CurrencyDollarIcon,
      format: (value) => formatPrice(value),
      unit: 'VND'
    },
    {
      key: 'screen',
      label: 'Màn hình',
      icon: DevicePhoneMobileIcon,
      format: (value) => value,
      unit: 'inch'
    },
    {
      key: 'ram',
      label: 'RAM',
      icon: ComputerDesktopIcon,
      format: (value) => value,
      unit: ''
    },
    {
      key: 'battery',
      label: 'Pin',
      icon: Battery100Icon,
      format: (value) => value,
      unit: 'mAh'
    },
    {
      key: 'camera',
      label: 'Camera',
      icon: CameraIcon,
      format: (value) => value,
      unit: 'MP'
    },
    {
      key: 'performance',
      label: 'Chip',
      icon: CpuChipIcon,
      format: (value) => value,
      unit: ''
    }
  ];

  // Trích xuất thông tin từ JSON description hoặc AI analysis
  const extractProductInfo = (product, index) => {
    const info = {
      price: product.price,
      screen: '6.7"', // Default fallback
      ram: '8GB', // Default fallback
      battery: '4500mAh', // Default fallback
      camera: '48MP', // Default fallback
      performance: 'A18 Pro' // Default fallback
    };

    // Ưu tiên parse từ JSON description
    if (product.description) {
      try {
        const description = typeof product.description === 'string' 
          ? JSON.parse(product.description) 
          : product.description;
        
        // Parse từ JSON structure
        if (description.manHinh?.kichThuoc) {
          info.screen = description.manHinh.kichThuoc;
        }
        if (description.ram) {
          info.ram = description.ram;
        }
        if (description.pin) {
          info.battery = description.pin;
        }
        if (description.camera?.chinh?.doPhanGiai) {
          info.camera = description.camera.chinh.doPhanGiai;
        }
        if (description.chip) {
          info.performance = description.chip;
        }
      } catch (error) {
        console.log('Error parsing description JSON:', error);
      }
    }

    // Fallback: Sử dụng AI specs nếu có
    if (analysis && analysis.productSpecs) {
      const specs = analysis.productSpecs[`index_${index}`];
      if (specs) {
        info.screen = specs.screen || info.screen;
        info.ram = specs.ram || info.ram;
        info.battery = specs.battery || info.battery;
        info.camera = specs.camera || info.camera;
        info.performance = specs.performance || info.performance;
      }
    }

    return info;
  };

  const productInfos = products.map((product, index) => extractProductInfo(product, index));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Bảng so sánh chi tiết
        </h3>
        <p className="text-sm text-gray-600">
          So sánh {products.length} sản phẩm theo các tiêu chí chính
        </p>
      </div>

      {/* Product Images Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {products.map((product, index) => (
          <div key={product._id} className="text-center">
            <img
              src={getImageUrl(product.images?.[0])}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
            />
            <p className="text-sm font-medium text-gray-900 truncate">
              {product.name}
            </p>
            <p className="text-xs text-gray-500">{product.brand?.name}</p>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiêu chí
                </th>
                {products.map((product, index) => (
                  <th key={product._id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {product.name.split(' ')[0]} {/* Lấy tên đầu tiên */}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {criteria.map((criterion) => {
                const Icon = criterion.icon;
                
                return (
                  <tr key={criterion.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {criterion.label}
                        </span>
                      </div>
                    </td>
                    {productInfos.map((info, index) => {
                      const value = info[criterion.key];
                      let isBest = false;
                      
                      // Logic so sánh thông minh cho từng tiêu chí
                      if (criterion.key === 'price') {
                        // Giá thấp hơn = tốt hơn
                        const prices = productInfos.map(p => p.price).filter(p => p !== undefined);
                        isBest = value === Math.min(...prices);
                      } else if (criterion.key === 'screen') {
                        // Màn hình lớn hơn = tốt hơn
                        const screens = productInfos.map(p => parseFloat(p.screen)).filter(s => !isNaN(s));
                        isBest = parseFloat(value) === Math.max(...screens);
                      } else if (criterion.key === 'ram') {
                        // RAM lớn hơn = tốt hơn
                        const rams = productInfos.map(p => parseInt(p.ram)).filter(r => !isNaN(r));
                        isBest = parseInt(value) === Math.max(...rams);
                      } else if (criterion.key === 'battery') {
                        // Pin lớn hơn = tốt hơn
                        const batteries = productInfos.map(p => parseInt(p.battery)).filter(b => !isNaN(b));
                        isBest = parseInt(value) === Math.max(...batteries);
                      } else if (criterion.key === 'camera') {
                        // Camera MP cao hơn = tốt hơn
                        const cameras = productInfos.map(p => parseInt(p.camera)).filter(c => !isNaN(c));
                        isBest = parseInt(value) === Math.max(...cameras);
                      }
                      
                      return (
                        <td key={index} className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <span className={`text-sm font-medium ${
                              isBest ? 'text-green-600' : 'text-gray-900'
                            }`}>
                              {criterion.format ? criterion.format(value) : value}
                              {criterion.unit && <span className="text-xs text-gray-500 ml-1">{criterion.unit}</span>}
                            </span>
                            {isBest && (
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Analysis Summary */}
      {analysis && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
            Phân tích AI
          </h4>
          
          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Điểm mạnh:</h5>
              <div className="space-y-1">
                {analysis.strengths.map((strength, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <span className="font-medium">{strength.productName}:</span> {strength.strengths.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Choices */}
          <div className="grid grid-cols-1 gap-2 text-sm">
            {analysis.bestValue && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">💰 Giá tốt nhất:</span>
                <span className="font-medium text-green-600">{analysis.bestValue}</span>
              </div>
            )}
            {analysis.bestPerformance && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">⚡ Hiệu năng tốt nhất:</span>
                <span className="font-medium text-blue-600">{analysis.bestPerformance}</span>
              </div>
            )}
            {analysis.bestCamera && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">📷 Camera tốt nhất:</span>
                <span className="font-medium text-purple-600">{analysis.bestCamera}</span>
              </div>
            )}
            {analysis.bestBattery && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">🔋 Pin tốt nhất:</span>
                <span className="font-medium text-orange-600">{analysis.bestBattery}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis && analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 Khuyến nghị</h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-yellow-700">
                • {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComparisonTable; 