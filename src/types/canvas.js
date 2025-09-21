// Canvas element types and interfaces

export const TOOL_TYPES = {
  SELECT: 'select',
  PEN: 'pen',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  DIAMOND: 'diamond',
  LINE: 'line',
  ARROW: 'arrow',
  TEXT: 'text',
  HAND: 'hand',
  ERASER: 'eraser'
};

export const ELEMENT_TYPES = {
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  DIAMOND: 'diamond',
  LINE: 'line',
  ARROW: 'arrow',
  TEXT: 'text',
  FREEDRAW: 'freedraw'
};

export const STROKE_STYLES = {
  SOLID: 'solid',
  DASHED: 'dashed',
  DOTTED: 'dotted'
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Default styling options
export const DEFAULT_STYLE = {
  strokeColor: '#000000',
  backgroundColor: 'transparent',
  fillStyle: 'hachure',
  strokeWidth: 1,
  strokeStyle: STROKE_STYLES.SOLID,
  roughness: 1,
  opacity: 100,
  fontSize: 20,
  fontFamily: 'Virgil',
  textAlign: 'left'
};

// Canvas state
export const CANVAS_STATE = {
  IDLE: 'idle',
  DRAWING: 'drawing',
  MOVING: 'moving',
  RESIZING: 'resizing',
  ROTATING: 'rotating',
  PANNING: 'panning'
};
