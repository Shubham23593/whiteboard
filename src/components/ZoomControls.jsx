import React from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../types/canvas';
import { getElementBounds } from '../utils/canvasUtils';

const ZoomControls = () => {
  const { state, actions } = useApp();
  const { camera, theme, elements } = state;

  const handleZoomIn = () => {
    const newZoom = Math.min(camera.zoom * 1.2, 5);
    actions.setCamera({ zoom: newZoom });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(camera.zoom / 1.2, 0.1);
    actions.setCamera({ zoom: newZoom });
  };

  const handleFitToScreen = () => {
    if (elements.length === 0) {
      actions.setCamera({ x: 0, y: 0, zoom: 1 });
      return;
    }

    // Calculate bounds of all elements
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach(element => {
      if (!element.isDeleted) {
        const bounds = getElementBounds(element);
        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
      }
    });

    if (minX === Infinity) {
      actions.setCamera({ x: 0, y: 0, zoom: 1 });
      return;
    }

    // Add padding
    const padding = 50;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    // Get canvas dimensions (assuming full viewport)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate zoom to fit content
    const zoomX = viewportWidth / contentWidth;
    const zoomY = viewportHeight / contentHeight;
    const zoom = Math.min(zoomX, zoomY, 1); // Don't zoom in beyond 100%

    // Calculate position to center content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const x = viewportWidth / 2 - centerX * zoom;
    const y = viewportHeight / 2 - centerY * zoom;

    actions.setCamera({ x, y, zoom });
  };

  const baseClasses = "flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 hover:shadow-md";
  const buttonClasses = theme === THEMES.DARK 
    ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700" 
    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${
      theme === THEMES.DARK ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    } border rounded-xl shadow-lg p-3`}>
      <div className="flex flex-col items-center gap-2">
        <button
          className={`${baseClasses} ${buttonClasses}`}
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        
        <div className={`px-2 py-1 text-sm font-medium ${
          theme === THEMES.DARK ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {Math.round(camera.zoom * 100)}%
        </div>
        
        <button
          className={`${baseClasses} ${buttonClasses}`}
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        
        <button
          className={`${baseClasses} ${buttonClasses}`}
          onClick={handleFitToScreen}
          title="Fit to Screen"
        >
          <Maximize size={18} />
        </button>
      </div>
    </div>
  );
};

export default ZoomControls;
