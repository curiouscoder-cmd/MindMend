import React, { useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';

const AccessibilitySettings = ({ isOpen, onClose }) => {
  const { settings, updateSetting, announce } = useAccessibility();
  const [activeTab, setActiveTab] = useState('visual');

  const handleSettingChange = (key, value) => {
    updateSetting(key, value);
    announce(`${key} setting changed to ${value}`);
  };

  const resetToDefaults = () => {
    const defaults = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      voiceAnnouncements: true,
      colorBlindFriendly: false,
      fontSize: 'medium',
      theme: 'light'
    };

    Object.entries(defaults).forEach(([key, value]) => {
      updateSetting(key, value);
    });

    announce('Accessibility settings reset to defaults');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-calm-200">
          <div>
            <h1 className="text-2xl font-bold text-calm-800">Accessibility Settings</h1>
            <p className="text-calm-600">Customize your experience for better accessibility</p>
          </div>
          <button
            onClick={onClose}
            className="text-calm-500 hover:text-calm-700 text-2xl"
            aria-label="Close accessibility settings"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-calm-200">
          {[
            { id: 'visual', label: 'Visual', icon: '👁️' },
            { id: 'motor', label: 'Motor', icon: '✋' },
            { id: 'cognitive', label: 'Cognitive', icon: '🧠' },
            { id: 'audio', label: 'Audio', icon: '🔊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50'
                  : 'text-calm-600 hover:text-calm-800 hover:bg-calm-50'
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6" role="tabpanel">
          {activeTab === 'visual' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-calm-800 mb-4">Visual Accessibility</h2>
              
              {/* Theme Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-calm-700">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', preview: 'bg-white border-gray-300' },
                    { value: 'dark', label: 'Dark', preview: 'bg-gray-900 border-gray-700' },
                    { value: 'high-contrast', label: 'High Contrast', preview: 'bg-black border-white' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleSettingChange('theme', theme.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        settings.theme === theme.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-calm-200 hover:border-calm-300'
                      }`}
                      aria-pressed={settings.theme === theme.value}
                    >
                      <div className={`w-full h-8 rounded mb-2 border ${theme.preview}`}></div>
                      <span className="text-sm font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-calm-700">Font Size</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: 'small', label: 'Small', size: 'text-sm' },
                    { value: 'medium', label: 'Medium', size: 'text-base' },
                    { value: 'large', label: 'Large', size: 'text-lg' },
                    { value: 'xl', label: 'Extra Large', size: 'text-xl' }
                  ].map((size) => (
                    <button
                      key={size.value}
                      onClick={() => handleSettingChange('fontSize', size.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.fontSize === size.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-calm-200 hover:border-calm-300'
                      }`}
                      aria-pressed={settings.fontSize === size.value}
                    >
                      <div className={`${size.size} font-medium mb-1`}>Aa</div>
                      <span className="text-xs">{size.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-calm-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-calm-800">High Contrast Mode</h3>
                    <p className="text-sm text-calm-600">Increases contrast for better visibility</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('highContrast', !settings.highContrast)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.highContrast ? 'bg-primary-600' : 'bg-calm-300'
                    }`}
                    role="switch"
                    aria-checked={settings.highContrast}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-calm-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-calm-800">Color Blind Friendly</h3>
                    <p className="text-sm text-calm-600">Adjusts colors for color vision deficiency</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('colorBlindFriendly', !settings.colorBlindFriendly)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.colorBlindFriendly ? 'bg-primary-600' : 'bg-calm-300'
                    }`}
                    role="switch"
                    aria-checked={settings.colorBlindFriendly}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.colorBlindFriendly ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'motor' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-calm-800 mb-4">Motor Accessibility</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-calm-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-calm-800">Keyboard Navigation</h3>
                    <p className="text-sm text-calm-600">Navigate using keyboard shortcuts</p>
                    <p className="text-xs text-calm-500 mt-1">Alt+S: Skip links, Alt+M: Navigation, Alt+C: Content</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('keyboardNavigation', !settings.keyboardNavigation)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.keyboardNavigation ? 'bg-primary-600' : 'bg-calm-300'
                    }`}
                    role="switch"
                    aria-checked={settings.keyboardNavigation}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-calm-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-calm-800">Reduced Motion</h3>
                    <p className="text-sm text-calm-600">Minimizes animations and transitions</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('reducedMotion', !settings.reducedMotion)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.reducedMotion ? 'bg-primary-600' : 'bg-calm-300'
                    }`}
                    role="switch"
                    aria-checked={settings.reducedMotion}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cognitive' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-calm-800 mb-4">Cognitive Accessibility</h2>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">Cognitive Support Features</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Clear, simple language throughout the app</li>
                  <li>• Consistent navigation and layout</li>
                  <li>• Progress indicators for multi-step processes</li>
                  <li>• Option to save progress and return later</li>
                  <li>• Clear error messages with helpful suggestions</li>
                </ul>
              </div>

              <div className="flex items-center justify-between p-4 bg-calm-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-calm-800">Simplified Interface</h3>
                  <p className="text-sm text-calm-600">Reduces visual complexity and distractions</p>
                </div>
                <button
                  onClick={() => handleSettingChange('simplifiedInterface', !settings.simplifiedInterface)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.simplifiedInterface ? 'bg-primary-600' : 'bg-calm-300'
                  }`}
                  role="switch"
                  aria-checked={settings.simplifiedInterface}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.simplifiedInterface ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-calm-800 mb-4">Audio Accessibility</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-calm-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-calm-800">Screen Reader Support</h3>
                    <p className="text-sm text-calm-600">Optimizes for screen reading software</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('screenReader', !settings.screenReader)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.screenReader ? 'bg-primary-600' : 'bg-calm-300'
                    }`}
                    role="switch"
                    aria-checked={settings.screenReader}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.screenReader ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-calm-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-calm-800">Voice Announcements</h3>
                    <p className="text-sm text-calm-600">Announces important updates and changes</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('voiceAnnouncements', !settings.voiceAnnouncements)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.voiceAnnouncements ? 'bg-primary-600' : 'bg-calm-300'
                    }`}
                    role="switch"
                    aria-checked={settings.voiceAnnouncements}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.voiceAnnouncements ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-calm-200 bg-calm-50">
          <button
            onClick={resetToDefaults}
            className="btn-secondary"
          >
            Reset to Defaults
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;
