import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { COMPARE_PRODUCTS } from '../../graphql/productComparison.js';
import { 
  XMarkIcon, 
  StarIcon, 
  CheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { formatPrice } from '../../lib/utils';
import { getImageUrl } from '../../utils/imageHelper';

const ProductComparisonModal = ({ isOpen, onClose, selectedProducts, onProductSelect }) => {
  const [compareProducts, { loading, error }] = useMutation(COMPARE_PRODUCTS);
  const [comparisonResult, setComparisonResult] = useState(null);

  const handleCompare = async () => {
    if (selectedProducts.length < 2) return;

    try {
      const { data } = await compareProducts({
        variables: {
          input: {
            productIds: selectedProducts.map(p => p._id)
          }
        }
      });

      setComparisonResult(data.compareProducts);
    } catch (error) {
      console.error('Error comparing products:', error);
    }
  };

  const removeProduct = (productId) => {
    onProductSelect(selectedProducts.filter(p => p._id !== productId));
  };

  const getBestProduct = (category) => {
    if (!comparisonResult?.analysis) return null;
    
    const bestIndex = comparisonResult.analysis[category];
    if (!bestIndex) return null;
    
    const index = parseInt(bestIndex.split('_')[1]);
    return comparisonResult.products[index];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-6 w-6 text-white" />
                <h3 className="text-lg font-semibold text-white">
                  So sánh sản phẩm ({selectedProducts.length}/3)
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {!comparisonResult ? (
              // Product selection view
              <div>
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Sản phẩm đã chọn</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedProducts.map((product) => (
                      <div key={product._id} className="border rounded-lg p-4 relative">
                        <button
                          onClick={() => removeProduct(product._id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                        <img
                          src={getImageUrl(product.images?.[0])}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h5 className="font-semibold text-sm mb-2">{product.name}</h5>
                        <p className="text-lg font-bold text-blue-600 mb-2">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {product.rating || 0}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedProducts.length < 3 && (
                    <div className="mt-4 text-center">
                      <p className="text-gray-600 mb-2">
                        Chọn thêm {3 - selectedProducts.length} sản phẩm để so sánh
                      </p>
                    </div>
                  )}
                </div>

                {selectedProducts.length >= 2 && (
                  <div className="text-center">
                    <button
                      onClick={handleCompare}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      {loading ? 'Đang phân tích...' : 'So sánh sản phẩm'}
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">Lỗi: {error.message}</p>
                  </div>
                )}
              </div>
            ) : (
              // Comparison results view
              <div>
                {/* Products overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {comparisonResult.products.map((product, index) => (
                    <div key={product._id} className="text-center">
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                      <h4 className="font-semibold mb-2">{product.name}</h4>
                      <p className="text-xl font-bold text-blue-600 mb-2">
                        {formatPrice(product.price)}
                      </p>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{product.rating || 0}/5</span>
                      </div>
                      
                      {/* Strengths */}
                      {comparisonResult.analysis.strengths[index] && (
                        <div className="text-left">
                          <p className="text-sm font-semibold text-green-600 mb-1">Điểm mạnh:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {comparisonResult.analysis.strengths[index].strengths.map((strength, i) => (
                              <li key={i} className="flex items-start space-x-1">
                                <CheckIcon className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* AI Analysis */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Phân tích AI
                  </h4>
                  
                  {/* Best in categories */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {['bestValue', 'bestPerformance', 'bestCamera', 'bestBattery'].map((category) => {
                      const bestProduct = getBestProduct(category);
                      if (!bestProduct) return null;
                      
                      const categoryNames = {
                        bestValue: 'Giá trị tốt nhất',
                        bestPerformance: 'Hiệu năng tốt nhất',
                        bestCamera: 'Camera tốt nhất',
                        bestBattery: 'Pin tốt nhất'
                      };
                      
                      return (
                        <div key={category} className="bg-white rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-600 mb-1">{categoryNames[category]}</p>
                          <p className="text-sm font-semibold">{bestProduct.name}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Similarities */}
                  {comparisonResult.analysis.similarities.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-semibold mb-2">Điểm chung:</h5>
                      <div className="flex flex-wrap gap-2">
                        {comparisonResult.analysis.similarities.map((similarity, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {similarity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {comparisonResult.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-semibold mb-2">Khuyến nghị:</h5>
                      <ul className="space-y-2">
                        {comparisonResult.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Detailed differences */}
                {comparisonResult.analysis.differences.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4">So sánh chi tiết</h4>
                    <div className="space-y-4">
                      {comparisonResult.analysis.differences.map((diff, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h5 className="font-semibold mb-3">{diff.category}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[diff.product1, diff.product2, diff.product3].map((product, pIndex) => {
                              if (!product) return null;
                              return (
                                <div key={pIndex} className={`text-center p-3 rounded-lg ${
                                  product.isBest ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'
                                }`}>
                                  <p className="text-sm font-semibold mb-1">{product.productName}</p>
                                  <p className="text-xs text-gray-600">{product.value}</p>
                                  {product.isBest && (
                                    <div className="mt-2">
                                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        Tốt nhất
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              onClick={() => {
                setComparisonResult(null);
                onClose();
              }}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Đóng
            </button>
            
            {comparisonResult && (
              <button
                onClick={() => setComparisonResult(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                So sánh lại
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparisonModal; 