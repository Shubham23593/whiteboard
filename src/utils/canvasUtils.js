import { v4 as uuidv4 } from 'uuid';
import { ELEMENT_TYPES, DEFAULT_STYLE } from '../types/canvas.js';

// Create a new element
export const createElement = (type, x1, y1, x2, y2, options = {}) => {
  const element = {
    id: uuidv4(),
    type,
    x1,
    y1,
    x2,
    y2,
    ...DEFAULT_STYLE,
    ...options,
    isDeleted: false,
    link: null,
    locked: false,
    groupIds: []
  };

  // Special handling for different element types
  switch (type) {
    case ELEMENT_TYPES.TEXT:
      element.text = options.text || '';
      element.baseline = y1;
      break;
    case ELEMENT_TYPES.FREEDRAW:
      element.points = options.points || [];
      break;
    default:
      break;
  }

  return element;
};

// Calculate element bounds
export const getElementBounds = (element) => {
  const { x1, y1, x2, y2, type } = element;
  
  let minX = Math.min(x1, x2);
  let minY = Math.min(y1, y2);
  let maxX = Math.max(x1, x2);
  let maxY = Math.max(y1, y2);

  if (type === ELEMENT_TYPES.FREEDRAW && element.points) {
    const xs = element.points.map(point => point.x);
    const ys = element.points.map(point => point.y);
    minX = Math.min(...xs);
    minY = Math.min(...ys);
    maxX = Math.max(...xs);
    maxY = Math.max(...ys);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
};

// Check if point is inside element
export const isPointInElement = (x, y, element) => {
  const bounds = getElementBounds(element);
  const padding = Math.max(element.strokeWidth || 1, 5);
  
  return (
    x >= bounds.x - padding &&
    x <= bounds.x + bounds.width + padding &&
    y >= bounds.y - padding &&
    y <= bounds.y + bounds.height + padding
  );
};

// Get resize handles for an element
export const getResizeHandles = (element) => {
  const bounds = getElementBounds(element);
  const handleSize = 8;
  
  return [
    { type: 'nw', x: bounds.x, y: bounds.y },
    { type: 'n', x: bounds.x + bounds.width / 2, y: bounds.y },
    { type: 'ne', x: bounds.x + bounds.width, y: bounds.y },
    { type: 'e', x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    { type: 'se', x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { type: 's', x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
    { type: 'sw', x: bounds.x, y: bounds.y + bounds.height },
    { type: 'w', x: bounds.x, y: bounds.y + bounds.height / 2 }
  ].map(handle => ({
    ...handle,
    x: handle.x - handleSize / 2,
    y: handle.y - handleSize / 2,
    width: handleSize,
    height: handleSize
  }));
};

// Distance between two points
export const distance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// Convert screen coordinates to canvas coordinates
export const screenToCanvas = (screenX, screenY, camera) => {
  return {
    x: (screenX - camera.x) / camera.zoom,
    y: (screenY - camera.y) / camera.zoom
  };
};

// Convert canvas coordinates to screen coordinates
export const canvasToScreen = (canvasX, canvasY, camera) => {
  return {
    x: canvasX * camera.zoom + camera.x,
    y: canvasY * camera.zoom + camera.y
  };
};

// Clamp value between min and max
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

// Generate export data
export const generateExportData = (elements, appState) => {
  return {
    type: 'excalidraw',
    version: 1,
    source: 'excalidraw-clone',
    elements: elements.filter(el => !el.isDeleted),
    appState: {
      viewBackgroundColor: appState.viewBackgroundColor,
      gridSize: appState.gridSize,
      theme: appState.theme
    }
  };
};
