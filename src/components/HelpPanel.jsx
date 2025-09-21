import React from 'react';
import { X, ExternalLink, HelpCircle, Youtube, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../types/canvas';

const HelpPanel = () => {
  const { state, actions } = useApp();
  const { showHelpPanel, helpPanelUrl, theme } = state;

  if (!showHelpPanel) return null;

  const handleHelpClick = (type) => {
    let url = '';
    switch (type) {
      case 'google':
        url = 'https://www.google.com/search?q=excalidraw+tutorial';
        break;
      case 'chatgpt':
        url = 'https://chat.openai.com';
        break;
      case 'youtube':
        url = 'https://www.youtube.com/results?search_query=excalidraw+tutorial';
        break;
      default:
        return;
    }
    actions.setHelpPanelUrl(url);
  };

  const panelBg = theme === THEMES.DARK ? 'bg-gray-900' : 'bg-white';
  const borderColor = theme === THEMES.DARK ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === THEMES.DARK ? 'text-gray-200' : 'text-gray-800';
  const buttonBg = theme === THEMES.DARK ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100';

  return (
    <div className={`fixed top-0 right-0 h-full w-1/2 ${panelBg} ${borderColor} border-l shadow-xl z-40`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${textColor}`}>Help & Resources</h2>
          <button
            onClick={actions.toggleHelpPanel}
            className={`p-2 rounded-lg ${buttonBg}`}
          >
            <X size={20} className={textColor} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {!helpPanelUrl ? (
          <div>
            <p className={`${textColor} mb-6`}>
              Get help and learn how to use the whiteboard effectively:
            </p>

            <div className="space-y-4">
              <button
                onClick={() => handleHelpClick('google')}
                className={`w-full p-4 rounded-lg ${buttonBg} ${borderColor} border flex items-center gap-3 transition-colors`}
              >
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <HelpCircle size={16} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className={`font-medium ${textColor}`}>Google Search</h3>
                  <p className={`text-sm ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                    Search for tutorials and guides
                  </p>
                </div>
                <ExternalLink size={16} className={theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-500'} />
              </button>

              <button
                onClick={() => handleHelpClick('chatgpt')}
                className={`w-full p-4 rounded-lg ${buttonBg} ${borderColor} border flex items-center gap-3 transition-colors`}
              >
                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                  <MessageCircle size={16} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className={`font-medium ${textColor}`}>ChatGPT</h3>
                  <p className={`text-sm ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                    Ask AI for help and tips
                  </p>
                </div>
                <ExternalLink size={16} className={theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-500'} />
              </button>

              <button
                onClick={() => handleHelpClick('youtube')}
                className={`w-full p-4 rounded-lg ${buttonBg} ${borderColor} border flex items-center gap-3 transition-colors`}
              >
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                  <Youtube size={16} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className={`font-medium ${textColor}`}>YouTube Tutorials</h3>
                  <p className={`text-sm ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                    Watch video tutorials
                  </p>
                </div>
                <ExternalLink size={16} className={theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>

            <div className="mt-8">
              <h3 className={`font-medium ${textColor} mb-3`}>Keyboard Shortcuts</h3>
              <div className="space-y-2 text-sm">
                <div className={`flex justify-between ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Select Tool</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">V</kbd>
                </div>
                <div className={`flex justify-between ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Pen Tool</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">P</kbd>
                </div>
                <div className={`flex justify-between ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Rectangle</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">R</kbd>
                </div>
                <div className={`flex justify-between ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Undo</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+Z</kbd>
                </div>
                <div className={`flex justify-between ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Redo</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+Y</kbd>
                </div>
                <div className={`flex justify-between ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Delete</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Del</kbd>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <div className="mb-4">
              <button
                onClick={() => actions.setHelpPanelUrl('')}
                className={`px-3 py-2 rounded ${buttonBg} ${textColor} text-sm`}
              >
                ← Back to Help Menu
              </button>
            </div>
            <iframe
              src={helpPanelUrl}
              className="w-full h-full border rounded"
              title="Help Resource"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpPanel;
