import React, { useState } from 'react';
import { X, ExternalLink, HelpCircle, Youtube, MessageCircle, Search, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../types/canvas';

const HelpPanel = () => {
  const { state, actions } = useApp();
  const { showHelpPanel, helpPanelUrl, theme } = state;
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!showHelpPanel) return null;

  const handleHelpClick = (type) => {
    let url = '';
    setIframeError(false);
    setIsLoading(true);
    
    switch (type) {
      case 'google':
        // Google search that works in iframe
        url = 'https://www.google.com/search?igu=1&q=whiteboard+drawing+tutorial+excalidraw';
        break;
      case 'chatgpt':
        // Use the correct ChatGPT URL
        url = 'https://chatgpt.com/';
        break;
      case 'youtube':
        // Use the main YouTube URL
        url = 'https://www.youtube.com/';
        break;
      case 'youtube-search':
        // YouTube search for whiteboard tutorials
        url = 'https://www.youtube.com/results?search_query=whiteboard+drawing+tutorial';
        break;
      default:
        return;
    }
    
    actions.setHelpPanelUrl(url);
  };

  const handleLocalHelp = () => {
    actions.setHelpPanelUrl('local-help');
    setIframeError(false);
  };

  const handleBackToMenu = () => {
    actions.setHelpPanelUrl('');
    setIframeError(false);
    setIsLoading(false);
  };

  const handleOpenInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setIframeError(true);
  };

  const handleRetry = () => {
    setIframeError(false);
    setIsLoading(true);
    // Force iframe reload by updating the URL
    const currentUrl = helpPanelUrl;
    actions.setHelpPanelUrl('');
    setTimeout(() => {
      actions.setHelpPanelUrl(currentUrl);
    }, 100);
  };

  const panelBg = theme === THEMES.DARK ? 'bg-gray-900' : 'bg-white';
  const borderColor = theme === THEMES.DARK ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === THEMES.DARK ? 'text-gray-200' : 'text-gray-800';
  const buttonBg = theme === THEMES.DARK ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100';

  const renderContent = () => {
    if (!helpPanelUrl) {
      // Main help menu
      return (
        <div className="p-4 overflow-y-auto h-full">
          <p className={`${textColor} mb-6`}>
            Choose your preferred help resource:
          </p>

          <div className="space-y-4">
            <button
              onClick={handleLocalHelp}
              className={`w-full p-4 rounded-lg ${buttonBg} ${borderColor} border flex items-center gap-3 transition-colors hover:shadow-md`}
            >
              <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                <HelpCircle size={16} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-medium ${textColor}`}>Built-in Help Guide</h3>
                <p className={`text-sm ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  Complete guide with shortcuts and features
                </p>
              </div>
            </button>

            <button
              onClick={() => handleHelpClick('youtube')}
              className={`w-full p-4 rounded-lg ${buttonBg} ${borderColor} border flex items-center gap-3 transition-colors hover:shadow-md`}
            >
              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                <Youtube size={16} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-medium ${textColor}`}>YouTube</h3>
                <p className={`text-sm ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  Browse video tutorials and learn visually
                </p>
              </div>
            </button>

            <button
              onClick={() => handleHelpClick('chatgpt')}
              className={`w-full p-4 rounded-lg ${buttonBg} ${borderColor} border flex items-center gap-3 transition-colors hover:shadow-md`}
            >
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-medium ${textColor}`}>ChatGPT</h3>
                <p className={`text-sm ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ask AI for personalized help and tips
                </p>
              </div>
            </button>

            <button
              onClick={() => handleHelpClick('google')}
              className={`w-full p-4 rounded-lg ${buttonBg} ${borderColor} border flex items-center gap-3 transition-colors hover:shadow-md`}
            >
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <Search size={16} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-medium ${textColor}`}>Google Search</h3>
                <p className={`text-sm ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  Search for tutorials and documentation
                </p>
              </div>
            </button>

            <button
              onClick={() => handleHelpClick('youtube-search')}
              className={`w-full p-4 rounded-lg ${buttonBg} ${borderColor} border flex items-center gap-3 transition-colors hover:shadow-md`}
            >
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <Youtube size={16} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-medium ${textColor}`}>Whiteboard Tutorials</h3>
                <p className={`text-sm ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  Curated YouTube tutorials for whiteboards
                </p>
              </div>
            </button>
          </div>

          {/* Quick shortcuts preview */}
          <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <h3 className="font-medium text-gray-800 mb-2">💡 Quick Tip</h3>
            <p className="text-sm text-gray-700">
              Press <kbd className="px-2 py-1 bg-white rounded text-xs">V</kbd> to select, 
              <kbd className="px-2 py-1 bg-white rounded text-xs ml-1">P</kbd> to draw, 
              <kbd className="px-2 py-1 bg-white rounded text-xs ml-1">T</kbd> for text
            </p>
          </div>
        </div>
      );
    }

    if (helpPanelUrl === 'local-help') {
      // Local help content (same as before but more comprehensive)
      return (
        <div className="p-4 overflow-y-auto h-full">
          <div className="space-y-6">
            {/* Quick Start */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🚀 Quick Start</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-green-700">
                <li>Select a tool from the toolbar (V for select, P for pen, T for text)</li>
                <li>Click and drag on the canvas to create elements</li>
                <li>Use the styling panel to customize colors and properties</li>
                <li>Export your work when finished</li>
              </ol>
            </div>

            {/* Drawing Tools */}
            <div>
              <h3 className={`text-lg font-semibold ${textColor} mb-3 flex items-center gap-2`}>
                🎨 Drawing Tools
              </h3>
              <div className="grid gap-3">
                {[
                  { key: 'V', tool: 'Select', desc: 'Click to select elements, drag to move. Double-click text to edit.' },
                  { key: 'P', tool: 'Pen', desc: 'Free drawing. Click and drag to draw smooth lines and curves.' },
                  { key: 'R', tool: 'Rectangle', desc: 'Create rectangles and squares. Hold Shift for perfect squares.' },
                  { key: 'O', tool: 'Circle', desc: 'Draw circles and ellipses. Hold Shift for perfect circles.' },
                  { key: 'D', tool: 'Diamond', desc: 'Create diamond and rhombus shapes.' },
                  { key: 'L', tool: 'Line', desc: 'Draw straight lines. Hold Shift for 45° increments.' },
                  { key: 'A', tool: 'Arrow', desc: 'Create arrows for diagrams and annotations.' },
                  { key: 'T', tool: 'Text', desc: 'Add text anywhere. Double-click existing text to edit.' },
                  { key: 'H', tool: 'Hand', desc: 'Pan the canvas. Also works with middle mouse button.' },
                  { key: 'E', tool: 'Eraser', desc: 'Delete elements by clicking or dragging over them.' }
                ].map((item, index) => (
                  <div key={index} className={`p-3 rounded-lg ${buttonBg} border ${borderColor}`}>
                    <div className="flex items-center gap-3">
                      <kbd className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold min-w-[24px] text-center">
                        {item.key}
                      </kbd>
                      <div className="flex-1">
                        <div className={`font-medium ${textColor}`}>{item.tool} Tool</div>
                        <div className={`text-sm ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div>
              <h3 className={`text-lg font-semibold ${textColor} mb-3 flex items-center gap-2`}>
                ⌨️ Essential Shortcuts
              </h3>
              <div className="grid gap-2">
                {[
                  { key: 'Ctrl + Z', action: 'Undo last action' },
                  { key: 'Ctrl + Y', action: 'Redo last undone action' },
                  { key: 'Ctrl + A', action: 'Select all elements' },
                  { key: 'Delete', action: 'Delete selected elements' },
                  { key: 'Escape', action: 'Deselect all elements' },
                  { key: 'Ctrl + G', action: 'Toggle grid on/off' },
                  { key: 'Mouse Wheel', action: 'Zoom in and out' },
                  { key: 'Middle Click + Drag', action: 'Pan the canvas' }
                ].map((shortcut, index) => (
                  <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${buttonBg}`}>
                    <span className={`text-sm ${theme === THEMES.DARK ? 'text-gray-300' : 'text-gray-700'}`}>
                      {shortcut.action}
                    </span>
                    <kbd className="px-3 py-1 bg-gray-200 rounded text-xs text-gray-800 font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips */}
            <div>
              <h3 className={`text-lg font-semibold ${textColor} mb-3 flex items-center gap-2`}>
                💡 Pro Tips
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '🎨', tip: 'Use the styling panel to change colors, stroke width, and opacity' },
                  { icon: '💾', tip: 'Export as JSON to save your work, or PNG to share images' },
                  { icon: '🌙', tip: 'Toggle between light and dark themes for better visibility' },
                  { icon: '📏', tip: 'Enable grid for precise alignment and measurement' },
                  { icon: '🔍', tip: 'Use zoom controls for detailed work or canvas overview' },
                  { icon: '📝', tip: 'Double-click text elements to edit them inline' },
                  { icon: '🖱️', tip: 'Right-click for context menus and quick actions' }
                ].map((item, index) => (
                  <div key={index} className={`p-3 rounded-lg ${buttonBg} border-l-4 border-blue-400`}>
                    <div className={`text-sm ${theme === THEMES.DARK ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="mr-2">{item.icon}</span>
                      {item.tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* File Operations */}
            <div>
              <h3 className={`text-lg font-semibold ${textColor} mb-3 flex items-center gap-2`}>
                📁 File Operations
              </h3>
              <div className="space-y-2 text-sm">
                <div className={`p-3 rounded-lg ${buttonBg}`}>
                  <strong className={textColor}>Export:</strong>
                  <span className={`ml-2 ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                    Save your whiteboard as JSON (editable) or PNG (image)
                  </span>
                </div>
                <div className={`p-3 rounded-lg ${buttonBg}`}>
                  <strong className={textColor}>Import:</strong>
                  <span className={`ml-2 ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                    Load previously saved JSON files to continue editing
                  </span>
                </div>
                <div className={`p-3 rounded-lg ${buttonBg}`}>
                  <strong className={textColor}>Clear:</strong>
                  <span className={`ml-2 ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                    Remove all elements from the canvas (with confirmation)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // For external URLs with iframe
    return (
      <div className="h-full flex flex-col">
        {/* Loading/Error States */}
        {isLoading && (
          <div className={`flex items-center gap-2 p-3 border-b ${borderColor} bg-blue-50 text-blue-800`}>
            <div className="animate-spin">
              <RefreshCw size={16} />
            </div>
            <span className="text-sm">Loading content...</span>
          </div>
        )}
        
        {iframeError && (
          <div className={`p-3 border-b ${borderColor} bg-red-50 text-red-800`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span className="text-sm">Content couldn't load in panel</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-xs transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => handleOpenInNewTab(helpPanelUrl)}
                  className="px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded text-xs transition-colors"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Iframe */}
        {helpPanelUrl && (
          <iframe
            src={helpPanelUrl}
            className="flex-1 border-0"
            title="Help Resource"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>
    );
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-1/2 ${panelBg} ${borderColor} border-l shadow-xl z-40 flex flex-col`}>
      {/* Header */}
      <div className={`p-4 border-b ${borderColor} flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {helpPanelUrl && (
              <button
                onClick={handleBackToMenu}
                className={`p-2 rounded-lg ${buttonBg} mr-2 hover:shadow-md transition-all`}
                title="Back to help menu"
              >
                <ArrowLeft size={16} className={textColor} />
              </button>
            )}
            <h2 className={`text-lg font-semibold ${textColor}`}>
              {helpPanelUrl === 'local-help' ? 'Help Guide' : 
               helpPanelUrl ? 'Help Resources' : 'Help & Resources'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {helpPanelUrl && helpPanelUrl !== 'local-help' && (
              <button
                onClick={() => handleOpenInNewTab(helpPanelUrl)}
                className={`p-2 rounded-lg ${buttonBg} hover:shadow-md transition-all`}
                title="Open in new tab"
              >
                <ExternalLink size={16} className={textColor} />
              </button>
            )}
            <button
              onClick={actions.toggleHelpPanel}
              className={`p-2 rounded-lg ${buttonBg} hover:shadow-md transition-all`}
            >
              <X size={20} className={textColor} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default HelpPanel;