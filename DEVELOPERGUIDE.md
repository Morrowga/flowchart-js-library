# Flowchart Library - Developer Guide

Complete developer documentation for integrating the Flowchart Library into your applications.

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Electron Integration](#electron-integration)
- [Vue Integration](#vue-integration)
- [React Integration](#react-integration)
- [Configuration Options](#configuration-options)
- [Methods](#methods)
- [Events](#events)
- [Advanced Usage](#advanced-usage)
- [Build and Distribution](#build-and-distribution)

---

## 📦 Installation

### NPM Installation

```bash
npm install flowchart-lib
```

### Manual Installation

1. Download the library files
2. Include in your project:

```html
<!-- UMD Build -->
<script src="path/to/flowchart-lib.umd.js"></script>

<!-- ES Module -->
<script type="module">
  import { Canvas } from 'path/to/flowchart-lib.esm.js';
</script>
```

### Dependencies

**Required:**
- Modern browser with Canvas API support
- ES6+ JavaScript environment

**Optional:**
- jsPDF library (for PDF export functionality)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

---

## 🚀 Quick Start

### Basic HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>Flowchart App</title>
  <style>
    #canvas-container {
      width: 100%;
      height: 600px;
    }
  </style>
</head>
<body>
  <div id="canvas-container"></div>
  
  <script src="flowchart-lib.umd.js"></script>
  <script>
    // Initialize
    const flowchart = new FlowchartLib.Canvas('canvas-container', {
      mode: 'edit',
      pixelRatio: 2
    });
    
    // Add nodes
    const startNode = flowchart.addNode('start', 'Start', 100, 150);
    const processNode = flowchart.addNode('process', 'Process', 300, 150);
    const endNode = flowchart.addNode('end', 'End', 500, 150);
    
    // Create connections
    flowchart.addConnection(startNode, 'right', processNode, 'left');
    flowchart.addConnection(processNode, 'right', endNode, 'left');
  </script>
</body>
</html>
```

### ES Module

```javascript
import { Canvas, Node, Connection } from 'flowchart-lib';

const flowchart = new Canvas('canvas-container', {
  mode: 'edit',
  pixelRatio: window.devicePixelRatio
});

// Add your nodes and connections
flowchart.addNode('start', 'Begin', 100, 100);
```

---

## 📚 API Reference

### Constructor

```javascript
new Canvas(containerId, options)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `containerId` | `string` | ID of the HTML element to contain the canvas |
| `options` | `object` | Configuration options (optional) |

**Options Object:**

```javascript
{
  mode: 'edit',           // 'edit' or 'view'
  width: null,            // Canvas width in pixels (null = auto)
  height: null,           // Canvas height in pixels (null = auto)
  readonly: false,        // Disable all interactions
  pixelRatio: 2           // Device pixel ratio for high-DPI displays
}
```

---

## 🔧 Configuration Options

### Mode Options

#### Edit Mode (default)
```javascript
const flowchart = new Canvas('container', {
  mode: 'edit'
});
```
- Full editing capabilities
- Users can add, move, delete, and connect nodes
- All keyboard shortcuts enabled

#### View Mode
```javascript
const flowchart = new Canvas('container', {
  mode: 'view'
});
```
- Display only, no editing
- Good for presentations or read-only displays

#### Readonly Mode
```javascript
const flowchart = new Canvas('container', {
  readonly: true
});
```
- No mouse or keyboard interactions
- Canvas is completely static

### Responsive Canvas

For fullscreen or responsive layouts:

```javascript
const flowchart = new Canvas('container', {
  width: null,   // Auto-size to container width
  height: null   // Auto-size to container height
});
```

```css
#container {
  width: 100%;
  height: 100vh; /* or any size */
}
```

### High-DPI Support

For crisp rendering on Retina and 4K displays:

```javascript
const flowchart = new Canvas('container', {
  pixelRatio: window.devicePixelRatio || 2
});
```

---

## 🎯 Methods

### Node Management

#### addNode(type, text, x, y)
Add a new node to the canvas.

```javascript
const node = flowchart.addNode('process', 'My Process', 200, 150);
```

**Parameters:**
- `type` (string): Node type - `'start'`, `'process'`, `'decision'`, or `'end'`
- `text` (string): Text label for the node
- `x` (number): X coordinate
- `y` (number): Y coordinate

**Returns:** Node object

**Node Types:**
- `start` - Green oval
- `process` - Blue rectangle
- `decision` - Yellow diamond
- `end` - Red oval

#### deleteNode(node)
Remove a node and all its connections.

```javascript
flowchart.deleteNode(node);
```

**Parameters:**
- `node` (Node): Node object to delete

### Connection Management

#### addConnection(fromNode, fromPort, toNode, toPort)
Create a connection between two nodes.

```javascript
flowchart.addConnection(node1, 'right', node2, 'left');
```

**Parameters:**
- `fromNode` (Node): Source node
- `fromPort` (string): Port position - `'top'`, `'right'`, `'bottom'`, `'left'`
- `toNode` (Node): Target node
- `toPort` (string): Port position - `'top'`, `'right'`, `'bottom'`, `'left'`

**Returns:** Connection object or `null` if connection already exists

#### deleteConnection(connection)
Remove a connection.

```javascript
flowchart.deleteConnection(connection);
```

### Canvas Operations

#### clear()
Clear all nodes and connections.

```javascript
flowchart.clear();
```

#### render()
Manually trigger a canvas re-render.

```javascript
flowchart.render();
```

### History Operations

#### undo()
Undo the last action.

```javascript
flowchart.undo();
```

#### redo()
Redo an undone action.

```javascript
flowchart.redo();
```

### Export Methods

#### exportToJSON()
Export flowchart data as JSON string.

```javascript
const jsonData = flowchart.exportToJSON();
console.log(jsonData);

// Save to file
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'flowchart.json';
a.click();
```

**Returns:** JSON string

#### importFromJSON(jsonString)
Import flowchart from JSON string.

```javascript
const jsonData = '{"nodes":[...],"connections":[...]}';
flowchart.importFromJSON(jsonData);
```

**Parameters:**
- `jsonString` (string): JSON string in the correct format

#### exportToPNG()
Export as PNG image data URL.

```javascript
const pngUrl = flowchart.exportToPNG();

// Download PNG
const a = document.createElement('a');
a.href = pngUrl;
a.download = 'flowchart.png';
a.click();
```

**Returns:** Data URL string

#### exportToPDF()
Export as PDF document (requires jsPDF).

```javascript
const pdf = flowchart.exportToPDF();
pdf.save('flowchart.pdf');
```

**Returns:** jsPDF object

### Cleanup

#### destroy()
Clean up event listeners and remove canvas.

```javascript
flowchart.destroy();
```

---

## 💻 Electron Integration

### Basic Electron Setup

**main.js**
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
```

**index.html**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Flowchart Editor</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    #container {
      width: 100vw;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="container"></div>
  
  <script src="flowchart-lib.umd.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

**app.js**
```javascript
const flowchart = new FlowchartLib.Canvas('container', {
  mode: 'edit',
  pixelRatio: 2
});

// Add sample flowchart
const start = flowchart.addNode('start', 'Start', 100, 100);
const process = flowchart.addNode('process', 'Process', 300, 100);
const end = flowchart.addNode('end', 'End', 500, 100);

flowchart.addConnection(start, 'right', process, 'left');
flowchart.addConnection(process, 'right', end, 'left');
```

### File Menu Integration

**main.js**
```javascript
const { app, BrowserWindow, Menu, dialog } = require('electron');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-flowchart');
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [{ name: 'JSON', extensions: ['json'] }]
            }).then(result => {
              if (!result.canceled && result.filePaths.length > 0) {
                const data = fs.readFileSync(result.filePaths[0], 'utf-8');
                mainWindow.webContents.send('load-flowchart', data);
              }
            });
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);
```

**preload.js**
```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onSave: (callback) => ipcRenderer.on('save-flowchart', callback),
  onLoad: (callback) => ipcRenderer.on('load-flowchart', callback)
});
```

**app.js**
```javascript
const flowchart = new FlowchartLib.Canvas('container', {
  mode: 'edit',
  pixelRatio: 2
});

// Save handler
window.electronAPI.onSave(() => {
  const jsonData = flowchart.exportToJSON();
  // Send back to main process to save file
  console.log('Saving:', jsonData);
});

// Load handler
window.electronAPI.onLoad((event, jsonData) => {
  flowchart.importFromJSON(jsonData);
});
```

---

## 🎨 Vue Integration

### Vue 3 Composition API

**FlowchartEditor.vue**
```vue
<template>
  <div class="flowchart-editor">
    <div class="toolbar">
      <button @click="addStart">Add Start</button>
      <button @click="addProcess">Add Process</button>
      <button @click="addDecision">Add Decision</button>
      <button @click="addEnd">Add End</button>
      <button @click="exportJSON">Export JSON</button>
      <button @click="exportPNG">Export PNG</button>
    </div>
    
    <div ref="canvasContainer" class="canvas-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Canvas } from 'flowchart-lib';

const canvasContainer = ref(null);
let flowchart = null;
let nodeX = 100;

onMounted(() => {
  // Initialize flowchart
  flowchart = new Canvas(canvasContainer.value, {
    mode: 'edit',
    pixelRatio: 2
  });
});

onUnmounted(() => {
  if (flowchart) {
    flowchart.destroy();
  }
});

const addStart = () => {
  flowchart.addNode('start', 'Start', nodeX, 150);
  nodeX += 150;
};

const addProcess = () => {
  flowchart.addNode('process', 'Process', nodeX, 150);
  nodeX += 150;
};

const addDecision = () => {
  flowchart.addNode('decision', 'Decision?', nodeX, 150);
  nodeX += 150;
};

const addEnd = () => {
  flowchart.addNode('end', 'End', nodeX, 150);
  nodeX += 150;
};

const exportJSON = () => {
  const data = flowchart.exportToJSON();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flowchart.json';
  a.click();
  URL.revokeObjectURL(url);
};

const exportPNG = () => {
  const url = flowchart.exportToPNG();
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flowchart.png';
  a.click();
};

// Expose methods to parent component
defineExpose({
  flowchart,
  exportJSON,
  exportPNG
});
</script>

<style scoped>
.flowchart-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.toolbar {
  display: flex;
  gap: 10px;
  padding: 15px;
  background: white;
  border-bottom: 1px solid #ddd;
}

.toolbar button {
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.toolbar button:hover {
  background: #1976D2;
}

.canvas-container {
  flex: 1;
  position: relative;
}
</style>
```

### Vue 2 Options API

**FlowchartEditor.vue**
```vue
<template>
  <div class="flowchart-editor">
    <div class="toolbar">
      <button @click="addStart">Add Start</button>
      <button @click="addProcess">Add Process</button>
      <button @click="addDecision">Add Decision</button>
      <button @click="addEnd">Add End</button>
    </div>
    
    <div ref="canvasContainer" class="canvas-container"></div>
  </div>
</template>

<script>
import { Canvas } from 'flowchart-lib';

export default {
  name: 'FlowchartEditor',
  
  data() {
    return {
      flowchart: null,
      nodeX: 100
    };
  },
  
  mounted() {
    this.flowchart = new Canvas(this.$refs.canvasContainer, {
      mode: 'edit',
      pixelRatio: 2
    });
  },
  
  beforeDestroy() {
    if (this.flowchart) {
      this.flowchart.destroy();
    }
  },
  
  methods: {
    addStart() {
      this.flowchart.addNode('start', 'Start', this.nodeX, 150);
      this.nodeX += 150;
    },
    
    addProcess() {
      this.flowchart.addNode('process', 'Process', this.nodeX, 150);
      this.nodeX += 150;
    },
    
    addDecision() {
      this.flowchart.addNode('decision', 'Decision?', this.nodeX, 150);
      this.nodeX += 150;
    },
    
    addEnd() {
      this.flowchart.addNode('end', 'End', this.nodeX, 150);
      this.nodeX += 150;
    },
    
    exportData() {
      return this.flowchart.exportToJSON();
    },
    
    importData(jsonData) {
      this.flowchart.importFromJSON(jsonData);
    }
  }
};
</script>

<style scoped>
/* Same styles as Vue 3 version */
</style>
```

### Usage in Parent Component

```vue
<template>
  <div id="app">
    <FlowchartEditor ref="editor" />
    
    <button @click="saveFlowchart">Save</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FlowchartEditor from './components/FlowchartEditor.vue';

const editor = ref(null);

const saveFlowchart = () => {
  const data = editor.value.flowchart.exportToJSON();
  console.log('Saved:', data);
  // Save to backend or localStorage
};
</script>
```

---

## ⚛️ React Integration

### React Functional Component

**FlowchartEditor.jsx**
```jsx
import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from 'flowchart-lib';
import './FlowchartEditor.css';

const FlowchartEditor = () => {
  const containerRef = useRef(null);
  const flowchartRef = useRef(null);
  const [nodeX, setNodeX] = useState(100);

  useEffect(() => {
    // Initialize flowchart
    if (containerRef.current && !flowchartRef.current) {
      flowchartRef.current = new Canvas(containerRef.current, {
        mode: 'edit',
        pixelRatio: window.devicePixelRatio || 2
      });
    }

    // Cleanup
    return () => {
      if (flowchartRef.current) {
        flowchartRef.current.destroy();
      }
    };
  }, []);

  const addNode = (type, text) => {
    if (flowchartRef.current) {
      flowchartRef.current.addNode(type, text, nodeX, 150);
      setNodeX(prev => (prev + 150 > 700 ? 100 : prev + 150));
    }
  };

  const exportJSON = () => {
    if (flowchartRef.current) {
      const data = flowchartRef.current.exportToJSON();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowchart.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportPNG = () => {
    if (flowchartRef.current) {
      const url = flowchartRef.current.exportToPNG();
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowchart.png';
      a.click();
    }
  };

  return (
    <div className="flowchart-editor">
      <div className="toolbar">
        <button onClick={() => addNode('start', 'Start')}>Add Start</button>
        <button onClick={() => addNode('process', 'Process')}>Add Process</button>
        <button onClick={() => addNode('decision', 'Decision?')}>Add Decision</button>
        <button onClick={() => addNode('end', 'End')}>Add End</button>
        <button onClick={exportJSON}>Export JSON</button>
        <button onClick={exportPNG}>Export PNG</button>
      </div>
      
      <div ref={containerRef} className="canvas-container" />
    </div>
  );
};

export default FlowchartEditor;
```

**FlowchartEditor.css**
```css
.flowchart-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.toolbar {
  display: flex;
  gap: 10px;
  padding: 15px;
  background: white;
  border-bottom: 1px solid #ddd;
}

.toolbar button {
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.toolbar button:hover {
  background: #1976D2;
}

.canvas-container {
  flex: 1;
  position: relative;
}
```

---

## 🔄 Events

The library doesn't currently expose custom events, but you can monitor state changes through methods:

### Custom Event Wrapper

```javascript
class FlowchartWithEvents extends Canvas {
  constructor(containerId, options) {
    super(containerId, options);
    this.listeners = {};
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
  
  addNode(...args) {
    const node = super.addNode(...args);
    this.emit('nodeAdded', node);
    return node;
  }
  
  deleteNode(node) {
    super.deleteNode(node);
    this.emit('nodeDeleted', node);
  }
  
  addConnection(...args) {
    const conn = super.addConnection(...args);
    this.emit('connectionAdded', conn);
    return conn;
  }
  
  deleteConnection(conn) {
    super.deleteConnection(conn);
    this.emit('connectionDeleted', conn);
  }
}

// Usage
const flowchart = new FlowchartWithEvents('container');

flowchart.on('nodeAdded', (node) => {
  console.log('Node added:', node);
});

flowchart.on('nodeDeleted', (node) => {
  console.log('Node deleted:', node);
});
```

---

## 🎯 Advanced Usage

### Custom Node Colors

Modify Node.js to add custom colors:

```javascript
// In Node.js
getColors() {
  const colors = {
    'start': { fill: '#4CAF50', border: '#388E3C' },
    'process': { fill: '#2196F3', border: '#1976D2' },
    'decision': { fill: '#FFC107', border: '#FFA000' },
    'end': { fill: '#F44336', border: '#D32F2F' },
    // Add custom types
    'custom': { fill: '#9C27B0', border: '#7B1FA2' }
  };
  return colors[this.type] || colors['process'];
}
```

### Programmatic Flowchart Creation

```javascript
function createSampleFlowchart(canvas) {
  // Create nodes
  const nodes = {
    start: canvas.addNode('start', 'Start', 100, 100),
    check: canvas.addNode('decision', 'Valid?', 300, 100),
    process: canvas.addNode('process', 'Process', 500, 100),
    error: canvas.addNode('process', 'Error', 300, 250),
    end: canvas.addNode('end', 'End', 500, 250)
  };
  
  // Create connections
  canvas.addConnection(nodes.start, 'right', nodes.check, 'left');
  canvas.addConnection(nodes.check, 'right', nodes.process, 'left');
  canvas.addConnection(nodes.check, 'bottom', nodes.error, 'top');
  canvas.addConnection(nodes.process, 'bottom', nodes.end, 'top');
  canvas.addConnection(nodes.error, 'right', nodes.end, 'left');
  
  return nodes;
}

// Usage
const flowchart = new Canvas('container');
const nodes = createSampleFlowchart(flowchart);
```

### Auto-Layout Algorithm

```javascript
function autoLayout(canvas) {
  const nodes = canvas.nodes;
  const startY = 100;
  const spacing = 200;
  
  // Simple left-to-right layout
  nodes.forEach((node, index) => {
    node.x = 100 + (index * spacing);
    node.y = startY;
  });
  
  canvas.render();
}

// Usage
autoLayout(flowchart);
```

### State Persistence

```javascript
// Save to localStorage
function saveToLocal(flowchart, key = 'flowchart-data') {
  const data = flowchart.exportToJSON();
  localStorage.setItem(key, data);
}

// Load from localStorage
function loadFromLocal(flowchart, key = 'flowchart-data') {
  const data = localStorage.getItem(key);
  if (data) {
    flowchart.importFromJSON(data);
    return true;
  }
  return false;
}

// Auto-save on changes
let saveTimeout;
function autoSave(flowchart) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveToLocal(flowchart);
    console.log('Auto-saved');
  }, 1000);
}

// Hook into state changes
const originalSaveState = flowchart.saveState.bind(flowchart);
flowchart.saveState = function() {
  originalSaveState();
  autoSave(this);
};
```

---

## 📦 Build and Distribution

### Development Build

```bash
# Install dependencies
npm install

# Build for development
npm run build:dev

# Build for production
npm run build:prod
```

### Build Configuration

**rollup.config.js**
```javascript
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/flowchart-lib.esm.js',
      format: 'es'
    },
    {
      file: 'dist/flowchart-lib.umd.js',
      format: 'umd',
      name: 'FlowchartLib'
    },
    {
      file: 'dist/flowchart-lib.min.js',
      format: 'umd',
      name: 'FlowchartLib',
      plugins: [terser()]
    }
  ],
  plugins: [
    resolve(),
    commonjs()
  ]
};
```

### Package.json Setup

```json
{
  "name": "flowchart-lib",
  "version": "1.0.0",
  "description": "Interactive flowchart library with Canvas",
  "main": "dist/flowchart-lib.umd.js",
  "module": "dist/flowchart-lib.esm.js",
  "scripts": {
    "build": "rollup -c",
    "build:dev": "rollup -c --environment BUILD:development",
    "build:prod": "rollup -c --environment BUILD:production"
  },
  "keywords": ["flowchart", "canvas", "diagram", "editor"],
  "author": "Your Name",
  "license": "MIT"
}
```

---

## 🐛 Debugging

### Enable Verbose Logging

```javascript
const flowchart = new Canvas('container', { mode: 'edit' });

// Add logging
const originalRender = flowchart.render.bind(flowchart);
flowchart.render = function() {
  console.log('Rendering canvas', {
    nodes: this.nodes.length,
    connections: this.connections.length
  });
  originalRender();
};
```

### Inspect State

```javascript
// Log current state
console.log('Nodes:', flowchart.nodes);
console.log('Connections:', flowchart.connections);
console.log('History:', flowchart.history);
console.log('Selected Node:', flowchart.selectedNode);
```

---

## 📝 TypeScript Support

### Type Definitions

**flowchart-lib.d.ts**
```typescript
declare module 'flowchart-lib' {
  export interface CanvasOptions {
    mode?: 'edit' | 'view';
    width?: number | null;
    height?: number | null;
    readonly?: boolean;
    pixelRatio?: number;
  }

  export interface Node {
    id: string;
    type: 'start' | 'process' | 'decision' | 'end';
    x: number;
    y: number;
    text: string;
    width: number;
    height: number;
  }

  export interface Connection {
    id: string;
    fromNode: Node;
    fromPort: 'top' | 'right' | 'bottom' | 'left';
    toNode: Node;
    toPort: 'top' | 'right' | 'bottom' | 'left';
  }

  export class Canvas {
    constructor(containerId: string, options?: CanvasOptions);
    
    addNode(type: string, text: string, x: number, y: number): Node;
    deleteNode(node: Node): void;
    addConnection(fromNode: Node, fromPort: string, toNode: Node, toPort: string): Connection | null;
    deleteConnection(connection: Connection): void;
    
    clear(): void;
    render(): void;
    undo(): void;
    redo(): void;
    
    exportToJSON(): string;
    importFromJSON(jsonString: string): void;
    exportToPNG(): string;
    exportToPDF(): any;
    
    destroy(): void;
  }
}
```

---

## 🚀 Performance Tips

1. **Use pixelRatio wisely** - Higher values = better quality but slower rendering
2. **Limit history size** - Default is 50, reduce if memory is a concern
3. **Batch operations** - Add multiple nodes before connecting them
4. **Avoid frequent re-renders** - The library auto-renders, don't call `render()` unnecessarily

---

## 🔐 Security Considerations

- The library uses `eval()` and should not execute user-provided code
- Sanitize any JSON imports from untrusted sources
- Canvas exports are safe for download
- No external API calls are made

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

For issues, questions, or feature requests:
- GitHub Issues: [your-repo-url]
- Email: support@example.com
- Documentation: [docs-url]

---

**Happy Coding! 🎉**