# 📊 Flowchart Library

A lightweight, zero-dependency flowchart library for creating interactive flowcharts with Canvas. Perfect for Electron, Vue, React, and vanilla JavaScript applications.

<!-- [![npm version](https://img.shields.io/npm/v/@yourusername/flowchart-lib.svg)](https://www.npmjs.com/package/@yourusername/flowchart-lib)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) -->

## ✨ Features

- 🎨 **Simple and Intuitive API** - Easy to learn and use
- 🚀 **Zero Dependencies** - No external libraries required (jsPDF optional for PDF export)
- 📦 **Multiple Build Formats** - UMD, CommonJS, and ES Module
- 💻 **Framework Agnostic** - Works with Electron, Vue, React, Angular, and vanilla JS
- 🎯 **TypeScript Support** - Full type definitions included
- 🖱️ **Interactive** - Drag, connect, and edit nodes with mouse and keyboard
- 💾 **Import/Export** - JSON, PNG, and PDF export capabilities
- ↩️ **Undo/Redo** - Full history management
- 📱 **Responsive** - Auto-sizing canvas support
- 🎨 **High-DPI Ready** - Crisp rendering on Retina and 4K displays

---

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Framework Integration](#-framework-integration)
  - [Electron](#-electron-integration)
  - [Vue.js](#-vuejs-integration)
  - [React](#-react-integration)
- [Configuration Options](#-configuration-options)
- [Methods](#-methods)
- [Events](#-events)
- [Advanced Usage](#-advanced-usage)
- [TypeScript](#-typescript-support)
- [Publishing Updates](#-publishing-updates)
- [License](#-license)

---

## 📦 Installation

### Via npm (Recommended)

```bash
npm install @thihaeung/flowchart-lib
```

### Via CDN

```html
<!-- Latest version -->
<script src="https://unpkg.com/@thihaeung/flowchart-lib"></script>

<!-- Or use jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@thihaeung/flowchart-lib"></script>

<!-- Specific version (recommended for production) -->
<script src="https://unpkg.com/@thihaeung/flowchart-lib@1.0.0/dist/flowchart-lib.umd.min.js"></script>
```

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/thihaeung/flowchart-lib/releases)
2. Include the appropriate build file:

```html
<!-- UMD Build (for browsers) -->
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

### Basic Browser Setup (UMD)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Flowchart App</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
    }
    #canvas-container {
      width: 100%;
      height: 600px;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <h1>My Flowchart</h1>
  <div id="canvas-container"></div>
  
  <!-- Include library from CDN or local file -->
  <script src="https://unpkg.com/@thihaeung/flowchart-lib"></script>
  <script>
    // Initialize
    const flowchart = new FlowchartLib.Canvas('canvas-container', {
      mode: 'edit',
      pixelRatio: 2
    });
    
    // Add nodes
    const startNode = flowchart.addNode('start', 'Start', 100, 150);
    const processNode = flowchart.addNode('process', 'Process Data', 300, 150);
    const endNode = flowchart.addNode('end', 'End', 500, 150);
    
    // Create connections
    flowchart.addConnection(startNode, 'right', processNode, 'left');
    flowchart.addConnection(processNode, 'right', endNode, 'left');
  </script>
</body>
</html>
```

### ES Module (Modern JavaScript)

```javascript
import { Canvas, Node, Connection } from '@thihaeung/flowchart-lib';

const flowchart = new Canvas('canvas-container', {
  mode: 'edit',
  pixelRatio: window.devicePixelRatio
});

// Add your nodes and connections
const start = flowchart.addNode('start', 'Begin', 100, 100);
const process = flowchart.addNode('process', 'Process', 300, 100);
flowchart.addConnection(start, 'right', process, 'left');
```

### CommonJS (Node.js / Electron)

```javascript
const { Canvas, Node, Connection } = require('@thihaeung/flowchart-lib');

const flowchart = new Canvas('canvas-container');
flowchart.addNode('start', 'Start', 100, 100);
```

---

## 📚 API Reference

### Constructor

```javascript
new Canvas(containerId, options)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `containerId` | `string` | Yes | ID of the HTML element to contain the canvas |
| `options` | `object` | No | Configuration options |

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
- `start` - Green oval (entry point)
- `process` - Blue rectangle (action/task)
- `decision` - Yellow diamond (conditional)
- `end` - Red oval (termination)

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

**Keyboard shortcut:** `Ctrl+Z` or `Cmd+Z`

#### redo()
Redo an undone action.

```javascript
flowchart.redo();
```

**Keyboard shortcut:** `Ctrl+Y` or `Cmd+Shift+Z`

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
// Make sure jsPDF is included first
const pdf = flowchart.exportToPDF();
pdf.save('flowchart.pdf');
```

**Returns:** jsPDF object

### Cleanup

#### destroy()
Clean up event listeners and remove canvas.

```javascript
// Always call destroy when removing the flowchart
flowchart.destroy();
```

---

## 🖥️ Framework Integration

### 💻 Electron Integration

**Installation:**
```bash
npm install @thihaeung/flowchart-lib
```

**Main Process (main.js):**
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

**Renderer Process (index.html):**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Flowchart Editor</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    .toolbar {
      height: 50px;
      background: #f5f5f5;
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    .canvas-container {
      height: calc(100vh - 50px);
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="addStartNode()">Add Start</button>
    <button onclick="addProcessNode()">Add Process</button>
    <button onclick="addDecisionNode()">Add Decision</button>
    <button onclick="addEndNode()">Add End</button>
    <button onclick="flowchart.undo()">Undo</button>
    <button onclick="flowchart.redo()">Redo</button>
    <button onclick="exportJSON()">Export JSON</button>
    <button onclick="exportPNG()">Export PNG</button>
  </div>
  <div id="canvas-container" class="canvas-container"></div>

  <script>
    const { Canvas } = require('@thihaeung/flowchart-lib');
    
    const flowchart = new Canvas('canvas-container', {
      mode: 'edit',
      pixelRatio: window.devicePixelRatio || 2
    });

    let nodeCounter = 0;

    function addStartNode() {
      flowchart.addNode('start', 'Start ' + (++nodeCounter), 100, 100);
    }

    function addProcessNode() {
      flowchart.addNode('process', 'Process ' + (++nodeCounter), 100, 100);
    }

    function addDecisionNode() {
      flowchart.addNode('decision', 'Decision ' + (++nodeCounter), 100, 100);
    }

    function addEndNode() {
      flowchart.addNode('end', 'End ' + (++nodeCounter), 100, 100);
    }

    function exportJSON() {
      const data = flowchart.exportToJSON();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowchart.json';
      a.click();
    }

    function exportPNG() {
      const dataUrl = flowchart.exportToPNG();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'flowchart.png';
      a.click();
    }
  </script>
</body>
</html>
```

**package.json for Electron:**
```json
{
  "name": "flowchart-electron-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  },
  "dependencies": {
    "@thihaeung/flowchart-lib": "^1.0.0"
  },
  "devDependencies": {
    "electron": "^25.0.0"
  }
}
```

---

### 🎨 Vue.js Integration

**Installation:**
```bash
npm install @thihaeung/flowchart-lib
```

**Single File Component:**
```vue
<template>
  <div class="flowchart-editor">
    <div class="toolbar">
      <button @click="addNode('start')">Add Start</button>
      <button @click="addNode('process')">Add Process</button>
      <button @click="addNode('decision')">Add Decision</button>
      <button @click="addNode('end')">Add End</button>
      <button @click="undo">Undo</button>
      <button @click="redo">Redo</button>
      <button @click="exportJSON">Export JSON</button>
      <button @click="exportPNG">Export PNG</button>
      <button @click="clear">Clear All</button>
    </div>
    <div id="flowchart-canvas" ref="canvasContainer"></div>
  </div>
</template>

<script>
import { Canvas } from '@thihaeung/flowchart-lib';

export default {
  name: 'FlowchartEditor',
  data() {
    return {
      flowchart: null,
      nodeCounter: 0
    };
  },
  mounted() {
    // Initialize the flowchart
    this.flowchart = new Canvas('flowchart-canvas', {
      mode: 'edit',
      pixelRatio: window.devicePixelRatio || 2
    });

    // Optional: Load saved data
    this.loadFromLocalStorage();
  },
  beforeUnmount() {
    // Clean up
    if (this.flowchart) {
      this.saveToLocalStorage();
      this.flowchart.destroy();
    }
  },
  methods: {
    addNode(type) {
      this.nodeCounter++;
      const x = 100 + Math.random() * 300;
      const y = 100 + Math.random() * 200;
      this.flowchart.addNode(type, `${type} ${this.nodeCounter}`, x, y);
    },
    undo() {
      this.flowchart.undo();
    },
    redo() {
      this.flowchart.redo();
    },
    clear() {
      if (confirm('Clear all nodes and connections?')) {
        this.flowchart.clear();
      }
    },
    exportJSON() {
      const data = this.flowchart.exportToJSON();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowchart.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    exportPNG() {
      const dataUrl = this.flowchart.exportToPNG();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'flowchart.png';
      a.click();
    },
    saveToLocalStorage() {
      const data = this.flowchart.exportToJSON();
      localStorage.setItem('flowchart-data', data);
    },
    loadFromLocalStorage() {
      const data = localStorage.getItem('flowchart-data');
      if (data) {
        try {
          this.flowchart.importFromJSON(data);
        } catch (e) {
          console.error('Failed to load flowchart data:', e);
        }
      }
    }
  }
};
</script>

<style scoped>
.flowchart-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.toolbar {
  background: #f5f5f5;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.toolbar button {
  padding: 8px 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.toolbar button:hover {
  background: #1976D2;
}

#flowchart-canvas {
  flex: 1;
  position: relative;
}
</style>
```

**Vue 3 Composition API:**
```vue
<template>
  <div id="flowchart-canvas" ref="canvasContainer"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Canvas } from '@thihaeung/flowchart-lib';

const canvasContainer = ref(null);
let flowchart = null;

onMounted(() => {
  flowchart = new Canvas('flowchart-canvas', {
    mode: 'edit',
    pixelRatio: window.devicePixelRatio || 2
  });

  // Add some sample nodes
  const start = flowchart.addNode('start', 'Start', 100, 100);
  const process = flowchart.addNode('process', 'Process', 300, 100);
  flowchart.addConnection(start, 'right', process, 'left');
});

onBeforeUnmount(() => {
  if (flowchart) {
    flowchart.destroy();
  }
});

// Expose methods to parent component if needed
defineExpose({
  flowchart
});
</script>
```

---

### ⚛️ React Integration

**Installation:**
```bash
npm install @thihaeung/flowchart-lib
```

**Function Component with Hooks:**
```jsx
import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@thihaeung/flowchart-lib';
import './FlowchartEditor.css';

function FlowchartEditor() {
  const canvasRef = useRef(null);
  const flowchartRef = useRef(null);
  const [nodeCounter, setNodeCounter] = useState(0);

  useEffect(() => {
    // Initialize flowchart
    flowchartRef.current = new Canvas('flowchart-canvas', {
      mode: 'edit',
      pixelRatio: window.devicePixelRatio || 2
    });

    // Cleanup on unmount
    return () => {
      if (flowchartRef.current) {
        flowchartRef.current.destroy();
      }
    };
  }, []);

  const addNode = (type) => {
    if (flowchartRef.current) {
      const x = 100 + Math.random() * 300;
      const y = 100 + Math.random() * 200;
      const newCounter = nodeCounter + 1;
      flowchartRef.current.addNode(type, `${type} ${newCounter}`, x, y);
      setNodeCounter(newCounter);
    }
  };

  const undo = () => {
    flowchartRef.current?.undo();
  };

  const redo = () => {
    flowchartRef.current?.redo();
  };

  const clear = () => {
    if (window.confirm('Clear all nodes and connections?')) {
      flowchartRef.current?.clear();
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
      const dataUrl = flowchartRef.current.exportToPNG();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'flowchart.png';
      a.click();
    }
  };

  return (
    <div className="flowchart-editor">
      <div className="toolbar">
        <button onClick={() => addNode('start')}>Add Start</button>
        <button onClick={() => addNode('process')}>Add Process</button>
        <button onClick={() => addNode('decision')}>Add Decision</button>
        <button onClick={() => addNode('end')}>Add End</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={exportJSON}>Export JSON</button>
        <button onClick={exportPNG}>Export PNG</button>
        <button onClick={clear}>Clear All</button>
      </div>
      <div id="flowchart-canvas" ref={canvasRef}></div>
    </div>
  );
}

export default FlowchartEditor;
```

**CSS (FlowchartEditor.css):**
```css
.flowchart-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.toolbar {
  background: #f5f5f5;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar button {
  padding: 8px 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.toolbar button:hover {
  background: #1976D2;
}

#flowchart-canvas {
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
    if (conn) this.emit('connectionAdded', conn);
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

flowchart.on('connectionAdded', (conn) => {
  console.log('Connection added:', conn);
});
```

---

## 🎯 Advanced Usage

### Programmatic Flowchart Creation

```javascript
function createWorkflowFlowchart(canvas) {
  // Create nodes
  const nodes = {
    start: canvas.addNode('start', 'Start Process', 100, 100),
    validate: canvas.addNode('decision', 'Valid Input?', 300, 100),
    process: canvas.addNode('process', 'Process Data', 500, 100),
    error: canvas.addNode('process', 'Show Error', 300, 250),
    save: canvas.addNode('process', 'Save Result', 700, 100),
    end: canvas.addNode('end', 'End', 700, 250)
  };
  
  // Create connections
  canvas.addConnection(nodes.start, 'right', nodes.validate, 'left');
  canvas.addConnection(nodes.validate, 'right', nodes.process, 'left');
  canvas.addConnection(nodes.validate, 'bottom', nodes.error, 'top');
  canvas.addConnection(nodes.process, 'right', nodes.save, 'left');
  canvas.addConnection(nodes.save, 'bottom', nodes.end, 'top');
  canvas.addConnection(nodes.error, 'right', nodes.end, 'left');
  
  return nodes;
}

// Usage
const flowchart = new Canvas('container');
const nodes = createWorkflowFlowchart(flowchart);
```

### Auto-Save with LocalStorage

```javascript
class AutoSaveFlowchart {
  constructor(containerId, storageKey = 'flowchart-data') {
    this.canvas = new Canvas(containerId);
    this.storageKey = storageKey;
    this.saveTimeout = null;
    
    // Load existing data
    this.load();
    
    // Intercept state-changing methods
    this.interceptMethods();
  }
  
  interceptMethods() {
    const methods = ['addNode', 'deleteNode', 'addConnection', 'deleteConnection'];
    
    methods.forEach(method => {
      const original = this.canvas[method].bind(this.canvas);
      this.canvas[method] = (...args) => {
        const result = original(...args);
        this.scheduleSave();
        return result;
      };
    });
  }
  
  scheduleSave() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.save();
    }, 1000); // Save after 1 second of inactivity
  }
  
  save() {
    const data = this.canvas.exportToJSON();
    localStorage.setItem(this.storageKey, data);
    console.log('Flowchart auto-saved');
  }
  
  load() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      try {
        this.canvas.importFromJSON(data);
        console.log('Flowchart loaded');
      } catch (e) {
        console.error('Failed to load flowchart:', e);
      }
    }
  }
  
  clear() {
    localStorage.removeItem(this.storageKey);
    this.canvas.clear();
  }
}

// Usage
const flowchart = new AutoSaveFlowchart('container', 'my-flowchart');
```

### Custom Node Styling

```javascript
// Modify this in your Node.js source file
getColors() {
  const colors = {
    'start': { fill: '#4CAF50', border: '#388E3C' },
    'process': { fill: '#2196F3', border: '#1976D2' },
    'decision': { fill: '#FFC107', border: '#FFA000' },
    'end': { fill: '#F44336', border: '#D32F2F' },
    // Add custom node types
    'database': { fill: '#9C27B0', border: '#7B1FA2' },
    'api': { fill: '#00BCD4', border: '#0097A7' },
    'user': { fill: '#FF9800', border: '#F57C00' }
  };
  return colors[this.type] || colors['process'];
}
```

### Keyboard Shortcuts

The library includes built-in keyboard shortcuts:

- **Delete** - Delete selected node
- **Ctrl/Cmd + Z** - Undo
- **Ctrl/Cmd + Y** or **Ctrl/Cmd + Shift + Z** - Redo
- **Escape** - Deselect node

### Custom Validation

```javascript
function validateFlowchart(canvas) {
  const errors = [];
  
  // Check if there's a start node
  const hasStart = canvas.nodes.some(node => node.type === 'start');
  if (!hasStart) {
    errors.push('Flowchart must have a start node');
  }
  
  // Check if there's an end node
  const hasEnd = canvas.nodes.some(node => node.type === 'end');
  if (!hasEnd) {
    errors.push('Flowchart must have an end node');
  }
  
  // Check for disconnected nodes
  canvas.nodes.forEach(node => {
    const hasConnections = canvas.connections.some(
      conn => conn.fromNode === node || conn.toNode === node
    );
    if (!hasConnections && canvas.nodes.length > 1) {
      errors.push(`Node "${node.text}" is not connected`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Usage
const validation = validateFlowchart(flowchart);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  alert('Flowchart has errors:\n' + validation.errors.join('\n'));
}
```

---

## 📝 TypeScript Support

### Type Definitions

The library includes TypeScript definitions. Create or use the included `flowchart-lib.d.ts`:

```typescript
declare module '@thihaeung/flowchart-lib' {
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
    
    nodes: Node[];
    connections: Connection[];
    
    addNode(type: string, text: string, x: number, y: number): Node;
    deleteNode(node: Node): void;
    addConnection(
      fromNode: Node,
      fromPort: string,
      toNode: Node,
      toPort: string
    ): Connection | null;
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

### TypeScript Usage Example

```typescript
import { Canvas, Node, Connection, CanvasOptions } from '@thihaeung/flowchart-lib';

const options: CanvasOptions = {
  mode: 'edit',
  pixelRatio: window.devicePixelRatio || 2
};

const flowchart = new Canvas('canvas-container', options);

const startNode: Node = flowchart.addNode('start', 'Begin', 100, 100);
const processNode: Node = flowchart.addNode('process', 'Process', 300, 100);

const connection: Connection | null = flowchart.addConnection(
  startNode,
  'right',
  processNode,
  'left'
);
```

---

## 🚀 Publishing Updates

When you make changes to the library and want to publish an update:

### 1. Update Version Number

Edit `package.json` and bump the version following [Semantic Versioning](https://semver.org/):

```json
{
  "version": "1.0.1"  // Patch: bug fixes
  "version": "1.1.0"  // Minor: new features (backward compatible)
  "version": "2.0.0"  // Major: breaking changes
}
```

### 2. Build the Library

```bash
npm run build
```

### 3. Test Locally

```bash
npm pack
# This creates a .tgz file you can test in another project
```

### 4. Publish to npm

```bash
# Make sure you're logged in
npm login

# Publish the update
npm publish --access public
```

### 5. Create Git Tag (Optional but Recommended)

```bash
git tag v1.0.1
git push origin v1.0.1
```

---

## 🚀 Performance Tips

1. **Use pixelRatio wisely** - Higher values = better quality but slower rendering
   ```javascript
   // For retina displays
   pixelRatio: window.devicePixelRatio || 2
   
   // For better performance on lower-end devices
   pixelRatio: 1
   ```

2. **Limit history size** - Modify history length if memory is a concern (default is 50)

3. **Batch operations** - Add multiple nodes before connecting them
   ```javascript
   // Good
   const node1 = flowchart.addNode('start', 'Start', 100, 100);
   const node2 = flowchart.addNode('process', 'Process', 300, 100);
   flowchart.addConnection(node1, 'right', node2, 'left');
   
   // Avoid calling render() manually unless necessary
   ```

4. **Avoid frequent re-renders** - The library auto-renders, don't call `render()` unnecessarily

---

## 🔐 Security Considerations

- The library does not use `eval()` or execute user-provided code
- Sanitize any JSON imports from untrusted sources
- Canvas exports are safe for download
- No external API calls are made
- All rendering happens client-side

---

## 🐛 Troubleshooting

### Canvas not appearing
- Ensure the container element exists before initializing
- Check that the container has width and height
- Verify the library is properly imported

### Nodes not draggable
- Check if `mode` is set to `'edit'`
- Verify `readonly` is not set to `true`

### Export not working
- For PDF export, ensure jsPDF is loaded
- Check browser console for errors

### Performance issues
- Lower the `pixelRatio` value
- Reduce the number of nodes on canvas
- Consider using `view` mode for read-only displays

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

Copyright (c) 2025 Your Name

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues, questions, or feature requests:

- **GitHub Issues**: [https://github.com/Morrowga/flowchart-lib/issues](https://github.com/Morrowga/flowchart-lib/issues)
- **Email**: your.email@example.com
- **Documentation**: [https://github.com/Morrowga/flowchart-lib#readme](https://github.com/Morrowga/flowchart-lib#readme)

---

## 🌟 Acknowledgments

Built with ❤️ for developers who need simple, powerful flowchart capabilities.

---

## 📊 Changelog

### v1.0.0 (2025-01-XX)
- Initial release
- Basic flowchart functionality
- Support for start, process, decision, and end nodes
- Interactive editing with drag and drop
- Connection management
- Undo/Redo support
- Export to JSON, PNG, and PDF
- Multiple build formats (UMD, CommonJS, ES Module)

---

**Happy Flowcharting! 🎉**