// src/index.js
// Main flowchart canvas class with pan/zoom support
import Node from './Node.js';
import Connection from './Connection.js';
import NodeSettingsDialog from './NodeSettingsDialog.js';
import Area from './Area.js';
import AreaSettingsDialog from './AreaSettingsDialog.js';
import JSZip from 'jszip';

class FlowchartCanvas {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    this.options = {
      mode: options.mode || 'edit',
      pixelRatio: options.pixelRatio || window.devicePixelRatio || 1,
      ...options
    };

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.nodes = [];
    this.connections = [];
    this.areas = [];
    this.selectedNode = null;
    this.selectedConnection = null;
    this.selectedArea = null;
    this.draggingNode = null;
    this.draggingArea = null;
    this.resizingNode = null;
    this.resizingArea = null;
    this.resizeHandle = null;
    this.connectingFrom = null;
    this.connectingTo = null;
    this.markingArea = false;
    this.areaStart = null;
    this.areaEnd = null;
    this.panOffset = { x: 0, y: 0 };
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.spacePressed = false;
    this.zoom = 1;
    this.history = [];
    this.historyIndex = -1;
    this.nodeIdCounter = 1;
    this.connectionIdCounter = 1;
    this.areaIdCounter = 1;

    // Double-click tracking
    this.lastClickTime = 0;
    this.lastClickNode = null;
    this.lastClickArea = null;
    this.doubleClickDelay = 300; // milliseconds

    this.nodeSettingsDialog = new NodeSettingsDialog(this);
    this.nodeSettingsDialog.onSave = () => {
      this.saveState();
      this.render();
    };

    this.areaSettingsDialog = new AreaSettingsDialog(
      (settings) => {
        if (this.selectedArea) {
          this.selectedArea.updateSettings(settings);
          this.saveState();
          this.render();
        }
      },
      () => {
        this.render();
      }
    );

