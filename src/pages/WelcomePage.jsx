import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCompleteProfile } from '../hooks/useGoogleAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const WelcomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { completeProfile, loading } = useCompleteProfile();

  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(\+84|84|0)[0-9]{8,9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (định dạng VN)';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vui lòng nhập họ';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Vui lòng nhập tên';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await completeProfile(formData);
    toast.success('Hoàn thiện thông tin thành công!');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">Chào mừng đến với SmartShop!</h2>
        <p className="text-center text-gray-600 mb-6">Vui lòng hoàn thiện thông tin cá nhân để tiếp tục</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
              placeholder="Nhập số điện thoại"
            />
            {errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
              placeholder="Nhập địa chỉ"
            />
            {errors.address && <div className="text-red-600 text-sm mt-1">{errors.address}</div>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Họ *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                placeholder="Họ"
              />
              {errors.firstName && <div className="text-red-600 text-sm mt-1">{errors.firstName}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tên *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                placeholder="Tên"
              />
              {errors.lastName && <div className="text-red-600 text-sm mt-1">{errors.lastName}</div>}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-2 rounded-xl font-semibold text-white transition-all duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}`}
          >
            {loading ? 'Đang lưu...' : 'Hoàn thiện thông tin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomePage;
