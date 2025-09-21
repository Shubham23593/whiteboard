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
      // For text, make sure x2 and y2 are set properly
      element.x2 = x1 + (element.text.length * element.fontSize * 0.6);
      element.y2 = y1 + element.fontSize + 10;
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

  if (type === ELEMENT_TYPES.FREEDRAW && element.points && element.points.length > 0) {
    const xs = element.points.map(point => point.x);
    const ys = element.points.map(point => point.y);
    minX = Math.min(...xs);
    minY = Math.min(...ys);
    maxX = Math.max(...xs);
    maxY = Math.max(...ys);
  }

  // Add padding for better selection
  const padding = Math.max(element.strokeWidth || 1, 5);

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + (padding * 2),
    height: maxY - minY + (padding * 2)
  };
};

// Check if point is inside element with better detection
export const isPointInElement = (x, y, element) => {
  const bounds = getElementBounds(element);
  
  // Basic bounds check
  const inBounds = (
    x >= bounds.x &&
    x <= bounds.x + bounds.width &&
    y >= bounds.y &&
    y <= bounds.y + bounds.height
  );

  if (!inBounds) return false;

  // More precise detection for different element types
  switch (element.type) {
    case ELEMENT_TYPES.TEXT:
      // For text, use the text bounds more precisely
      return (
        x >= element.x1 &&
        x <= element.x2 &&
        y >= element.y1 &&
        y <= element.y2
      );

    case ELEMENT_TYPES.LINE:
    case ELEMENT_TYPES.ARROW:
      // For lines, check distance from line
      return distanceFromLine(x, y, element.x1, element.y1, element.x2, element.y2) <= 10;

    case ELEMENT_TYPES.FREEDRAW:
      // For freedraw, check if near any point
      if (element.points && element.points.length > 0) {
        return element.points.some(point => 
          Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)) <= 10
        );
      }
      return false;

    case ELEMENT_TYPES.ELLIPSE:
      // For ellipse, check if inside the ellipse
      const centerX = (element.x1 + element.x2) / 2;
      const centerY = (element.y1 + element.y2) / 2;
      const radiusX = Math.abs(element.x2 - element.x1) / 2;
      const radiusY = Math.abs(element.y2 - element.y1) / 2;
      
      const normalizedX = (x - centerX) / radiusX;
      const normalizedY = (y - centerY) / radiusY;
      
      return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;

    default:
      // For rectangles and diamonds, use bounds
      return inBounds;
  }
};

// Distance from point to line
const distanceFromLine = (px, py, x1, y1, x2, y2) => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
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