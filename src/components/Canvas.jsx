import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';
import { TOOL_TYPES, ELEMENT_TYPES, CANVAS_STATE, THEMES } from '../types/canvas';
import { createElement, screenToCanvas, isPointInElement, getElementBounds } from '../utils/canvasUtils';
import { drawElement } from '../utils/drawingUtils';
import TextInputModal from './TextInputModal';

const Canvas = () => {
  const canvasRef = useRef(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textPosition, setTextPosition] = useState(null);
  const [editingText, setEditingText] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const { state, actions } = useApp();
  const {
    elements,
    selectedElementIds,
    activeTool,
    canvasState,
    camera,
    isDrawing,
    currentElement,
    theme,
    showGrid,
    gridSize,
    currentStyle,
    viewBackgroundColor
  } = state;

  // Add element to history when it's added
  const addElementWithHistory = useCallback((element) => {
    const currentSnapshot = { elements: [...elements] };
    actions.addToHistory(currentSnapshot);
    actions.addElement(element);
  }, [elements, actions]);

  // Canvas drawing and event handling
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Set background
    context.fillStyle = viewBackgroundColor;
    context.fillRect(0, 0, width, height);

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(context, camera, gridSize, theme);
    }

    // Draw all elements
    elements.forEach(element => {
      if (!element.isDeleted) {
        const isSelected = selectedElementIds.includes(element.id);
        drawElement(context, element, camera, isSelected);
      }
    });

    // Draw current element being drawn
    if (currentElement) {
      drawElement(context, currentElement, camera, false);
    }
  }, [elements, selectedElementIds, camera, showGrid, gridSize, theme, viewBackgroundColor, currentElement]);

  // Draw grid helper
  const drawGrid = (context, camera, gridSize, theme) => {
    const { zoom, x, y } = camera;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;
    const scaledGridSize = gridSize * zoom;

    context.save();
    context.strokeStyle = theme === THEMES.DARK ? '#333' : '#e0e0e0';
    context.lineWidth = 0.5;

    const startX = Math.floor((-x % scaledGridSize));
    const startY = Math.floor((-y % scaledGridSize));

    // Vertical lines
    for (let x = startX; x < width; x += scaledGridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    // Horizontal lines
    for (let y = startY; y < height; y += scaledGridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    context.restore();
  };

  // Handle eraser functionality
  const handleErase = useCallback((canvasPoint) => {
    const elementToErase = elements
      .slice()
      .reverse()
      .find(element => !element.isDeleted && isPointInElement(canvasPoint.x, canvasPoint.y, element));

    if (elementToErase) {
      const currentSnapshot = { elements: [...elements] };
      actions.addToHistory(currentSnapshot);
      actions.deleteElement(elementToErase.id);
    }
  }, [elements, actions]);

  // Handle text submission
  const handleTextSubmit = useCallback((text) => {
    if (textPosition && text) {
      if (editingText) {
        // Update existing text
        const currentSnapshot = { elements: [...elements] };
        actions.addToHistory(currentSnapshot);
        actions.updateElement(editingText.id, { text });
        setEditingText(null);
      } else {
        // Create new text
        const newElement = createElement(
          ELEMENT_TYPES.TEXT,
          textPosition.x,
          textPosition.y,
          textPosition.x + text.length * 10, // Approximate width
          textPosition.y + 20, // Approximate height
          {
            ...currentStyle,
            text
          }
        );
        addElementWithHistory(newElement);
      }
    }
    setShowTextModal(false);
    setTextPosition(null);
    setEditingText(null);
  }, [textPosition, currentStyle, addElementWithHistory, editingText, elements, actions]);

  // Move selected elements
  const moveSelectedElements = useCallback((deltaX, deltaY) => {
    if (selectedElementIds.length === 0) return;

    const currentSnapshot = { elements: [...elements] };
    actions.addToHistory(currentSnapshot);

    selectedElementIds.forEach(id => {
      const element = elements.find(el => el.id === id);
      if (element) {
        const updates = {
          x1: element.x1 + deltaX,
          y1: element.y1 + deltaY,
          x2: element.x2 + deltaX,
          y2: element.y2 + deltaY
        };

        // Handle freedraw points
        if (element.type === ELEMENT_TYPES.FREEDRAW && element.points) {
          updates.points = element.points.map(point => ({
            x: point.x + deltaX,
            y: point.y + deltaY
          }));
        }

        actions.updateElement(id, updates);
      }
    });
  }, [selectedElementIds, elements, actions]);

  // Mouse event handlers
  const handleMouseDown = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;
    const canvasPoint = screenToCanvas(clientX, clientY, camera);

    if (activeTool === TOOL_TYPES.HAND || event.button === 1) {
      actions.setCanvasState(CANVAS_STATE.PANNING);
      return;
    }

    if (activeTool === TOOL_TYPES.ERASER) {
      handleErase(canvasPoint);
      return;
    }

    if (activeTool === TOOL_TYPES.SELECT) {
      // Find element under cursor (reverse order to get top element)
      const elementUnderCursor = elements
        .slice()
        .reverse()
        .find(element => !element.isDeleted && isPointInElement(canvasPoint.x, canvasPoint.y, element));

      if (elementUnderCursor) {
        // Handle double-click for text editing
        if (elementUnderCursor.type === ELEMENT_TYPES.TEXT) {
          const now = Date.now();
          const lastClick = canvas.lastClickTime || 0;
          if (now - lastClick < 300) { // Double click
            setEditingText(elementUnderCursor);
            setTextPosition({ x: elementUnderCursor.x1, y: elementUnderCursor.y1 });
            setShowTextModal(true);
            return;
          }
          canvas.lastClickTime = now;
        }

        // Select element if not already selected
        if (!selectedElementIds.includes(elementUnderCursor.id)) {
          actions.setSelectedElements([elementUnderCursor.id]);
        }
        
        // Start moving
        actions.setCanvasState(CANVAS_STATE.MOVING);
        setDragStart({ x: canvasPoint.x, y: canvasPoint.y });
      } else {
        // Clear selection
        actions.setSelectedElements([]);
      }
      return;
    }

    // Start drawing
    actions.setIsDrawing(true);
    actions.setCanvasState(CANVAS_STATE.DRAWING);

    let newElement;
    
    if (activeTool === TOOL_TYPES.PEN) {
      newElement = createElement(
        ELEMENT_TYPES.FREEDRAW,
        canvasPoint.x,
        canvasPoint.y,
        canvasPoint.x,
        canvasPoint.y,
        {
          ...currentStyle,
          points: [{ x: canvasPoint.x, y: canvasPoint.y }]
        }
      );
    } else if (activeTool === TOOL_TYPES.TEXT) {
      setTextPosition(canvasPoint);
      setShowTextModal(true);
      actions.setIsDrawing(false);
      actions.setCanvasState(CANVAS_STATE.IDLE);
      return;
    } else {
      // Other drawing tools
      const elementType = getElementTypeFromTool(activeTool);
      if (elementType) {
        newElement = createElement(
          elementType,
          canvasPoint.x,
          canvasPoint.y,
          canvasPoint.x,
          canvasPoint.y,
          currentStyle
        );
      }
    }

    if (newElement) {
      actions.setCurrentElement(newElement);
    }
  }, [activeTool, camera, elements, selectedElementIds, currentStyle, actions, handleErase]);

  const handleMouseMove = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;
    const canvasPoint = screenToCanvas(clientX, clientY, camera);

    if (canvasState === CANVAS_STATE.PANNING) {
      actions.setCamera({
        x: camera.x + event.movementX,
        y: camera.y + event.movementY
      });
      return;
    }

    if (canvasState === CANVAS_STATE.MOVING && dragStart) {
      const deltaX = canvasPoint.x - dragStart.x;
      const deltaY = canvasPoint.y - dragStart.y;
      moveSelectedElements(deltaX, deltaY);
      setDragStart({ x: canvasPoint.x, y: canvasPoint.y });
      return;
    }

    if (activeTool === TOOL_TYPES.ERASER && event.buttons === 1) {
      handleErase(canvasPoint);
      return;
    }

    if (!isDrawing || !currentElement) return;

    if (activeTool === TOOL_TYPES.PEN) {
      // Add point to freedraw path
      const updatedElement = {
        ...currentElement,
        points: [...currentElement.points, { x: canvasPoint.x, y: canvasPoint.y }]
      };
      actions.setCurrentElement(updatedElement);
    } else {
      // Update end coordinates for shapes
      const updatedElement = {
        ...currentElement,
        x2: canvasPoint.x,
        y2: canvasPoint.y
      };
      actions.setCurrentElement(updatedElement);
    }
  }, [canvasState, isDrawing, currentElement, activeTool, camera, actions, handleErase, dragStart, moveSelectedElements]);

  const handleMouseUp = useCallback(() => {
    if (canvasState === CANVAS_STATE.PANNING) {
      actions.setCanvasState(CANVAS_STATE.IDLE);
      return;
    }

    if (canvasState === CANVAS_STATE.MOVING) {
      actions.setCanvasState(CANVAS_STATE.IDLE);
      setDragStart(null);
      return;
    }

    if (isDrawing && currentElement) {
      addElementWithHistory(currentElement);
      actions.setCurrentElement(null);
    }

    actions.setIsDrawing(false);
    actions.setCanvasState(CANVAS_STATE.IDLE);
    setDragStart(null);
  }, [canvasState, isDrawing, currentElement, actions, addElementWithHistory]);

  // Wheel event for zooming
  const handleWheel = useCallback((event) => {
    event.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(camera.zoom * zoomFactor, 0.1), 5);

    // Zoom towards cursor position
    const zoomRatio = newZoom / camera.zoom;
    const newX = clientX - (clientX - camera.x) * zoomRatio;
    const newY = clientY - (clientY - camera.y) * zoomRatio;

    actions.setCamera({
      x: newX,
      y: newY,
      zoom: newZoom
    });
  }, [camera, actions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault();
            actions.undo();
            break;
          case 'y':
            event.preventDefault();
            actions.redo();
            break;
          case 'a':
            event.preventDefault();
            actions.setSelectedElements(elements.filter(el => !el.isDeleted).map(el => el.id));
            break;
          case 'g':
            event.preventDefault();
            actions.toggleGrid();
            break;
          default:
            break;
        }
        return;
      }

      // Tool shortcuts
      switch (event.key) {
        case 'v':
          actions.setActiveTool(TOOL_TYPES.SELECT);
          break;
        case 'p':
          actions.setActiveTool(TOOL_TYPES.PEN);
          break;
        case 'r':
          actions.setActiveTool(TOOL_TYPES.RECTANGLE);
          break;
        case 'o':
          actions.setActiveTool(TOOL_TYPES.ELLIPSE);
          break;
        case 'd':
          actions.setActiveTool(TOOL_TYPES.DIAMOND);
          break;
        case 'l':
          actions.setActiveTool(TOOL_TYPES.LINE);
          break;
        case 'a':
          if (!event.ctrlKey && !event.metaKey) {
            actions.setActiveTool(TOOL_TYPES.ARROW);
          }
          break;
        case 't':
          actions.setActiveTool(TOOL_TYPES.TEXT);
          break;
        case 'h':
          actions.setActiveTool(TOOL_TYPES.HAND);
          break;
        case 'e':
          actions.setActiveTool(TOOL_TYPES.ERASER);
          break;
        case 'Delete':
        case 'Backspace':
          if (selectedElementIds.length > 0) {
            const currentSnapshot = { elements: [...elements] };
            actions.addToHistory(currentSnapshot);
            selectedElementIds.forEach(id => actions.deleteElement(id));
            actions.setSelectedElements([]);
          }
          break;
        case 'Escape':
          actions.setSelectedElements([]);
          actions.setActiveTool(TOOL_TYPES.SELECT);
          setShowTextModal(false);
          setEditingText(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, elements, selectedElementIds]);

  // Resize canvas
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { devicePixelRatio = 1 } = window;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext('2d');
      context.scale(devicePixelRatio, devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Redraw canvas when state changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Helper function to get element type from tool
  const getElementTypeFromTool = (tool) => {
    switch (tool) {
      case TOOL_TYPES.RECTANGLE:
        return ELEMENT_TYPES.RECTANGLE;
      case TOOL_TYPES.ELLIPSE:
        return ELEMENT_TYPES.ELLIPSE;
      case TOOL_TYPES.DIAMOND:
        return ELEMENT_TYPES.DIAMOND;
      case TOOL_TYPES.LINE:
        return ELEMENT_TYPES.LINE;
      case TOOL_TYPES.ARROW:
        return ELEMENT_TYPES.ARROW;
      default:
        return null;
    }
  };

  const getCursorStyle = () => {
    switch (activeTool) {
      case TOOL_TYPES.HAND:
        return canvasState === CANVAS_STATE.PANNING ? 'grabbing' : 'grab';
      case TOOL_TYPES.ERASER:
        return 'crosshair';
      case TOOL_TYPES.TEXT:
        return 'text';
      case TOOL_TYPES.SELECT:
        return canvasState === CANVAS_STATE.MOVING ? 'move' : 'default';
      default:
        return 'crosshair';
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: getCursorStyle()
        }}
      />
      
      <TextInputModal
        isOpen={showTextModal}
        onClose={() => {
          setShowTextModal(false);
          setTextPosition(null);
          setEditingText(null);
        }}
        onSubmit={handleTextSubmit}
        position={textPosition}
        initialText={editingText?.text || ''}
      />
    </>
  );
};

export default Canvas;