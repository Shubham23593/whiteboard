import React from 'react';
import { 
  MousePointer, 
  Pen, 
  Square, 
  Circle, 
  Diamond, 
  Minus, 
  ArrowRight, 
  Type, 
  Hand, 
  Eraser,
  Undo,
  Redo,
  Download,
  Upload,
  Trash2,
  Grid,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOOL_TYPES, THEMES } from '../types/canvas';
import { generateExportData } from '../utils/canvasUtils';

const Toolbar = () => {
  const { state, actions } = useApp();
  const { activeTool, theme, showGrid, history, historyIndex, elements, camera, viewBackgroundColor, gridSize } = state;

  const tools = [
    { type: TOOL_TYPES.SELECT, icon: MousePointer, label: 'Select (V)', shortcut: 'V' },
    { type: TOOL_TYPES.PEN, icon: Pen, label: 'Pen (P)', shortcut: 'P' },
    { type: TOOL_TYPES.RECTANGLE, icon: Square, label: 'Rectangle (R)', shortcut: 'R' },
    { type: TOOL_TYPES.ELLIPSE, icon: Circle, label: 'Ellipse (O)', shortcut: 'O' },
    { type: TOOL_TYPES.DIAMOND, icon: Diamond, label: 'Diamond (D)', shortcut: 'D' },
    { type: TOOL_TYPES.LINE, icon: Minus, label: 'Line (L)', shortcut: 'L' },
    { type: TOOL_TYPES.ARROW, icon: ArrowRight, label: 'Arrow (A)', shortcut: 'A' },
    { type: TOOL_TYPES.TEXT, icon: Type, label: 'Text (T)', shortcut: 'T' },
    { type: TOOL_TYPES.HAND, icon: Hand, label: 'Hand (H)', shortcut: 'H' },
    { type: TOOL_TYPES.ERASER, icon: Eraser, label: 'Eraser (E)', shortcut: 'E' }
  ];

  const handleToolSelect = (toolType) => {
    actions.setActiveTool(toolType);
    if (toolType !== TOOL_TYPES.SELECT) {
      actions.setSelectedElements([]);
    }
  };

  const handleUndo = () => {
    actions.undo();
  };

  const handleRedo = () => {
    actions.redo();
  };

  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      const currentSnapshot = { elements: [...elements] };
      actions.addToHistory(currentSnapshot);
      actions.clearCanvas();
    }
  };

  const handleToggleTheme = () => {
    actions.setTheme(theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT);
  };

  const exportAsJSON = () => {
    try {
      const exportData = generateExportData(elements, {
        viewBackgroundColor,
        gridSize,
        theme,
        camera
      });
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `whiteboard-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const exportAsPNG = () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        alert('Canvas not found. Please try again.');
        return;
      }

      // Create a temporary canvas for export
      const exportCanvas = document.createElement('canvas');
      const exportCtx = exportCanvas.getContext('2d');
      
      // Calculate bounds of all elements
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      elements.forEach(element => {
        if (!element.isDeleted) {
          minX = Math.min(minX, element.x1, element.x2);
          minY = Math.min(minY, element.y1, element.y2);
          maxX = Math.max(maxX, element.x1, element.x2);
          maxY = Math.max(maxY, element.y1, element.y2);
        }
      });

      if (minX === Infinity) {
        alert('No elements to export.');
        return;
      }

      const padding = 50;
      const width = maxX - minX + (padding * 2);
      const height = maxY - minY + (padding * 2);
      
      exportCanvas.width = width;
      exportCanvas.height = height;
      
      // Fill background
      exportCtx.fillStyle = viewBackgroundColor;
      exportCtx.fillRect(0, 0, width, height);
      
      // Draw elements (simplified - you might need to adapt your drawing functions)
      exportCtx.translate(-minX + padding, -minY + padding);
      
      const dataURL = exportCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataURL;
      link.click();
    } catch (error) {
      console.error('PNG export failed:', error);
      alert('PNG export failed. Please try again.');
    }
  };

  const handleExport = () => {
    const choice = window.confirm('Export as PNG? (Cancel for JSON)');
    if (choice) {
      exportAsPNG();
    } else {
      exportAsJSON();
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          if (importData.type === 'excalidraw' && importData.elements) {
            const currentSnapshot = { elements: [...elements] };
            actions.addToHistory(currentSnapshot);
            actions.setElements(importData.elements);
            
            if (importData.appState) {
              if (importData.appState.theme) {
                actions.setTheme(importData.appState.theme);
              }
            }
            
            alert('File imported successfully!');
          } else {
            alert('Invalid file format. Please select a valid whiteboard file.');
          }
        } catch (error) {
          console.error('Import failed:', error);
          alert('Import failed. Please check the file and try again.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const baseClasses = "flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 hover:shadow-md";
  const activeClasses = theme === THEMES.DARK 
    ? "bg-blue-600 border-blue-500 text-white" 
    : "bg-blue-500 border-blue-400 text-white";
  const inactiveClasses = theme === THEMES.DARK 
    ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700" 
    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";
  const disabledClasses = theme === THEMES.DARK 
    ? "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed" 
    : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed";

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${
      theme === THEMES.DARK ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    } border rounded-xl shadow-lg p-3`}>
      <div className="flex items-center gap-2">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <button
              key={tool.type}
              className={`${baseClasses} ${
                activeTool === tool.type ? activeClasses : inactiveClasses
              }`}
              onClick={() => handleToolSelect(tool.type)}
              title={tool.label}
            >
              <tool.icon size={18} />
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className={`w-px h-8 ${theme === THEMES.DARK ? 'bg-gray-700' : 'bg-gray-300'}`} />

        {/* History Controls */}
        <div className="flex items-center gap-1">
          <button
            className={`${baseClasses} ${
              canUndo ? inactiveClasses : disabledClasses
            }`}
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={18} />
          </button>
          <button
            className={`${baseClasses} ${
              canRedo ? inactiveClasses : disabledClasses
            }`}
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={18} />
          </button>
        </div>

        {/* Separator */}
        <div className={`w-px h-8 ${theme === THEMES.DARK ? 'bg-gray-700' : 'bg-gray-300'}`} />

        {/* File Operations */}
        <div className="flex items-center gap-1">
          <button
            className={`${baseClasses} ${inactiveClasses}`}
            onClick={handleExport}
            title="Export (Ctrl+E)"
          >
            <Download size={18} />
          </button>
          <button
            className={`${baseClasses} ${inactiveClasses}`}
            onClick={handleImport}
            title="Import"
          >
            <Upload size={18} />
          </button>
        </div>

        {/* Separator */}
        <div className={`w-px h-8 ${theme === THEMES.DARK ? 'bg-gray-700' : 'bg-gray-300'}`} />

        {/* Canvas Controls */}
        <div className="flex items-center gap-1">
          <button
            className={`${baseClasses} ${
              showGrid ? activeClasses : inactiveClasses
            }`}
            onClick={actions.toggleGrid}
            title="Toggle Grid (Ctrl+G)"
          >
            <Grid size={18} />
          </button>
          <button
            className={`${baseClasses} ${inactiveClasses}`}
            onClick={actions.toggleStylingPanel}
            title="Styling Panel"
          >
            <Settings size={18} />
          </button>
          <button
            className={`${baseClasses} ${inactiveClasses}`}
            onClick={handleToggleTheme}
            title="Toggle Theme"
          >
            {theme === THEMES.DARK ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className={`${baseClasses} ${inactiveClasses}`}
            onClick={handleClearCanvas}
            title="Clear Canvas"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;