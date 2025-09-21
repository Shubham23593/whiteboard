// Image import functionality
export const importImage = (file, canvas, camera) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject('Only image files are supported');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const element = {
          id: crypto.randomUUID(),
          type: 'image',
          x1: (canvas.width / 2 - img.width / 2) / camera.zoom - camera.x / camera.zoom,
          y1: (canvas.height / 2 - img.height / 2) / camera.zoom - camera.y / camera.zoom,
          x2: (canvas.width / 2 + img.width / 2) / camera.zoom - camera.x / camera.zoom,
          y2: (canvas.height / 2 + img.height / 2) / camera.zoom - camera.y / camera.zoom,
          image: img,
          width: img.width,
          height: img.height,
          opacity: 100,
          locked: false
        };
        resolve(element);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Text file import functionality
export const importTextFile = (file, canvas, camera) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('text/')) {
      reject('Only text files are supported');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const element = {
        id: crypto.randomUUID(),
        type: 'text',
        x1: canvas.width / 2 / camera.zoom - camera.x / camera.zoom,
        y1: canvas.height / 2 / camera.zoom - camera.y / camera.zoom,
        text: text,
        fontSize: 16,
        fontFamily: 'Arial',
        strokeColor: '#000000',
        opacity: 100,
        locked: false
      };
      // Calculate text bounds
      const lines = text.split('\n');
      const maxLineLength = Math.max(...lines.map(line => line.length));
      element.x2 = element.x1 + (maxLineLength * element.fontSize * 0.6);
      element.y2 = element.y1 + (lines.length * element.fontSize * 1.2);
      
      resolve(element);
    };
    reader.readAsText(file);
  });
};