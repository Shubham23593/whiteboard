import React, { useState, useRef } from 'react';
import { X, Upload, Image, FileText, File, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEMES, ELEMENT_TYPES } from '../types/canvas';
import { createElement } from '../utils/canvasUtils';

const FileImportModal = ({ isOpen, onClose }) => {
  const { state, actions } = useApp();
  const { theme } = state;
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFiles = async (files) => {
    setImporting(true);
    try {
      for (const file of files) {
        await processFile(file);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing file: ' + error.message);
    } finally {
      setImporting(false);
      onClose();
    }
  };

  const processFile = async (file) => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType.startsWith('image/') || fileName.endsWith('.svg')) {
      await handleImageImport(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      await handleTextImport(file);
    } else if (fileType === 'application/json' || fileName.endsWith('.json')) {
      await handleJsonImport(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  };

  const handleImageImport = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create image element at center of canvas
          const centerX = window.innerWidth / 4; // Account for half-width panel
          const centerY = window.innerHeight / 2;
          
          // Scale image if too large
          const maxWidth = 300;
          const maxHeight = 300;
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width *= scale;
            height *= scale;
          }

          const imageElement = createElement(
            ELEMENT_TYPES.IMAGE,
            centerX - width / 2,
            centerY - height / 2,
            centerX + width / 2,
            centerY + height / 2,
            {
              src: e.target.result,
              originalWidth: img.width,
              originalHeight: img.height,
              fileName: file.name
            }
          );

          // Add to history and canvas
          const currentSnapshot = { elements: [...state.elements] };
          actions.addToHistory(currentSnapshot);
          actions.addElement(imageElement);
          resolve();
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleTextImport = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        
        let yOffset = window.innerHeight / 3;
        const xPosition = window.innerWidth / 4;
        
        // Add history snapshot
        const currentSnapshot = { elements: [...state.elements] };
        actions.addToHistory(currentSnapshot);

        lines.forEach((line, index) => {
          if (line.trim()) {
            const textElement = createElement(
              ELEMENT_TYPES.TEXT,
              xPosition,
              yOffset + (index * 30),
              xPosition + line.length * 10,
              yOffset + (index * 30) + 25,
              {
                text: line.trim(),
                fontSize: 16,
                fontFamily: 'Arial'
              }
            );
            actions.addElement(textElement);
          }
        });
        resolve();
      };
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  };

  const handleJsonImport = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.type === 'excalidraw' && data.elements) {
            // Add current state to history before importing
            const currentSnapshot = { elements: [...state.elements] };
            actions.addToHistory(currentSnapshot);
            
            // Import elements
            actions.setElements(data.elements);
            
            // Apply app state if available
            if (data.appState) {
              if (data.appState.theme) {
                actions.setTheme(data.appState.theme);
              }
            }
            
            resolve();
          } else {
            reject(new Error('Invalid whiteboard file format'));
          }
        } catch (error) {
          reject(new Error('Failed to parse JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read JSON file'));
      reader.readAsText(file);
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const modalBg = theme === THEMES.DARK ? 'bg-gray-900' : 'bg-white';
  const borderColor = theme === THEMES.DARK ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === THEMES.DARK ? 'text-gray-200' : 'text-gray-800';
  const buttonBg = theme === THEMES.DARK ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`${modalBg} ${borderColor} border rounded-xl shadow-xl p-6 w-96 max-w-md`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${textColor}`}>Import Files</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${buttonBg}`}
            disabled={importing}
          >
            <X size={20} className={textColor} />
          </button>
        </div>

        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : `${borderColor} ${buttonBg}`
          } ${importing ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <Upload size={32} className="text-white" />
            </div>
            
            <div>
              <h4 className={`font-semibold ${textColor} mb-2`}>
                {importing ? 'Importing files...' : 'Drop files here'}
              </h4>
              <p className={`text-sm ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                or click to browse
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={importing}
            >
              Choose Files
            </button>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="mt-6">
          <h4 className={`font-medium ${textColor} mb-3`}>Supported Formats:</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${buttonBg}`}>
              <Image size={20} className="text-blue-500" />
              <div>
                <div className={`font-medium ${textColor} text-sm`}>Images</div>
                <div className={`text-xs ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  PNG, JPG, JPEG, SVG
                </div>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg ${buttonBg}`}>
              <FileText size={20} className="text-green-500" />
              <div>
                <div className={`font-medium ${textColor} text-sm`}>Text Files</div>
                <div className={`text-xs ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  TXT files
                </div>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg ${buttonBg}`}>
              <File size={20} className="text-purple-500" />
              <div>
                <div className={`font-medium ${textColor} text-sm`}>Whiteboard Files</div>
                <div className={`text-xs ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  JSON exports
                </div>
              </div>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".png,.jpg,.jpeg,.svg,.txt,.json"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};

export default FileImportModal;