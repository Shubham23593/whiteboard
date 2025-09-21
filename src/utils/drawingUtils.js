import rough from 'roughjs';
import { ELEMENT_TYPES, STROKE_STYLES } from '../types/canvas.js';

// Create rough.js generator
let roughGenerator = null;

export const getRoughGenerator = () => {
  if (!roughGenerator) {
    roughGenerator = rough.generator();
  }
  return roughGenerator;
};

// Draw element on canvas
export const drawElement = (context, element, camera, isSelected = false) => {
  context.save();
  
  // Apply camera transformation
  context.scale(camera.zoom, camera.zoom);
  context.translate(camera.x / camera.zoom, camera.y / camera.zoom);
  
  // Set common styles
  context.globalAlpha = element.opacity / 100;
  context.strokeStyle = element.strokeColor;
  context.fillStyle = element.backgroundColor !== 'transparent' ? element.backgroundColor : 'transparent';
  context.lineWidth = element.strokeWidth;
  
  // Set stroke style
  if (element.strokeStyle === STROKE_STYLES.DASHED) {
    context.setLineDash([5, 5]);
  } else if (element.strokeStyle === STROKE_STYLES.DOTTED) {
    context.setLineDash([2, 2]);
  } else {
    context.setLineDash([]);
  }

  const { x1, y1, x2, y2 } = element;

  switch (element.type) {
    case ELEMENT_TYPES.RECTANGLE:
      drawRectangle(context, x1, y1, x2 - x1, y2 - y1, element);
      break;
    case ELEMENT_TYPES.ELLIPSE:
      drawEllipse(context, x1, y1, x2 - x1, y2 - y1, element);
      break;
    case ELEMENT_TYPES.DIAMOND:
      drawDiamond(context, x1, y1, x2 - x1, y2 - y1, element);
      break;
    case ELEMENT_TYPES.LINE:
      drawLine(context, x1, y1, x2, y2, element);
      break;
    case ELEMENT_TYPES.ARROW:
      drawArrow(context, x1, y1, x2, y2, element);
      break;
    case ELEMENT_TYPES.TEXT:
      drawText(context, element);
      break;
    case ELEMENT_TYPES.FREEDRAW:
      drawFreedraw(context, element);
      break;
    default:
      break;
  }

  // Draw selection outline if selected
  if (isSelected) {
    drawSelectionOutline(context, element);
  }

  context.restore();
};

const drawRectangle = (context, x, y, width, height, element) => {
  if (element.backgroundColor !== 'transparent') {
    context.fillRect(x, y, width, height);
  }
  context.strokeRect(x, y, width, height);
};

const drawEllipse = (context, x, y, width, height, element) => {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radiusX = Math.abs(width) / 2;
  const radiusY = Math.abs(height) / 2;

  context.beginPath();
  context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  
  if (element.backgroundColor !== 'transparent') {
    context.fill();
  }
  context.stroke();
};

const drawDiamond = (context, x, y, width, height, element) => {
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  context.beginPath();
  context.moveTo(centerX, y);
  context.lineTo(x + width, centerY);
  context.lineTo(centerX, y + height);
  context.lineTo(x, centerY);
  context.closePath();

  if (element.backgroundColor !== 'transparent') {
    context.fill();
  }
  context.stroke();
};

const drawLine = (context, x1, y1, x2, y2, element) => {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
};

const drawArrow = (context, x1, y1, x2, y2, element) => {
  // Draw line
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();

  // Draw arrowhead
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowLength = 15;
  const arrowAngle = Math.PI / 6;

  context.beginPath();
  context.moveTo(x2, y2);
  context.lineTo(
    x2 - arrowLength * Math.cos(angle - arrowAngle),
    y2 - arrowLength * Math.sin(angle - arrowAngle)
  );
  context.moveTo(x2, y2);
  context.lineTo(
    x2 - arrowLength * Math.cos(angle + arrowAngle),
    y2 - arrowLength * Math.sin(angle + arrowAngle)
  );
  context.stroke();
};

const drawText = (context, element) => {
  context.font = `${element.fontSize}px ${element.fontFamily}`;
  context.textAlign = element.textAlign;
  context.textBaseline = 'top';
  context.fillStyle = element.strokeColor;
  context.fillText(element.text, element.x1, element.y1);
};

const drawFreedraw = (context, element) => {
  if (!element.points || element.points.length < 2) return;

  context.beginPath();
  context.moveTo(element.points[0].x, element.points[0].y);
  
  for (let i = 1; i < element.points.length; i++) {
    context.lineTo(element.points[i].x, element.points[i].y);
  }
  
  context.stroke();
};

const drawSelectionOutline = (context, element) => {
  context.save();
  context.strokeStyle = '#1971c2';
  context.lineWidth = 1;
  context.setLineDash([5, 5]);

  const bounds = getElementBounds(element);
  const padding = 5;
  
  context.strokeRect(
    bounds.x - padding,
    bounds.y - padding,
    bounds.width + padding * 2,
    bounds.height + padding * 2
  );

  context.restore();
};

// Helper function to get element bounds
const getElementBounds = (element) => {
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
