import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { TOOL_TYPES, THEMES, DEFAULT_STYLE, CANVAS_STATE } from '../types/canvas.js';

// Initial state
const initialState = {
  // Canvas elements
  elements: [],
  selectedElementIds: [],
  
  // Current tool and state
  activeTool: TOOL_TYPES.SELECT,
  canvasState: CANVAS_STATE.IDLE,
  
  // Camera/viewport
  camera: { x: 0, y: 0, zoom: 1 },
  
  // Drawing state
  isDrawing: false,
  currentElement: null,
  
  // UI state
  theme: THEMES.LIGHT,
  showGrid: true,
  gridSize: 20,
  
  // Styling
  currentStyle: { ...DEFAULT_STYLE },
  
  // History for undo/redo
  history: [],
  historyIndex: -1,
  
  // Panels
  showStylingPanel: false,
  showHelpPanel: false,
  helpPanelUrl: '',
  
  // Export/Import
  exportInProgress: false,
  
  // Performance
  viewBackgroundColor: '#ffffff',
  shouldClearCanvas: false
};

// Action types
const actionTypes = {
  SET_ELEMENTS: 'SET_ELEMENTS',
  ADD_ELEMENT: 'ADD_ELEMENT',
  UPDATE_ELEMENT: 'UPDATE_ELEMENT',
  DELETE_ELEMENT: 'DELETE_ELEMENT',
  SET_SELECTED_ELEMENTS: 'SET_SELECTED_ELEMENTS',
  SET_ACTIVE_TOOL: 'SET_ACTIVE_TOOL',
  SET_CANVAS_STATE: 'SET_CANVAS_STATE',
  SET_CAMERA: 'SET_CAMERA',
  SET_IS_DRAWING: 'SET_IS_DRAWING',
  SET_CURRENT_ELEMENT: 'SET_CURRENT_ELEMENT',
  SET_THEME: 'SET_THEME',
  TOGGLE_GRID: 'TOGGLE_GRID',
  SET_CURRENT_STYLE: 'SET_CURRENT_STYLE',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  UNDO: 'UNDO',
  REDO: 'REDO',
  TOGGLE_STYLING_PANEL: 'TOGGLE_STYLING_PANEL',
  TOGGLE_HELP_PANEL: 'TOGGLE_HELP_PANEL',
  SET_HELP_PANEL_URL: 'SET_HELP_PANEL_URL',
  CLEAR_CANVAS: 'CLEAR_CANVAS',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_ELEMENTS:
      return { ...state, elements: action.payload };
      
    case actionTypes.ADD_ELEMENT:
      return {
        ...state,
        elements: [...state.elements, action.payload]
      };
      
    case actionTypes.UPDATE_ELEMENT:
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.payload.id ? { ...el, ...action.payload.updates } : el
        )
      };
      
    case actionTypes.DELETE_ELEMENT:
      return {
        ...state,
        elements: state.elements.filter(el => el.id !== action.payload)
      };
      
    case actionTypes.SET_SELECTED_ELEMENTS:
      return { ...state, selectedElementIds: action.payload };
      
    case actionTypes.SET_ACTIVE_TOOL:
      return { 
        ...state, 
        activeTool: action.payload,
        selectedElementIds: action.payload === TOOL_TYPES.SELECT ? state.selectedElementIds : []
      };
      
    case actionTypes.SET_CANVAS_STATE:
      return { ...state, canvasState: action.payload };
      
    case actionTypes.SET_CAMERA:
      return { ...state, camera: { ...state.camera, ...action.payload } };
      
    case actionTypes.SET_IS_DRAWING:
      return { ...state, isDrawing: action.payload };
      
    case actionTypes.SET_CURRENT_ELEMENT:
      return { ...state, currentElement: action.payload };
      
    case actionTypes.SET_THEME:
      return { 
        ...state, 
        theme: action.payload,
        viewBackgroundColor: action.payload === THEMES.DARK ? '#1e1e1e' : '#ffffff'
      };
      
    case actionTypes.TOGGLE_GRID:
      return { ...state, showGrid: !state.showGrid };
      
    case actionTypes.SET_CURRENT_STYLE:
      return { ...state, currentStyle: { ...state.currentStyle, ...action.payload } };
      
    case actionTypes.ADD_TO_HISTORY:
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        history: [...newHistory, action.payload],
        historyIndex: newHistory.length
      };
      
    case actionTypes.UNDO:
      if (state.historyIndex > 0) {
        const previousState = state.history[state.historyIndex - 1];
        return {
          ...state,
          elements: previousState.elements,
          historyIndex: state.historyIndex - 1
        };
      }
      return state;
      
    case actionTypes.REDO:
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        return {
          ...state,
          elements: nextState.elements,
          historyIndex: state.historyIndex + 1
        };
      }
      return state;
      
    case actionTypes.TOGGLE_STYLING_PANEL:
      return { ...state, showStylingPanel: !state.showStylingPanel };
      
    case actionTypes.TOGGLE_HELP_PANEL:
      return { ...state, showHelpPanel: !state.showHelpPanel };
      
    case actionTypes.SET_HELP_PANEL_URL:
      return { ...state, helpPanelUrl: action.payload };
      
    case actionTypes.CLEAR_CANVAS:
      return { ...state, elements: [], selectedElementIds: [] };
      
    case actionTypes.RESET_STATE:
      return { ...initialState };
      
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    setElements: useCallback((elements) => {
      dispatch({ type: actionTypes.SET_ELEMENTS, payload: elements });
    }, []),

    addElement: useCallback((element) => {
      dispatch({ type: actionTypes.ADD_ELEMENT, payload: element });
    }, []),

    updateElement: useCallback((id, updates) => {
      dispatch({ type: actionTypes.UPDATE_ELEMENT, payload: { id, updates } });
    }, []),

    deleteElement: useCallback((id) => {
      dispatch({ type: actionTypes.DELETE_ELEMENT, payload: id });
    }, []),

    setSelectedElements: useCallback((ids) => {
      dispatch({ type: actionTypes.SET_SELECTED_ELEMENTS, payload: ids });
    }, []),

    setActiveTool: useCallback((tool) => {
      dispatch({ type: actionTypes.SET_ACTIVE_TOOL, payload: tool });
    }, []),

    setCanvasState: useCallback((state) => {
      dispatch({ type: actionTypes.SET_CANVAS_STATE, payload: state });
    }, []),

    setCamera: useCallback((camera) => {
      dispatch({ type: actionTypes.SET_CAMERA, payload: camera });
    }, []),

    setIsDrawing: useCallback((isDrawing) => {
      dispatch({ type: actionTypes.SET_IS_DRAWING, payload: isDrawing });
    }, []),

    setCurrentElement: useCallback((element) => {
      dispatch({ type: actionTypes.SET_CURRENT_ELEMENT, payload: element });
    }, []),

    setTheme: useCallback((theme) => {
      dispatch({ type: actionTypes.SET_THEME, payload: theme });
    }, []),

    toggleGrid: useCallback(() => {
      dispatch({ type: actionTypes.TOGGLE_GRID });
    }, []),

    setCurrentStyle: useCallback((style) => {
      dispatch({ type: actionTypes.SET_CURRENT_STYLE, payload: style });
    }, []),

    addToHistory: useCallback((snapshot) => {
      dispatch({ type: actionTypes.ADD_TO_HISTORY, payload: snapshot });
    }, []),

    undo: useCallback(() => {
      dispatch({ type: actionTypes.UNDO });
    }, []),

    redo: useCallback(() => {
      dispatch({ type: actionTypes.REDO });
    }, []),

    toggleStylingPanel: useCallback(() => {
      dispatch({ type: actionTypes.TOGGLE_STYLING_PANEL });
    }, []),

    toggleHelpPanel: useCallback(() => {
      dispatch({ type: actionTypes.TOGGLE_HELP_PANEL });
    }, []),

    setHelpPanelUrl: useCallback((url) => {
      dispatch({ type: actionTypes.SET_HELP_PANEL_URL, payload: url });
    }, []),

    clearCanvas: useCallback(() => {
      dispatch({ type: actionTypes.CLEAR_CANVAS });
    }, [])
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
