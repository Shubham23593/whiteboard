import React from 'react';
import { X, Palette, Type, Sliders } from 'lucide-react';
import { SketchPicker } from 'react-color';
import { useApp } from '../context/AppContext';
import { THEMES, STROKE_STYLES } from '../types/canvas';

const StylingPanel = () => {
  const { state, actions } = useApp();
  const { showStylingPanel, currentStyle, theme, selectedElementIds } = state;

  if (!showStylingPanel) return null;

  const handleStyleChange = (property, value) => {
    actions.setCurrentStyle({ [property]: value });
    
    // Update selected elements with new style
    if (selectedElementIds.length > 0) {
      selectedElementIds.forEach(id => {
        actions.updateElement(id, { [property]: value });
      });
    }
  };

  const panelBg = theme === THEMES.DARK ? 'bg-gray-900' : 'bg-white';
  const borderColor = theme === THEMES.DARK ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === THEMES.DARK ? 'text-gray-200' : 'text-gray-800';
  const inputBg = theme === THEMES.DARK ? 'bg-gray-800' : 'bg-gray-50';

  return (
    <div className={`fixed top-0 right-0 h-full w-80 ${panelBg} ${borderColor} border-l shadow-xl z-40 overflow-y-auto`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-semibold ${textColor}`}>Styling</h2>
          <button
            onClick={actions.toggleStylingPanel}
            className={`p-2 rounded-lg hover:bg-gray-100 ${theme === THEMES.DARK ? 'hover:bg-gray-800' : ''}`}
          >
            <X size={20} className={textColor} />
          </button>
        </div>

        {/* Colors Section */}
        <div className="mb-6">
          <h3 className={`text-sm font-medium ${textColor} mb-3 flex items-center gap-2`}>
            <Palette size={16} />
            Colors
          </h3>
          
          {/* Stroke Color */}
          <div className="mb-4">
            <label className={`block text-sm ${textColor} mb-2`}>Stroke Color</label>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: currentStyle.strokeColor }}
                onClick={() => {
                  // Toggle color picker (simplified)
                }}
              />
              <input
                type="color"
                value={currentStyle.strokeColor}
                onChange={(e) => handleStyleChange('strokeColor', e.target.value)}
                className="w-full h-8"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="mb-4">
            <label className={`block text-sm ${textColor} mb-2`}>Background Color</label>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                style={{ 
                  backgroundColor: currentStyle.backgroundColor === 'transparent' 
                    ? 'transparent' 
                    : currentStyle.backgroundColor,
                  backgroundImage: currentStyle.backgroundColor === 'transparent' 
                    ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                    : 'none',
                  backgroundSize: currentStyle.backgroundColor === 'transparent' ? '8px 8px' : 'auto',
                  backgroundPosition: currentStyle.backgroundColor === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'auto'
                }}
              />
              <input
                type="color"
                value={currentStyle.backgroundColor === 'transparent' ? '#ffffff' : currentStyle.backgroundColor}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="flex-1 h-8"
              />
              <button
                onClick={() => handleStyleChange('backgroundColor', 'transparent')}
                className={`px-2 py-1 text-xs rounded ${
                  currentStyle.backgroundColor === 'transparent' 
                    ? 'bg-blue-500 text-white' 
                    : `${inputBg} ${textColor}`
                }`}
              >
                None
              </button>
            </div>
          </div>
        </div>

        {/* Stroke Properties */}
        <div className="mb-6">
          <h3 className={`text-sm font-medium ${textColor} mb-3 flex items-center gap-2`}>
            <Sliders size={16} />
            Stroke
          </h3>

          {/* Stroke Width */}
          <div className="mb-4">
            <label className={`block text-sm ${textColor} mb-2`}>Width: {currentStyle.strokeWidth}px</label>
            <input
              type="range"
              min="1"
              max="20"
              value={currentStyle.strokeWidth}
              onChange={(e) => handleStyleChange('strokeWidth', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Stroke Style */}
          <div className="mb-4">
            <label className={`block text-sm ${textColor} mb-2`}>Style</label>
            <div className="flex gap-2">
              {Object.values(STROKE_STYLES).map(style => (
                <button
                  key={style}
                  onClick={() => handleStyleChange('strokeStyle', style)}
                  className={`flex-1 py-2 px-3 text-xs rounded border ${
                    currentStyle.strokeStyle === style
                      ? 'bg-blue-500 text-white border-blue-500'
                      : `${inputBg} ${textColor} ${borderColor}`
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Roughness */}
          <div className="mb-4">
            <label className={`block text-sm ${textColor} mb-2`}>Roughness: {currentStyle.roughness}</label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={currentStyle.roughness}
              onChange={(e) => handleStyleChange('roughness', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Opacity */}
          <div className="mb-4">
            <label className={`block text-sm ${textColor} mb-2`}>Opacity: {currentStyle.opacity}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={currentStyle.opacity}
              onChange={(e) => handleStyleChange('opacity', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Text Properties */}
        <div className="mb-6">
          <h3 className={`text-sm font-medium ${textColor} mb-3 flex items-center gap-2`}>
            <Type size={16} />
            Text
          </h3>

          {/* Font Size */}
          <div className="mb-4">
            <label className={`block text-sm ${textColor} mb-2`}>Font Size: {currentStyle.fontSize}px</label>
            <input
              type="range"
              min="8"
              max="72"
              value={currentStyle.fontSize}
              onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Font Family */}
          <div className="mb-4">
            <label className={`block text-sm ${textColor} mb-2`}>Font Family</label>
            <select
              value={currentStyle.fontFamily}
              onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
              className={`w-full p-2 rounded border ${inputBg} ${textColor} ${borderColor}`}
            >
              <option value="Virgil">Virgil (Hand-drawn)</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Cascadia">Cascadia Code</option>
            </select>
          </div>

          {/* Text Align */}
          <div className="mb-4">
            <label className={`block text-sm ${textColor} mb-2`}>Text Align</label>
            <div className="flex gap-2">
              {['left', 'center', 'right'].map(align => (
                <button
                  key={align}
                  onClick={() => handleStyleChange('textAlign', align)}
                  className={`flex-1 py-2 px-3 text-xs rounded border ${
                    currentStyle.textAlign === align
                      ? 'bg-blue-500 text-white border-blue-500'
                      : `${inputBg} ${textColor} ${borderColor}`
                  }`}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className={`text-sm font-medium ${textColor} mb-3`}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                handleStyleChange('strokeColor', '#000000');
                handleStyleChange('backgroundColor', 'transparent');
                handleStyleChange('strokeWidth', 1);
                handleStyleChange('opacity', 100);
              }}
              className={`py-2 px-3 text-xs rounded border ${inputBg} ${textColor} ${borderColor} hover:bg-gray-100 ${theme === THEMES.DARK ? 'hover:bg-gray-800' : ''}`}
            >
              Reset Styles
            </button>
            <button
              onClick={() => {
                const colors = ['#e03131', '#1c7ed6', '#37b24d', '#f59f00', '#9c36b5'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                handleStyleChange('strokeColor', randomColor);
              }}
              className={`py-2 px-3 text-xs rounded border ${inputBg} ${textColor} ${borderColor} hover:bg-gray-100 ${theme === THEMES.DARK ? 'hover:bg-gray-800' : ''}`}
            >
              Random Color
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylingPanel;
