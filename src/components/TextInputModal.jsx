import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../types/canvas';

const TextInputModal = ({ isOpen, onClose, onSubmit, position, initialText = '' }) => {
  const [text, setText] = useState('');
  const { state } = useApp();
  const { theme } = state;

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
    }
  }, [isOpen, initialText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalBg = theme === THEMES.DARK ? 'bg-gray-900' : 'bg-white';
  const borderColor = theme === THEMES.DARK ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === THEMES.DARK ? 'text-gray-200' : 'text-gray-800';
  const inputBg = theme === THEMES.DARK ? 'bg-gray-800' : 'bg-gray-50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className={`${modalBg} ${borderColor} border rounded-lg shadow-xl p-6 w-96`}
        style={{
          position: position ? 'fixed' : 'relative',
          left: position?.x || 'auto',
          top: position?.y || 'auto',
          transform: position ? 'translate(-50%, -50%)' : 'none'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${textColor}`}>
            {initialText ? 'Edit Text' : 'Add Text'}
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-gray-100 ${theme === THEMES.DARK ? 'hover:bg-gray-800' : ''}`}
          >
            <X size={16} className={textColor} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your text..."
            className={`w-full p-3 border rounded-md resize-none ${inputBg} ${textColor} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={3}
            autoFocus
          />
          
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initialText ? 'Update Text' : 'Add Text'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-md ${borderColor} ${textColor} hover:bg-gray-50 ${theme === THEMES.DARK ? 'hover:bg-gray-800' : ''}`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TextInputModal;