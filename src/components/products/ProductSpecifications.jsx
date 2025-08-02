import React from 'react';
import { 
  ComputerDesktopIcon, 
  CpuChipIcon, 
  CircleStackIcon, 
  CameraIcon, 
  BoltIcon, 
  DevicePhoneMobileIcon, 
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ProductSpecifications = ({ specifications }) => {
  if (!specifications) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-500 text-center">Chưa có thông số kỹ thuật</p>
      </div>
    );
  }

  // Parse JSON nếu là string
  const specs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;

  const renderSpecItem = (icon, title, value, className = "") => (
    <div className={`flex items-start space-x-3 p-4 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{value}</p>
      </div>
    </div>
  );

  const renderCameraSection = (camera) => {
    if (!camera) return null;

    return (
      <div className="space-y-3">
        {camera.chinh && (
          <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
              <CameraIcon className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-medium text-gray-900 mb-1">Camera chính</h5>
              <div className="text-sm text-gray-600 space-y-1">
                {camera.chinh.doPhanGiai && <p>Độ phân giải: {camera.chinh.doPhanGiai}</p>}
                {camera.chinh.congNghe && <p>Công nghệ: {camera.chinh.congNghe}</p>}
                {camera.chinh.khauDo && <p>Khẩu độ: {camera.chinh.khauDo}</p>}
              </div>
            </div>
          </div>
        )}
        
        {camera.gocRong && (
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <CameraIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-medium text-gray-900 mb-1">Camera góc rộng</h5>
              <div className="text-sm text-gray-600 space-y-1">
                {camera.gocRong.doPhanGiai && <p>Độ phân giải: {camera.gocRong.doPhanGiai}</p>}
                {camera.gocRong.loai && <p>Loại: {camera.gocRong.loai}</p>}
                {camera.gocRong.khauDo && <p>Khẩu độ: {camera.gocRong.khauDo}</p>}
              </div>
            </div>
          </div>
        )}
        
        {camera.telephoto && (
          <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
              <CameraIcon className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-medium text-gray-900 mb-1">Camera telephoto</h5>
              <div className="text-sm text-gray-600 space-y-1">
                {camera.telephoto.doPhanGiai && <p>Độ phân giải: {camera.telephoto.doPhanGiai}</p>}
                {camera.telephoto.zoomQuang && <p>Zoom quang: {camera.telephoto.zoomQuang}</p>}
                {camera.telephoto.khauDo && <p>Khẩu độ: {camera.telephoto.khauDo}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFeatures = (features) => {
    if (!features || !Array.isArray(features)) return null;

    return (
      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2">
            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Thông số kỹ thuật</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Màn hình */}
        {specs.manHinh && (
          <div className="space-y-3">
            <h4 className="text-md font-medium text-gray-900 flex items-center space-x-2">
              <ComputerDesktopIcon className="w-5 h-5 text-blue-600" />
              <span>Màn hình</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {specs.manHinh.kichThuoc && renderSpecItem(
                <ComputerDesktopIcon className="w-4 h-4 text-blue-600" />,
                "Kích thước",
                specs.manHinh.kichThuoc
              )}
              {specs.manHinh.congNghe && renderSpecItem(
                <ComputerDesktopIcon className="w-4 h-4 text-blue-600" />,
                "Công nghệ",
                specs.manHinh.congNghe
              )}
              {specs.manHinh.doPhanGiai && renderSpecItem(
                <ComputerDesktopIcon className="w-4 h-4 text-blue-600" />,
                "Độ phân giải",
                specs.manHinh.doPhanGiai
              )}
              {specs.manHinh.tanSoQuet && renderSpecItem(
                <ComputerDesktopIcon className="w-4 h-4 text-blue-600" />,
                "Tần số quét",
                specs.manHinh.tanSoQuet
              )}
            </div>
          </div>
        )}

        {/* Chip & RAM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specs.chip && renderSpecItem(
            <CpuChipIcon className="w-4 h-4 text-green-600" />,
            "Chip xử lý",
            specs.chip
          )}
          {specs.ram && renderSpecItem(
            <CircleStackIcon className="w-4 h-4 text-purple-600" />,
            "RAM",
            specs.ram
          )}
        </div>

        {/* Camera */}
        {specs.camera && (
          <div className="space-y-3">
            <h4 className="text-md font-medium text-gray-900 flex items-center space-x-2">
              <CameraIcon className="w-5 h-5 text-red-600" />
              <span>Camera</span>
            </h4>
            {renderCameraSection(specs.camera)}
          </div>
        )}

        {/* Pin & Hệ điều hành */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specs.pin && renderSpecItem(
            <BoltIcon className="w-4 h-4 text-yellow-600" />,
            "Pin",
            specs.pin
          )}
          {specs.heDieuHanh && renderSpecItem(
            <DevicePhoneMobileIcon className="w-4 h-4 text-indigo-600" />,
            "Hệ điều hành",
            specs.heDieuHanh
          )}
        </div>

        {/* Tính năng */}
        {specs.tinhNang && (
          <div className="space-y-3">
            <h4 className="text-md font-medium text-gray-900 flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-orange-600" />
              <span>Tính năng nổi bật</span>
            </h4>
            <div className="bg-orange-50 rounded-lg p-4">
              {renderFeatures(specs.tinhNang)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSpecifications; 