    this.setupCanvas();
    this.setupEventListeners();
    this.saveState(); // Save initial empty state
    this.render();
  }

  setupCanvas() {
    const resizeCanvas = () => {
      const rect = this.container.getBoundingClientRect();
      this.canvas.width = rect.width * this.options.pixelRatio;
      this.canvas.height = rect.height * this.options.pixelRatio;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.scale(this.options.pixelRatio, this.options.pixelRatio);
      this.render();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    this.canvas.style.display = 'block';
    this.canvas.style.touchAction = 'none';
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / this.options.pixelRatio / rect.width;
    const scaleY = this.canvas.height / this.options.pixelRatio / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    return {
      x: (x - this.panOffset.x) / this.zoom,
      y: (y - this.panOffset.y) / this.zoom
    };
  }

  handleMouseDown(e) {
    if (this.options.mode !== 'edit') return;

    const pos = this.getMousePos(e);

    // Panning with middle mouse, right-click, Ctrl+click, or Space+click (higher priority)
    if (e.button === 1 || e.button === 2 || (e.button === 0 && (e.ctrlKey || this.spacePressed))) {
      this.isPanning = true;
      this.panStart = { x: e.clientX - this.panOffset.x, y: e.clientY - this.panOffset.y };
      this.canvas.style.cursor = 'grabbing';
      return;
    }

    // Area marking mode
    if (this.markingArea) {
      this.areaStart = { x: pos.x, y: pos.y };
      return;
    }

    // Check area resize handles first
    for (let area of [...this.areas].reverse()) {
      const resizeHandle = area.isOnResizeHandle(pos.x, pos.y, this.zoom);
      if (resizeHandle && area === this.selectedArea) {
        this.resizingArea = area;
        this.resizeHandle = resizeHandle;
        this.resizeStart = { 
          x: pos.x, y: pos.y, 
          x1: area.x1, y1: area.y1, 
          x2: area.x2, y2: area.y2 
        };
        return;
      }
    }

    // Check area title bars for dragging
    for (let area of [...this.areas].reverse()) {
      if (area.isOnTitleBar(pos.x, pos.y)) {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastClickTime;

        // Check for double-click on area
        if (this.lastClickArea === area && timeDiff < this.doubleClickDelay) {
          // Double-click detected - open settings dialog
          this.openAreaSettings(area, e.clientX, e.clientY);
          this.lastClickTime = 0;
          this.lastClickArea = null;
          return;
        }

        // Single click - select and prepare for drag
        this.lastClickTime = currentTime;
        this.lastClickArea = area;
        this.selectedArea = area;
        this.selectedNode = null;
        this.selectedConnection = null;
        this.draggingArea = area;
        this.dragStart = { 
          x: pos.x - area.x1, 
          y: pos.y - area.y1,
          width: area.width,
          height: area.height
        };
        this.render();
        return;
      }
    }

    for (let node of this.nodes) {
      const connectionPoint = node.isOnConnectionPoint(pos.x, pos.y, this.zoom);
      if (connectionPoint) {
        this.connectingFrom = { node, point: connectionPoint };
        this.selectedNode = null;
        this.selectedConnection = null;
        this.selectedArea = null;
        this.render();
        return;
      }

      const resizeHandle = node.isOnResizeHandle(pos.x, pos.y, this.zoom);
      if (resizeHandle && node === this.selectedNode) {
        this.resizingNode = node;
        this.resizeHandle = resizeHandle;
        this.resizeStart = { x: pos.x, y: pos.y, width: node.width, height: node.height };
        return;
      }

      if (node.containsPoint(pos.x, pos.y)) {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastClickTime;

        // Check for double-click
        if (this.lastClickNode === node && timeDiff < this.doubleClickDelay) {
          // Double-click detected - open settings dialog
          const rect = this.canvas.getBoundingClientRect();
          this.openNodeSettings(node, e.clientX, e.clientY);
          this.lastClickTime = 0;
          this.lastClickNode = null;
          return;
        }

        // Single click - just select and prepare for drag
        this.lastClickTime = currentTime;
        this.lastClickNode = node;
        this.selectedNode = node;
        this.selectedConnection = null;
        this.selectedArea = null;
        this.draggingNode = node;
        this.dragStart = { x: pos.x - node.x, y: pos.y - node.y };
        this.render();
        return;
      }
    }

    for (let connection of this.connections) {
      if (connection.isNearPoint(pos.x, pos.y, this.zoom)) {
        this.selectedConnection = connection;
        this.selectedNode = null;
        this.selectedArea = null;
        this.render();
        return;
      }
    }

    // Check if clicking inside an area
    for (let area of [...this.areas].reverse()) {
      if (area.containsPoint(pos.x, pos.y)) {
        this.selectedArea = area;
        this.selectedNode = null;
        this.selectedConnection = null;
        this.render();
        return;
      }
    }

    // Clicked on empty space - deselect and start panning
    this.selectedNode = null;
    this.selectedConnection = null;
    this.selectedArea = null;
    
    // If not in area marking mode, clicking empty space starts panning
    if (!this.markingArea) {
      this.isPanning = true;
      this.panStart = { x: e.clientX - this.panOffset.x, y: e.clientY - this.panOffset.y };
      this.canvas.style.cursor = 'grabbing';
    }
    
    this.render();
  }

  handleMouseMove(e) {
    if (this.options.mode !== 'edit') return;

    const pos = this.getMousePos(e);

    // Area marking mode
    if (this.markingArea && this.areaStart) {
      this.areaEnd = { x: pos.x, y: pos.y };
      this.render();
      return;
    }

    if (this.isPanning) {
      this.panOffset.x = e.clientX - this.panStart.x;
      this.panOffset.y = e.clientY - this.panStart.y;
      this.render();
      return;
    }

    if (this.connectingFrom) {
      this.connectingTo = pos;
      this.render();

      for (let node of this.nodes) {
        if (node !== this.connectingFrom.node) {
          const connectionPoint = node.isOnConnectionPoint(pos.x, pos.y, this.zoom);
          if (connectionPoint) {
            this.connectingTo = { node, point: connectionPoint };
            break;
          }
        }
      }
      return;
    }

    if (this.resizingArea) {
      const dx = pos.x - this.resizeStart.x;
      const dy = pos.y - this.resizeStart.y;

      switch (this.resizeHandle.position) {
        case 'top-left':
          this.resizingArea.x1 = Math.min(this.resizeStart.x1 + dx, this.resizeStart.x2 - 50);
          this.resizingArea.y1 = Math.min(this.resizeStart.y1 + dy, this.resizeStart.y2 - 50);
          break;
        case 'top-right':
          this.resizingArea.x2 = Math.max(this.resizeStart.x2 + dx, this.resizeStart.x1 + 50);
          this.resizingArea.y1 = Math.min(this.resizeStart.y1 + dy, this.resizeStart.y2 - 50);
          break;
        case 'bottom-right':
          this.resizingArea.x2 = Math.max(this.resizeStart.x2 + dx, this.resizeStart.x1 + 50);
          this.resizingArea.y2 = Math.max(this.resizeStart.y2 + dy, this.resizeStart.y1 + 50);
          break;
        case 'bottom-left':
          this.resizingArea.x1 = Math.min(this.resizeStart.x1 + dx, this.resizeStart.x2 - 50);
          this.resizingArea.y2 = Math.max(this.resizeStart.y2 + dy, this.resizeStart.y1 + 50);
          break;
        case 'top':
          this.resizingArea.y1 = Math.min(this.resizeStart.y1 + dy, this.resizeStart.y2 - 50);
          break;
        case 'right':
          this.resizingArea.x2 = Math.max(this.resizeStart.x2 + dx, this.resizeStart.x1 + 50);
          break;
        case 'bottom':
          this.resizingArea.y2 = Math.max(this.resizeStart.y2 + dy, this.resizeStart.y1 + 50);
          break;
        case 'left':
          this.resizingArea.x1 = Math.min(this.resizeStart.x1 + dx, this.resizeStart.x2 - 50);
          break;
      }

      this.render();
      return;
    }

    if (this.draggingArea) {
      const newX1 = pos.x - this.dragStart.x;
      const newY1 = pos.y - this.dragStart.y;
      this.draggingArea.x1 = newX1;
      this.draggingArea.y1 = newY1;
      this.draggingArea.x2 = newX1 + this.dragStart.width;
      this.draggingArea.y2 = newY1 + this.dragStart.height;
      this.render();
      return;
    }

    if (this.resizingNode) {
      const dx = pos.x - this.resizeStart.x;
      const dy = pos.y - this.resizeStart.y;

      switch (this.resizeHandle.position) {
        case 'top-left':
          this.resizingNode.width = Math.max(60, this.resizeStart.width - dx * 2);
          this.resizingNode.height = Math.max(40, this.resizeStart.height - dy * 2);
          break;
        case 'top-right':
          this.resizingNode.width = Math.max(60, this.resizeStart.width + dx * 2);
          this.resizingNode.height = Math.max(40, this.resizeStart.height - dy * 2);
          break;
        case 'bottom-right':
          this.resizingNode.width = Math.max(60, this.resizeStart.width + dx * 2);
          this.resizingNode.height = Math.max(40, this.resizeStart.height + dy * 2);
          break;
        case 'bottom-left':
          this.resizingNode.width = Math.max(60, this.resizeStart.width - dx * 2);
          this.resizingNode.height = Math.max(40, this.resizeStart.height + dy * 2);
          break;
      }

      this.render();
      return;
    }

    if (this.draggingNode) {
      this.draggingNode.x = pos.x - this.dragStart.x;
      this.draggingNode.y = pos.y - this.dragStart.y;
      this.render();
      return;
    }

    let cursor = 'default';
    
    // Space key pressed - show grab cursor
    if (this.spacePressed && !this.isPanning) {
      cursor = 'grab';
    } else if (this.markingArea) {
      cursor = 'crosshair';
    } else {
      for (let area of this.areas) {
        if (area === this.selectedArea && area.isOnResizeHandle(pos.x, pos.y, this.zoom)) {
          cursor = 'nwse-resize';
          break;
        }
        if (area.isOnTitleBar(pos.x, pos.y)) {
          cursor = 'move';
          break;
        }
      }

      if (cursor === 'default') {
        for (let node of this.nodes) {
          if (node.isOnConnectionPoint(pos.x, pos.y, this.zoom)) {
            cursor = 'crosshair';
            break;
          }
          if (node === this.selectedNode && node.isOnResizeHandle(pos.x, pos.y, this.zoom)) {
            cursor = 'nwse-resize';
            break;
          }
          if (node.containsPoint(pos.x, pos.y)) {
            cursor = 'move';
            break;
          }
        }
      }

      if (cursor === 'default') {
        for (let connection of this.connections) {
          if (connection.isNearPoint(pos.x, pos.y, this.zoom)) {
            cursor = 'pointer';
            break;
          }
        }
      }
      
      // If still default and not in marking mode, show grab cursor for empty space
      if (cursor === 'default' && !this.markingArea) {
        cursor = 'grab';
      }
    }

    this.canvas.style.cursor = cursor;
  }

  handleMouseUp(e) {
    if (this.options.mode !== 'edit') return;

    // Area marking complete
    if (this.markingArea && this.areaStart && this.areaEnd) {
      const area = new Area(
        `area_${this.areaIdCounter++}`,
        this.areaStart.x,
        this.areaStart.y,
        this.areaEnd.x,
        this.areaEnd.y
      );
      
      this.areas.push(area);
      this.selectedArea = area;
      this.markingArea = false;
      this.areaStart = null;
      this.areaEnd = null;
      
      // Trigger callback to update button state
      if (this.onAreaMarkingComplete) {
        this.onAreaMarkingComplete();
      }
      
      // Open settings dialog
      const rect = this.canvas.getBoundingClientRect();
      this.areaSettingsDialog.show(area, e.clientX, e.clientY);
      
      this.saveState();
      this.render();
      return;
    }

    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = 'default';
      return;
    }

    if (this.connectingFrom && this.connectingTo) {
      if (this.connectingTo.node) {
        const fromPort = this.connectingFrom.point.position;
        const toPort = this.connectingTo.point.position;
        
        const existingConnection = this.connections.find(conn => 
          conn.fromNode === this.connectingFrom.node &&
          conn.toNode === this.connectingTo.node &&
          conn.fromPort === fromPort &&
          conn.toPort === toPort
        );

        if (!existingConnection) {
          const connection = new Connection(
            `conn_${this.connectionIdCounter++}`,
            this.connectingFrom.node,
            fromPort,
            this.connectingTo.node,
            toPort
          );
          this.connections.push(connection);
          this.saveState();
        }
      }
      
      this.connectingFrom = null;
      this.connectingTo = null;
      this.render();
      return;
    }

    if (this.draggingArea) {
      this.saveState();
      this.draggingArea = null;
    }

    if (this.resizingArea) {
      this.saveState();
      this.resizingArea = null;
      this.resizeHandle = null;
    }

    if (this.draggingNode) {
      this.saveState();
      this.draggingNode = null;
    }

    if (this.resizingNode) {
      this.saveState();
      this.resizingNode = null;
      this.resizeHandle = null;
    }
  }

  handleWheel(e) {
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (this.canvas.width / this.options.pixelRatio / rect.width);
    const mouseY = (e.clientY - rect.top) * (this.canvas.height / this.options.pixelRatio / rect.height);

    const worldX = (mouseX - this.panOffset.x) / this.zoom;
    const worldY = (mouseY - this.panOffset.y) / this.zoom;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.1, Math.min(5, this.zoom * zoomFactor));

    this.panOffset.x = mouseX - worldX * newZoom;
    this.panOffset.y = mouseY - worldY * newZoom;
    this.zoom = newZoom;

    this.render();
  }

  handleKeyDown(e) {
    if (this.options.mode !== 'edit') return;

    // Space key for panning
    if (e.code === 'Space' && !this.spacePressed) {
      e.preventDefault();
      this.spacePressed = true;
      if (!this.draggingNode && !this.draggingArea && !this.resizingNode && !this.resizingArea) {
        this.canvas.style.cursor = 'grab';
      }
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.selectedNode) {
        this.connections = this.connections.filter(conn => 
          conn.fromNode !== this.selectedNode && conn.toNode !== this.selectedNode
        );
        this.nodes = this.nodes.filter(node => node !== this.selectedNode);
        this.selectedNode = null;
        this.saveState();
        this.render();
      } else if (this.selectedConnection) {
        this.connections = this.connections.filter(conn => conn !== this.selectedConnection);
        this.selectedConnection = null;
        this.saveState();
        this.render();
      } else if (this.selectedArea) {
        this.areas = this.areas.filter(area => area !== this.selectedArea);
        this.selectedArea = null;
        this.saveState();
        this.render();
      }
    }

    // Ctrl+Z or Cmd+Z for undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.undo();
    }

    // Ctrl+Shift+Z or Cmd+Shift+Z for redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      this.redo();
    }

    // Ctrl+Y or Cmd+Y for redo (alternative)
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      this.redo();
    }

    if (e.key === 'Escape') {
      if (this.markingArea) {
        this.markingArea = false;
        this.areaStart = null;
        this.areaEnd = null;
        this.canvas.style.cursor = 'default';
        
        // Trigger callback to update button state
        if (this.onAreaMarkingComplete) {
          this.onAreaMarkingComplete();
        }
        
        this.render();
      }
    }
  }

  handleKeyUp(e) {
    // Release Space key
    if (e.code === 'Space') {
      this.spacePressed = false;
      if (!this.isPanning) {
        this.canvas.style.cursor = 'default';
      }
    }
  }

  addNode(type, text, x, y) {
    const node = new Node(`node_${this.nodeIdCounter++}`, type, x, y, text);
    this.nodes.push(node);
    this.saveState();
    this.render();
    return node;
  }

  startAreaMarking() {
    this.markingArea = true;
    this.areaStart = null;
    this.areaEnd = null;
    this.selectedNode = null;
    this.selectedConnection = null;
    this.selectedArea = null;
    this.canvas.style.cursor = 'crosshair';
    this.render();
  }

  openAreaSettings(area, cursorX, cursorY) {
    this.areaSettingsDialog.show(area, cursorX, cursorY);
  }

  openNodeSettings(node, cursorX, cursorY) {
    this.nodeSettingsDialog.show(node, cursorX, cursorY);
  }

  saveState() {
    const state = {
      nodes: this.nodes.map(node => ({
        id: node.id,
        type: node.type,
        x: node.x,
        y: node.y,
        text: node.text,
        width: node.width,
        height: node.height,
        link: node.link,
        fillColor: node.fillColor,
        fontColor: node.fontColor,
        fontSize: node.fontSize,
        outlineColor: node.outlineColor,
        outlineWidth: node.outlineWidth
      })),
      connections: this.connections.map(conn => ({
        id: conn.id,
        fromNodeId: conn.fromNode.id,
        fromPort: conn.fromPort,
        toNodeId: conn.toNode.id,
        toPort: conn.toPort
      })),
      areas: this.areas.map(area => ({
        id: area.id,
        x1: area.x1,
        y1: area.y1,
        x2: area.x2,
        y2: area.y2,
        title: area.title,
        fillColor: area.fillColor,
        outlineColor: area.outlineColor,
        titleBgColor: area.titleBgColor
      }))
    };

    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.stringify(state));
    this.historyIndex++;

    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreState(this.history[this.historyIndex]);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreState(this.history[this.historyIndex]);
    }
  }

  restoreState(stateStr) {
    const state = JSON.parse(stateStr);
    
    this.nodes = state.nodes.map(nodeData => {
      const node = new Node(nodeData.id, nodeData.type, nodeData.x, nodeData.y, nodeData.text);
      node.width = nodeData.width;
      node.height = nodeData.height;
      node.link = nodeData.link || '';
      node.fillColor = nodeData.fillColor || '#FFFFFF';
      node.fontColor = nodeData.fontColor || '#000000';
      node.fontSize = nodeData.fontSize || 14;
      node.outlineColor = nodeData.outlineColor || '#000000';
      node.outlineWidth = nodeData.outlineWidth || 2;
      return node;
    });

    this.connections = state.connections.map(connData => {
      const fromNode = this.nodes.find(n => n.id === connData.fromNodeId);
      const toNode = this.nodes.find(n => n.id === connData.toNodeId);
      return new Connection(connData.id, fromNode, connData.fromPort, toNode, connData.toPort);
    });

    this.areas = (state.areas || []).map(areaData => {
      const area = new Area(areaData.id, areaData.x1, areaData.y1, areaData.x2, areaData.y2, areaData.title);
      area.fillColor = areaData.fillColor || 'rgba(33, 150, 243, 0.1)';
      area.outlineColor = areaData.outlineColor || '#2196F3';
      area.titleBgColor = areaData.titleBgColor || '#2196F3';
      return area;
    });

    this.selectedNode = null;
    this.selectedConnection = null;
    this.selectedArea = null;
    this.render();
  }

  clear() {
    this.nodes = [];
    this.connections = [];
    this.areas = [];
    this.selectedNode = null;
    this.selectedConnection = null;
    this.selectedArea = null;
    this.history = [];
    this.historyIndex = -1;
    this.nodeIdCounter = 1;
    this.connectionIdCounter = 1;
    this.areaIdCounter = 1;
    this.render();
  }

  drawGrid() {
    const gridSize = 20; // Grid spacing
    const width = this.canvas.width / this.options.pixelRatio / this.zoom;
    const height = this.canvas.height / this.options.pixelRatio / this.zoom;
    
    // Calculate visible area in world coordinates
    const startX = Math.floor(-this.panOffset.x / this.zoom / gridSize) * gridSize;
    const startY = Math.floor(-this.panOffset.y / this.zoom / gridSize) * gridSize;
    const endX = startX + width + gridSize;
    const endY = startY + height + gridSize;

    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();

    // Draw vertical lines
    for (let x = startX; x < endX; x += gridSize) {
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
    }

    // Draw horizontal lines
    for (let y = startY; y < endY; y += gridSize) {
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
    }

    this.ctx.stroke();
  }

  render() {
    const width = this.canvas.width / this.options.pixelRatio;
    const height = this.canvas.height / this.options.pixelRatio;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.save();
    this.ctx.translate(this.panOffset.x, this.panOffset.y);
    this.ctx.scale(this.zoom, this.zoom);

    // Draw grid lines
    this.drawGrid();

    // Draw areas first (behind everything)
    this.areas.forEach(area => {
      area.draw(this.ctx, area === this.selectedArea);
    });

    // Draw area marking preview
    if (this.markingArea && this.areaStart && this.areaEnd) {
      const x1 = Math.min(this.areaStart.x, this.areaEnd.x);
      const y1 = Math.min(this.areaStart.y, this.areaEnd.y);
      const x2 = Math.max(this.areaStart.x, this.areaEnd.x);
      const y2 = Math.max(this.areaStart.y, this.areaEnd.y);
      
      this.ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
      this.ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      
      this.ctx.strokeStyle = '#2196F3';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      this.ctx.setLineDash([]);
    }

    this.connections.forEach(conn => {
      conn.draw(this.ctx, conn === this.selectedConnection);
    });

    this.nodes.forEach(node => {
      node.draw(this.ctx, node === this.selectedNode);
    });

    if (this.connectingFrom && this.connectingTo) {
      this.ctx.strokeStyle = '#2196F3';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.moveTo(this.connectingFrom.point.x, this.connectingFrom.point.y);
      
      if (this.connectingTo.node) {
        this.ctx.lineTo(this.connectingTo.point.x, this.connectingTo.point.y);
      } else {
        this.ctx.lineTo(this.connectingTo.x, this.connectingTo.y);
      }
      
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    this.ctx.restore();
  }

  exportToJSON() {
    const data = {
      nodes: this.nodes.map(node => ({
        id: node.id,
        type: node.type,
        x: node.x,
        y: node.y,
        text: node.text,
        width: node.width,
        height: node.height,
        link: node.link,
        fillColor: node.fillColor,
        fontColor: node.fontColor,
        fontSize: node.fontSize,
        outlineColor: node.outlineColor,
        outlineWidth: node.outlineWidth
      })),
      connections: this.connections.map(conn => ({
        id: conn.id,
        fromNodeId: conn.fromNode.id,
        fromPort: conn.fromPort,
        toNodeId: conn.toNode.id,
        toPort: conn.toPort
      })),
      areas: this.areas.map(area => ({
        id: area.id,
        x1: area.x1,
        y1: area.y1,
        x2: area.x2,
        y2: area.y2,
        title: area.title,
        fillColor: area.fillColor,
        outlineColor: area.outlineColor,
        titleBgColor: area.titleBgColor
      }))
    };
    return JSON.stringify(data, null, 2);
  }

  importFromJSON(jsonStr) {
    const data = JSON.parse(jsonStr);
    
    this.nodes = data.nodes.map(nodeData => {
      const node = new Node(nodeData.id, nodeData.type, nodeData.x, nodeData.y, nodeData.text);
      node.width = nodeData.width;
      node.height = nodeData.height;
      node.link = nodeData.link || '';
      node.fillColor = nodeData.fillColor || '#FFFFFF';
      node.fontColor = nodeData.fontColor || '#000000';
      node.fontSize = nodeData.fontSize || 14;
      node.outlineColor = nodeData.outlineColor || '#000000';
      node.outlineWidth = nodeData.outlineWidth || 2;
      return node;
    });

    this.connections = data.connections.map(connData => {
      const fromNode = this.nodes.find(n => n.id === connData.fromNodeId);
      const toNode = this.nodes.find(n => n.id === connData.toNodeId);
      return new Connection(connData.id, fromNode, connData.fromPort, toNode, connData.toPort);
    });

    this.areas = (data.areas || []).map(areaData => {
      const area = new Area(areaData.id, areaData.x1, areaData.y1, areaData.x2, areaData.y2, areaData.title);
      area.fillColor = areaData.fillColor || 'rgba(33, 150, 243, 0.1)';
      area.outlineColor = areaData.outlineColor || '#2196F3';
      area.titleBgColor = areaData.titleBgColor || '#2196F3';
      return area;
    });

    this.nodeIdCounter = Math.max(...this.nodes.map(n => parseInt(n.id.split('_')[1]) || 0), 0) + 1;
    this.connectionIdCounter = Math.max(...this.connections.map(c => parseInt(c.id.split('_')[1]) || 0), 0) + 1;
    this.areaIdCounter = Math.max(...this.areas.map(a => parseInt(a.id.split('_')[1]) || 0), 0) + 1;

    this.saveState();
    this.render();
  }

  exportToPNG() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    this.areas.forEach(area => {
      minX = Math.min(minX, area.x1);
      minY = Math.min(minY, area.y1 - 30);
      maxX = Math.max(maxX, area.x2);
      maxY = Math.max(maxY, area.y2);
    });

    this.nodes.forEach(node => {
      minX = Math.min(minX, node.x - node.width / 2);
      minY = Math.min(minY, node.y - node.height / 2);
      maxX = Math.max(maxX, node.x + node.width / 2);
      maxY = Math.max(maxY, node.y + node.height / 2);
    });

    const padding = 50;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    tempCanvas.width = width;
    tempCanvas.height = height;

    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, width, height);

    tempCtx.translate(-minX + padding, -minY + padding);

    this.areas.forEach(area => area.draw(tempCtx, false));
    this.connections.forEach(conn => conn.draw(tempCtx, false));
    this.nodes.forEach(node => node.draw(tempCtx, false));

    return tempCanvas.toDataURL('image/png');
  }

  exportToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'pt', 'a4');

    const imgData = this.exportToPNG();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  }

  async downloadZip() {
    if (typeof JSZip === 'undefined') {
      console.error('JSZip is not loaded');
      alert('JSZip library is required for this feature. Please include it in your HTML.');
      return;
    }

    const zip = new JSZip();

    zip.file('flowchart.json', this.exportToJSON());

    const pngData = this.exportToPNG();
    const pngBlob = await fetch(pngData).then(r => r.blob());
    zip.file('flowchart.png', pngBlob);

    const pdf = this.exportToPDF();
    const pdfBlob = pdf.output('blob');
    zip.file('flowchart.pdf', pdfBlob);

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.zip';
    a.click();
    URL.revokeObjectURL(url);
  }

  destroy() {
    if (this.nodeSettingsDialog) {
      this.nodeSettingsDialog.destroy();
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

export { FlowchartCanvas as Canvas, Node, Connection, NodeSettingsDialog };
export default { Canvas: FlowchartCanvas, Node, Connection, NodeSettingsDialog };

if (typeof window !== 'undefined') {
  window.FlowchartLib = { Canvas: FlowchartCanvas, Node, Connection, NodeSettingsDialog };
}