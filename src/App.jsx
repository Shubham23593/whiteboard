import React from 'react';
import { AppProvider } from './context/AppContext';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import ZoomControls from './components/ZoomControls';
import StylingPanel from './components/StylingPanel';
import HelpPanel from './components/HelpPanel';
import HelpButtons from './components/HelpButtons';
import { useApp } from './context/AppContext';
import { THEMES } from './types/canvas';

const AppContent = () => {
  const { state } = useApp();
  const { theme, showStylingPanel, showHelpPanel } = state;

  return (
    <div className={`h-screen w-screen overflow-hidden relative ${
      theme === THEMES.DARK ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      {/* Canvas */}
      <div 
        className={`absolute inset-0 ${
          showStylingPanel ? (showHelpPanel ? 'right-[50%]' : 'right-80') : 
          showHelpPanel ? 'right-[50%]' : 'right-0'
        } transition-all duration-300`}
      >
        <Canvas />
      </div>

      {/* UI Components */}
      <Toolbar />
      <ZoomControls />
      <HelpButtons />
      <StylingPanel />
      <HelpPanel />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
