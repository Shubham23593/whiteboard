import React from 'react';
import { HelpCircle, MessageCircle, Youtube, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../types/canvas';

const HelpButtons = () => {
  const { state, actions } = useApp();
  const { theme } = state;

  const handleHelpClick = (type) => {
    let url = '';
    switch (type) {
      case 'google':
        url = 'https://www.google.com/search?q=excalidraw+tutorial+how+to+use+whiteboard&igu=1';
        break;
      case 'chatgpt':
        url = 'https://chat.openai.com';
        break;
      case 'youtube':
        url = 'https://www.youtube.com/embed/videoseries?list=PLpGHT1n4-mAtlFah0q0h15uh8KYX2hBg6';
        break;
      case 'help':
        url = 'local-help';
        break;
      default:
        return;
    }
    
    actions.setHelpPanelUrl(url);
    if (!state.showHelpPanel) {
      actions.toggleHelpPanel();
    }
  };

  const baseClasses = "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:shadow-md";
  const buttonClasses = theme === THEMES.DARK 
    ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700" 
    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

  return (
    <div className="fixed top-20 right-4 z-40 flex flex-col gap-2">
      <button
        onClick={() => handleHelpClick('help')}
        className={`${baseClasses} ${buttonClasses} border`}
        title="Quick Help Guide"
      >
        <HelpCircle size={18} />
      </button>
      
      <button
        onClick={() => handleHelpClick('google')}
        className={`${baseClasses} ${buttonClasses} border`}
        title="Search Google for help"
      >
        <Search size={18} />
      </button>
      
      <button
        onClick={() => handleHelpClick('chatgpt')}
        className={`${baseClasses} ${buttonClasses} border`}
        title="Ask ChatGPT for help"
      >
        <MessageCircle size={18} />
      </button>
      
      <button
        onClick={() => handleHelpClick('youtube')}
        className={`${baseClasses} ${buttonClasses} border`}
        title="Watch YouTube tutorials"
      >
        <Youtube size={18} />
      </button>
    </div>
  );
};

export default HelpButtons;