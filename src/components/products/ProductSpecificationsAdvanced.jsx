import React, { useState } from 'react';
import { 
  ComputerDesktopIcon, 
  CpuChipIcon, 
  CircleStackIcon, 
  CameraIcon, 
  BoltIcon, 
  DevicePhoneMobileIcon, 
  SparklesIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ProductSpecificationsAdvanced = ({ specifications }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState(new Set(['manHinh', 'camera']));

  if (!specifications) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-500 text-center">Chưa có thông số kỹ thuật</p>
      </div>
    );
  }

  // Parse JSON nếu là string
  const specs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;

  const toggleSection = (sectionName) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const renderSpecCard = (icon, title, value, color = "blue", size = "md") => (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center space-x-3">
        <div className={`flex-shrink-0 w-${size === "lg" ? "10" : "8"} h-${size === "lg" ? "10" : "8"} bg-${color}-100 rounded-lg flex items-center justify-center`}>
          {React.cloneElement(icon, { className: `w-${size === "lg" ? "5" : "4"} h-${size === "lg" ? "5" : "4"} text-${color}-600` })}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`${size === "lg" ? "text-base" : "text-sm"} font-medium text-gray-900 mb-1`}>{title}</h4>
          <p className={`${size === "lg" ? "text-base" : "text-sm"} text-gray-600`}>{value}</p>
        </div>
      </div>
    </div>
  );

  const renderCameraCard = (camera, type, color) => {
    if (!camera) return null;

    return (
      <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className={`flex-shrink-0 w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
            <CameraIcon className={`w-4 h-4 text-${color}-600`} />
          </div>
          <h5 className="text-sm font-medium text-gray-900">Camera {type}</h5>
        </div>
        <div className="space-y-2">
          {Object.entries(camera).map(([key, value]) => {
            if (!value) return null;
            const label = key === 'doPhanGiai' ? 'Độ phân giải' :
                         key === 'congNghe' ? 'Công nghệ' :
                         key === 'khauDo' ? 'Khẩu độ' :
                         key === 'loai' ? 'Loại' :
                         key === 'zoomQuang' ? 'Zoom quang' : key;
            return (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-600">{label}:</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFeatures = (features) => {
    if (!features || !Array.isArray(features)) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {specs.manHinh?.kichThuoc && renderSpecCard(
          <ComputerDesktopIcon />, "Màn hình", specs.manHinh.kichThuoc, "blue", "lg"
        )}
        {specs.chip && renderSpecCard(
          <CpuChipIcon />, "Chip", specs.chip, "green", "lg"
        )}
        {specs.ram && renderSpecCard(
          <CircleStackIcon />, "RAM", specs.ram, "purple", "lg"
        )}
        {specs.pin && renderSpecCard(
          <BoltIcon />, "Pin", specs.pin.split(',')[0], "yellow", "lg"
        )}
      </div>

      {/* Features */}
      {specs.tinhNang && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-orange-600" />
            <span>Tính năng nổi bật</span>
          </h4>
          {renderFeatures(specs.tinhNang)}
        </div>
      )}
    </div>
  );

  const renderDetailedTab = () => (
    <div className="space-y-6">
      {/* Màn hình */}
      {specs.manHinh && (
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('manHinh')}
            className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ComputerDesktopIcon className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-medium text-gray-900">Màn hình</h4>
            </div>
            <ChevronRightIcon className={`w-5 h-5 text-blue-600 transition-transform ${expandedSections.has('manHinh') ? 'rotate-90' : ''}`} />
          </button>
          
          {expandedSections.has('manHinh') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              {specs.manHinh.kichThuoc && renderSpecCard(<ComputerDesktopIcon />, "Kích thước", specs.manHinh.kichThuoc, "blue")}
              {specs.manHinh.congNghe && renderSpecCard(<ComputerDesktopIcon />, "Công nghệ", specs.manHinh.congNghe, "blue")}
              {specs.manHinh.doPhanGiai && renderSpecCard(<ComputerDesktopIcon />, "Độ phân giải", specs.manHinh.doPhanGiai, "blue")}
              {specs.manHinh.tanSoQuet && renderSpecCard(<ComputerDesktopIcon />, "Tần số quét", specs.manHinh.tanSoQuet, "blue")}
            </div>
          )}
        </div>
      )}

      {/* Camera */}
      {specs.camera && (
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('camera')}
            className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <CameraIcon className="w-5 h-5 text-red-600" />
              <h4 className="text-lg font-medium text-gray-900">Camera</h4>
            </div>
            <ChevronRightIcon className={`w-5 h-5 text-red-600 transition-transform ${expandedSections.has('camera') ? 'rotate-90' : ''}`} />
          </button>
          
          {expandedSections.has('camera') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {renderCameraCard(specs.camera.chinh, "chính", "red")}
              {renderCameraCard(specs.camera.gocRong, "góc rộng", "blue")}
              {renderCameraCard(specs.camera.telephoto, "telephoto", "purple")}
            </div>
          )}
        </div>
      )}

      {/* System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specs.chip && renderSpecCard(<CpuChipIcon />, "Chip xử lý", specs.chip, "green")}
        {specs.ram && renderSpecCard(<CircleStackIcon />, "RAM", specs.ram, "purple")}
        {specs.pin && renderSpecCard(<BoltIcon />, "Pin", specs.pin, "yellow")}
        {specs.heDieuHanh && renderSpecCard(<DevicePhoneMobileIcon />, "Hệ điều hành", specs.heDieuHanh, "indigo")}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: <InformationCircleIcon className="w-4 h-4" /> },
    { id: 'detailed', name: 'Chi tiết', icon: <SparklesIcon className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Thông số kỹ thuật</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'detailed' && renderDetailedTab()}
      </div>
    </div>
  );
};

export default ProductSpecificationsAdvanced; 