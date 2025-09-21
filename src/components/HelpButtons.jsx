import React from 'react';
import { HelpCircle, MessageCircle, Youtube } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../types/canvas';

const HelpButtons = () => {
  const { state, actions } = useApp();
  const { theme } = state;

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
    actions.toggleHelpPanel();
  };

  const baseClasses = "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:shadow-md";
  const buttonClasses = theme === THEMES.DARK 
    ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700" 
    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

  return (
    <div className="fixed top-20 right-4 z-40 flex flex-col gap-2">
      <button
        onClick={() => handleHelpClick('google')}
        className={`${baseClasses} ${buttonClasses} border`}
        title="Search Google for help"
      >
        <HelpCircle size={18} />
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
