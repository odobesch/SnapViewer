let canvas;
let isDrawing = false;
let isDrawingToolActive = false;
let currentTool = null;
let startX, startY;
let rect;

window.selectedImagePath = '';

window.initializeCanvas = function (imagePath, annotationsJson, imageId) {
    if (!imagePath) {
        console.error("No image path provided for canvas initialization.");
        return;
    }

    const canvasElement = document.getElementById("annotationCanvas");
    canvas = new fabric.Canvas(canvasElement);

    const img = new Image();
    img.src = '';
    img.src = imagePath;

    img.onload = function () {
        console.log(`Image loaded successfully: ${imagePath}`);

        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        
        canvas.setBackgroundImage(img.src, canvas.renderAll.bind(canvas), {
            originX: 'center',
            originY: 'center',
            top: canvas.height / 2,
            left: canvas.width / 2,
            scaleX: scale,
            scaleY: scale
        });

        if (annotationsJson) {
            drawAnnotations(annotationsJson, imageId);
        } else {
            console.warn("No annotations to draw.");
        }

        isDrawing = false;

        setupMouseEvents(imageId);
        setupDeleteEvent();
    };

    img.onerror = function () {
        console.error("Failed to load image: " + imagePath);
    };
};

window.setSelectedImagePath = function (imagePath) {
    selectedImagePath = imagePath;
};

function setupMouseEvents(imgId) {
    canvas.on('mouse:down', function (options) {
        if (currentTool === "rectangle") {
            const target = canvas.findTarget(options.e);
            if (target && target.type === "rect") {
                return;
            }

            startX = options.pointer.x;
            startY = options.pointer.y;
            isDrawing = true;

            rect = new fabric.Rect({
                imageId: imgId,
                left: startX,
                top: startY,
                fill: 'transparent',
                stroke: 'red',
                strokeWidth: 2,
                selectable: true,
                hasControls: true
            });

            canvas.add(rect);
        }
    });

    canvas.on('mouse:move', function (options) {
        if (!isDrawing || !rect) return;

        const pointer = canvas.getPointer(options.e);
        const width = pointer.x - startX;
        const height = pointer.y - startY;
       
        rect.set({
            width: Math.abs(width),
            height: Math.abs(height),
            left: width < 0 ? pointer.x : startX,
            top: height < 0 ? pointer.y : startY,
        });
        canvas.renderAll();
    });

    canvas.on('mouse:up', function () {
        isDrawing = false;
        if (rect) {
            rect.setCoords();
            canvas.setActiveObject(rect);
            canvas.hoverCursor = 'default';
            canvas.defaultCursor = 'default';
            currentTool = null;
        }
    });

    canvas.on('object:moving', function (e) {
        const target = e.target;
        if (target && target.type === "rect") {
            const objects = canvas.getObjects();
            objects.forEach(obj => {
                if (obj !== target && obj.intersectsWithObject(target)) {
                    target.left = target.previousLeft;
                    target.top = target.previousTop;
                }
            });
        }
    });
}

window.setDrawingTool = function () { 
    currentTool = "rectangle";
    canvas.hoverCursor = 'crosshair';
    canvas.defaultCursor = 'crosshair';
    isDrawingToolActive = true;
};

function setupDeleteEvent() {
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Delete') {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.remove(activeObject);
            }
        }
    });

    canvas.on('selection:created', function (e) {
        const selectedObject = e.target;
        if (selectedObject && selectedObject.type === 'rect') {
            selectedObject.set('stroke', 'yellow');
            canvas.renderAll();
        }
    });

    canvas.on('selection:cleared', function () {
        const objects = canvas.getObjects();
        objects.forEach((obj) => {
            if (obj.type === 'rect') {
                obj.set('stroke', 'red');
            }
        });
        canvas.renderAll();
    });

    canvas.on('object:selected', function (e) {
        const selectedObject = e.target;
        if (selectedObject && selectedObject.type === 'rect') {
            selectedObject.set('stroke', 'yellow');
            canvas.renderAll();
        }
    });

    canvas.on('object:removed', function (e) {
        const objects = canvas.getObjects();
        objects.forEach((obj) => {
            if (obj.type === 'rect') {
                obj.set('stroke', 'red');
            }
        });
        canvas.renderAll();
    });
}

window.drawAnnotations = function (annotationsJson, imageId) {
    if (!canvas) {
        console.error("Canvas is not initialized.");
        return;
    }

    try {
        const annotations = JSON.parse(annotationsJson);
        console.log('Parsed annotations:', annotations);
        console.log('Image Id:', imageId);

        annotations.forEach((annotation) => {
            if (annotation.x !== undefined && annotation.y !== undefined &&
                annotation.width !== undefined && annotation.height !== undefined) {
                const rect = new fabric.Rect({
                    id: annotation.id,
                    imageId: imageId,
                    left: annotation.x,
                    top: annotation.y,
                    width: annotation.width,
                    height: annotation.height,
                    fill: 'transparent',
                    stroke: 'red',
                    strokeWidth: 2
                });

                canvas.add(rect);
            } else {
                console.warn('Missing properties in annotation:', annotation);
            }
        });

        canvas.renderAll();
    } catch (error) {
        console.error('Error parsing annotations or drawing on canvas:', error);
    }
};

function getAnnotations() {
    const annotations = canvas.getObjects().map(a => ({
        Id: a.id || 0,
        ImageId: a.imageId || 0,
        X: a.left,
        Y: a.top,
        Width: a.width,
        Height: a.height
    }));
    console.log("Annotations to save:", annotations);
    return JSON.stringify(annotations);
}

window.updateAnnotation = function (annotationId, newProps) {
    const annotation = canvas.getObjects().find(obj => obj.id === annotationId);
    if (annotation) {
        annotation.set(newProps);
        canvas.renderAll();
    }
};

window.deleteAnnotation = function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
    } else {
        console.log("No active object selected for deletion.");
    }
};

window.showSpinner = function () {
    document.getElementById("loadingSpinner").style.display = "block";
};

window.hideSpinner = function () {
    document.getElementById("loadingSpinner").style.display = "none";
};