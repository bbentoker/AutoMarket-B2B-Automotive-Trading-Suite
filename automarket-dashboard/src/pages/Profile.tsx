import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  Edit3,
  Camera,
  Shield,
  Bell,
  Save,
  Eye,
  EyeOff,
  Car,
  ShoppingCart,
  Heart,
  Settings,
  CheckCircle,
  Clock,
  Euro,
  AlertCircle
} from 'lucide-react';
import ModernDropdown from '../components/ModernDropdown';
import apiService from '../utils/api';

// Interface for purchased car data
interface PurchasedCar {
  id: number;
  listing_price: string;
  amount_sold_for?: string;
  brand_name: string;
  model: string;
}

// Interface for API profile data
interface ApiProfileData {
  cars_purchased: number;
  purchased_cars: PurchasedCar[];
  cars_sold: number;
  active_offers: number;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  website?: string | null;
  vat_number?: string | null;
  language: string;
}

// Interface for profile update data
interface ProfileUpdateData {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  website?: string;
  vat_number?: string;
}

// Interface for password change data
interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

// Interface for API response
interface ApiResponse {
  data: ApiProfileData;
  message?: string;
}

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Europe/Berlin');
  const [profileData, setProfileData] = useState<ApiProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    website: '',
    vat_number: ''
  });
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    current_password: '',
    new_password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getDashboardProfile() as ApiResponse;
        
        if (response.data) {
          setProfileData(response.data);
          console.log(response.data);
          setLanguage(response.data.language || 'en');
          
          // Initialize form data with API data
          setFormData({
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone,
            company_name: response.data.company_name,
            website: response.data.website || '',
            vat_number: response.data.vat_number || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Calculate total value from purchased cars
  const getTotalValue = () => {
    if (!profileData?.purchased_cars) return 0;
    return profileData.purchased_cars.reduce((sum, car) => {
      const price = car.amount_sold_for || car.listing_price;
      return sum + parseFloat(price || '0');
    }, 0);
  };

  const quickStats = [
    { 
      label: "Cars Purchased", 
      value: profileData?.cars_purchased?.toString() || "0", 
      icon: <ShoppingCart className="w-4 h-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    { 
      label: "Cars Sold", 
      value: profileData?.cars_sold?.toString() || "0", 
      icon: <Car className="w-4 h-4" />,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    { 
      label: "Active Offers", 
      value: profileData?.active_offers?.toString() || "0", 
      icon: <Heart className="w-4 h-4" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    { 
      label: "Total Value", 
      value: `€${getTotalValue().toLocaleString()}`, 
      icon: <Euro className="w-4 h-4" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const tabs = [
    { id: 'personal', label: 'Edit Profile', icon: <Edit3 className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" /> }
  ];

  const languageOptions = [
    { value: 'en', label: 'English', icon: <span className="text-sm">🇺🇸</span> },
    { value: 'de', label: 'Deutsch', icon: <span className="text-sm">🇩🇪</span> },
    { value: 'fr', label: 'Français', icon: <span className="text-sm">🇫🇷</span> },
    { value: 'it', label: 'Italiano', icon: <span className="text-sm">🇮🇹</span> },
    { value: 'es', label: 'Español', icon: <span className="text-sm">🇪🇸</span> },
    { value: 'tr', label: 'Türkçe', icon: <span className="text-sm">🇹🇷</span> }
  ];

  const timezoneOptions = [
    { value: 'Europe/Berlin', label: 'Europe/Berlin (CET)', icon: <Clock className="w-4 h-4 text-gray-500" /> },
    { value: 'Europe/London', label: 'Europe/London (GMT)', icon: <Clock className="w-4 h-4 text-gray-500" /> },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET)', icon: <Clock className="w-4 h-4 text-gray-500" /> },
    { value: 'Europe/Rome', label: 'Europe/Rome (CET)', icon: <Clock className="w-4 h-4 text-gray-500" /> },
    { value: 'Europe/Madrid', label: 'Europe/Madrid (CET)', icon: <Clock className="w-4 h-4 text-gray-500" /> },
    { value: 'Europe/Istanbul', label: 'Europe/Istanbul (TRT)', icon: <Clock className="w-4 h-4 text-gray-500" /> }
  ];

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const response = await apiService.updateDashboardProfile(formData);
      
      if (response) {
        // Update the profile data with the new values
        setProfileData(prev => prev ? {
          ...prev,
          ...formData
        } : null);
        
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    // Validation
    if (!passwordData.current_password) {
      alert('Please enter your current password');
      return;
    }
    
    if (!passwordData.new_password) {
      alert('Please enter a new password');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }
    
    if (passwordData.new_password !== confirmPassword) {
      alert('New password and confirmation do not match');
      return;
    }

    try {
      setChangingPassword(true);
      
      const response = await apiService.changeDashboardPassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      if (response) {
        // Clear form
        setPasswordData({
          current_password: '',
          new_password: ''
        });
        setConfirmPassword('');
        alert('Password successfully updated!');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      alert('Failed to update password. Please check your current password and try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSavePreferences = () => {
    alert('Preferences successfully saved!');
  };

  // Loading state
  if (loading) {
    return (
      <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
        <div className="p-4 lg:p-8">
          <div className="bg-white rounded-2xl p-8 lg:p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Clock className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400" />
            </div>
            <h3 className="text-base lg:text-lg font-medium text-primary-950 mb-2">Loading profile...</h3>
            <p className="text-sm text-gray-400">Please wait while we fetch your data.</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !profileData) {
    return (
      <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
        <div className="p-4 lg:p-8">
          <div className="bg-white rounded-2xl p-8 lg:p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 lg:w-12 lg:h-12 text-red-600" />
            </div>
            <h3 className="text-base lg:text-lg font-medium text-primary-950 mb-2">Error loading profile</h3>
            <p className="text-sm text-gray-400 mb-6">{error || 'Failed to load profile data'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary-950 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
      <div className="p-4 lg:p-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-14 bg-primary-950 rounded-full"></div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-primary-950">Profile</h1>
              <p className="text-gray-400">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Enhanced Profile Header Card with Integrated Stats */}
        <div className="bg-gradient-to-r from-primary-950 to-primary-800 rounded-3xl p-6 lg:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col space-y-6">
              {/* Profile Info Section */}
              <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0">
                {/* Profile Info - Centered on mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 flex-1">
                  <div className="relative mx-auto sm:mx-0">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center">
                      <User size={32} className="text-white" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                      <Camera className="w-4 h-4 text-primary-950" />
                    </button>
                  </div>
                  
                  <div className="text-white text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h2 className="text-xl lg:text-2xl font-bold">{profileData.name}</h2>
                      <div className="flex items-center justify-center sm:justify-start space-x-1 px-3 py-1 bg-white/20 rounded-full mx-auto sm:mx-0 w-fit">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    </div>
                    <p className="text-white/80 mb-1">{profileData.email}</p>
                    <p className="text-white/70 mb-3">{profileData.company_name}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-white/70">
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{profileData.phone}</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Member since 2023</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integrated Stats Section */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <div className="text-white">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg lg:text-xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-white/70 truncate">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute right-0 top-0 w-64 h-64 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
          {/* Tabs - Fixed for mobile to show all 4 tabs */}
          <div className="border-b border-gray-100">
            <nav className="grid grid-cols-4 lg:flex lg:space-x-8 lg:px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-1 lg:space-y-0 lg:space-x-2 py-3 lg:py-4 px-2 border-b-2 font-medium text-xs lg:text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-950 text-primary-950'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span className="text-center lg:text-left">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary-950">Edit Profile Information</h3>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-950 text-white rounded-lg hover:bg-primary-900 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">VAT Number</label>
                    <input
                      type="text"
                      value={formData.vat_number || ''}
                      onChange={(e) => setFormData({...formData, vat_number: e.target.value})}
                      placeholder="Enter VAT number"
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      disabled={!isEditing}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex items-center space-x-4 pt-6 border-t border-gray-100">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center space-x-2 px-6 py-3 bg-primary-950 text-white rounded-xl hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary-950">Security Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                        placeholder="Enter your current password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      placeholder="Enter new password (min. 6 characters)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button 
                    onClick={handleSavePassword}
                    disabled={changingPassword}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-950 text-white rounded-xl hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
                  </button>
                  
                  
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary-950">Notification Preferences</h3>
                
                <div className="space-y-4">
                  {[
                    { 
                      label: "New car listings matching your preferences", 
                      description: "Get notified when cars matching your saved searches become available",
                      defaultChecked: true
                    },
                    { 
                      label: "Price drop alerts for saved cars", 
                      description: "Receive notifications when saved cars drop in price",
                      defaultChecked: true
                    },
                    { 
                      label: "Offer status updates", 
                      description: "Get notified about responses to your offers and counter-offers",
                      defaultChecked: true
                    },
                    { 
                      label: "Payment reminders", 
                      description: "Receive reminders for pending payments and due dates",
                      defaultChecked: true
                    },
                    { 
                      label: "Weekly market insights", 
                      description: "Get weekly reports about market trends and popular vehicles",
                      defaultChecked: true
                    },
                    { 
                      label: "Promotional offers and deals", 
                      description: "Receive information about special promotions and exclusive deals",
                      defaultChecked: true
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={item.defaultChecked}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-950"></div>
                      </label>
                      <div className="flex-1">
                        <label className="font-medium text-primary-950 cursor-pointer">{item.label}</label>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary-950">Account Preferences</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ModernDropdown
                    label="Language"
                    options={languageOptions}
                    value={language}
                    onChange={setLanguage}
                    placeholder="Select language"
                  />
                  
                  <ModernDropdown
                    label="Timezone"
                    options={timezoneOptions}
                    value={timezone}
                    onChange={setTimezone}
                    placeholder="Select timezone"
                  />
                </div>
                
                <button 
                  onClick={handleSavePreferences}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary-950 text-white rounded-xl hover:bg-primary-900 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;