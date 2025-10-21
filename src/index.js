// src/index.js
// Main flowchart canvas class with fullscreen support
import Node from './Node.js';
import Connection from './Connection.js';

class FlowchartCanvas {
  constructor(containerId, options = {}) {
    // Get the container element
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container element '${containerId}' not found!`);
    }
    
    // Configuration options
    this.options = {
      mode: options.mode || 'edit',
      width: options.width || null,  // null = auto-size to container
      height: options.height || null,
      readonly: options.readonly || false,
      pixelRatio: options.pixelRatio || window.devicePixelRatio || 1
    };

    // Node and connection storage
    this.nodes = [];
    this.connections = [];
    this.nodeIdCounter = 0;
    this.connectionIdCounter = 0;

    // Selection state
    this.selectedNode = null;
    this.selectedConnection = null;

    // Dragging state
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    // Resizing state
    this.isResizing = false;
    this.resizeHandle = null;
    this.resizeStartWidth = 0;
    this.resizeStartHeight = 0;
    this.resizeStartX = 0;
    this.resizeStartY = 0;
    this.resizeStartNodeX = 0;
    this.resizeStartNodeY = 0;

    // Connection creation state
    this.isConnecting = false;
    this.connectionStart = null;
    this.connectionStartPort = null;
    this.tempConnectionEnd = null;

    // Connection reconnection state
    this.isReconnecting = false;
    this.reconnectingConnection = null;
    this.reconnectingEnd = null;

    // Text editing state
    this.editingNode = null;
    this.textInput = null;
    this.originalNodeText = null;

    // History management
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;

    // Clipboard
    this.clipboard = null;
    
    // Initialize the canvas
    this.init();
    
    // Setup resize observer for responsive canvas
    this.setupResizeObserver();
    
    this.saveState();
  }
  
  // ============================================================================
  // Initialization
  // ============================================================================
  
  init() {  
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.border = '1px solid #ccc';
    this.canvas.style.cursor = 'default';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    
    // Set initial size
    this.updateCanvasSize();
    
    // Add event listeners (only if not readonly)
    if (!this.options.readonly) {
      this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
      this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
      this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
      document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    this.render();
  }

  setupResizeObserver() {
    // Use ResizeObserver to handle container size changes
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateCanvasSize();
        this.render();
      });
      this.resizeObserver.observe(this.container);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', () => {
        this.updateCanvasSize();
        this.render();
      });
    }
  }

  updateCanvasSize() {
    const rect = this.container.getBoundingClientRect();
    
    // Get display size (CSS pixels)
    const displayWidth = this.options.width || rect.width;
    const displayHeight = this.options.height || rect.height;
    
    // Set canvas internal size (accounting for device pixel ratio for crisp rendering)
    const pixelRatio = this.options.pixelRatio;
    this.canvas.width = displayWidth * pixelRatio;
    this.canvas.height = displayHeight * pixelRatio;
    
    // Set display size (CSS pixels)
    this.canvas.style.width = displayWidth + 'px';
    this.canvas.style.height = displayHeight + 'px';
    
    // Scale context to match device pixel ratio
    this.ctx.scale(pixelRatio, pixelRatio);
    
    // Store logical dimensions for coordinate calculations
    this.logicalWidth = displayWidth;
    this.logicalHeight = displayHeight;
  }

  // ============================================================================
  // Node Management
  // ============================================================================
  
  addNode(type, text, x, y) {
    const id = `node-${this.nodeIdCounter++}`;
    const node = new Node(id, type, x, y, text);
    this.nodes.push(node);
    this.render();
    this.saveState();
    return node;
  }

  deleteNode(node) {
    // Remove all connections associated with this node
    this.connections = this.connections.filter(conn => 
      conn.fromNode !== node && conn.toNode !== node
    );
    
    // Remove the node
    this.nodes = this.nodes.filter(n => n !== node);
    this.selectedNode = null;
    this.render();
    this.saveState();
  }

  // ============================================================================
  // Connection Management
  // ============================================================================

  addConnection(fromNode, fromPort, toNode, toPort) {
    // Check if connection already exists
    for (let conn of this.connections) {
      if (conn.fromNode === fromNode && conn.toNode === toNode &&
          conn.fromPort === fromPort && conn.toPort === toPort) {
        return null;
      }
    }
    
    const id = `conn-${this.connectionIdCounter++}`;
    const connection = new Connection(id, fromNode, fromPort, toNode, toPort);
    this.connections.push(connection);
    this.render();
    this.saveState();
    return connection;
  }

  deleteConnection(connection) {
    this.connections = this.connections.filter(conn => conn !== connection);
    this.selectedConnection = null;
    this.render();
    this.saveState();
  }

  getConnectionEndpointAt(x, y, threshold = 15) {
    for (let conn of this.connections) {
      const start = conn.getPortPosition(conn.fromNode, conn.fromPort);
      const end = conn.getPortPosition(conn.toNode, conn.toPort);
      
      // Check start point
      const distToStart = Math.sqrt((x - start.x) ** 2 + (y - start.y) ** 2);
      if (distToStart < threshold) {
        return { connection: conn, endpoint: 'start' };
      }
      
      // Check end point
      const distToEnd = Math.sqrt((x - end.x) ** 2 + (y - end.y) ** 2);
      if (distToEnd < threshold) {
        return { connection: conn, endpoint: 'end' };
      }
    }
    
    return null;
  }

  // ============================================================================
  // Rendering
  // ============================================================================
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#f9f9f9';
    this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
    
    // Draw grid
    this.drawGrid();
    
    // Draw all connections
    for (let conn of this.connections) {
      const isSelected = conn === this.selectedConnection;
      
      // Skip if we're reconnecting this connection
      if (this.isReconnecting && conn === this.reconnectingConnection) {
        continue;
      }
      
      conn.draw(this.ctx, isSelected);
    }
    
    // Draw reconnection preview
    if (this.isReconnecting && this.reconnectingConnection && this.tempConnectionEnd) {
      this.drawReconnectionPreview();
    }
    
    // Draw temporary connection line while creating new connection
    if (this.isConnecting && this.connectionStart && this.tempConnectionEnd) {
      this.drawConnectionPreview();
    }
    
    // Draw all nodes
    for (let node of this.nodes) {
      const isSelected = node === this.selectedNode;
      node.draw(this.ctx, isSelected);
    }
    
    // Show helper text if no nodes
    if (this.nodes.length === 0) {
      this.ctx.fillStyle = '#999';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Click buttons below to add nodes', this.logicalWidth / 2, this.logicalHeight / 2);
    }
  }
  
  drawGrid() {
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < this.logicalWidth; x += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.logicalHeight);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < this.logicalHeight; y += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.logicalWidth, y);
      this.ctx.stroke();
    }
  }

  drawReconnectionPreview() {
    const conn = this.reconnectingConnection;
    let startPos, endPos;
    
    if (this.reconnectingEnd === 'start') {
      startPos = this.tempConnectionEnd;
      endPos = conn.getPortPosition(conn.toNode, conn.toPort);
    } else {
      startPos = conn.getPortPosition(conn.fromNode, conn.fromPort);
      endPos = this.tempConnectionEnd;
    }
    
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.moveTo(startPos.x, startPos.y);
    this.ctx.lineTo(endPos.x, endPos.y);
    this.ctx.stroke();
  }

  drawConnectionPreview() {
    const startPos = this.connectionStart.getConnectionPoints().find(
      p => p.position === this.connectionStartPort
    );
    
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.moveTo(startPos.x, startPos.y);
    this.ctx.lineTo(this.tempConnectionEnd.x, this.tempConnectionEnd.y);
    this.ctx.stroke();
  }

  clear() {
    this.nodes = [];
    this.connections = [];
    this.selectedNode = null;
    this.selectedConnection = null;
    this.render();
  }

  // ============================================================================
  // Mouse Event Handlers
  // ============================================================================

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    // Calculate position based on CSS display size
    const scaleX = this.logicalWidth / rect.width;
    const scaleY = this.logicalHeight / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  handleMouseDown(e) {
    const pos = this.getMousePos(e);
    const x = pos.x;
    const y = pos.y;
    
    // Check resize handles first
    if (this.selectedNode) {
      const handle = this.selectedNode.isOnResizeHandle(x, y);
      if (handle) {
        this.startResizing(handle, x, y);
        return;
      }
    }
    
    // Check connection endpoints for reconnection
    const endpoint = this.getConnectionEndpointAt(x, y);
    if (endpoint) {
      this.startReconnecting(endpoint, x, y);
      return;
    }
    
    // Check connection points for new connection
    for (let node of this.nodes) {
      const connectionPoint = node.isOnConnectionPoint(x, y);
      if (connectionPoint) {
        this.startConnecting(node, connectionPoint, x, y);
        return;
      }
    }
    
    // Check if clicked on a node
    for (let node of this.nodes) {
      if (node.containsPoint(x, y)) {
        this.startDragging(node, x, y);
        return;
      }
    }
    
    // Check if clicked on a connection
    for (let conn of this.connections) {
      if (conn.isNearPoint(x, y)) {
        this.selectConnection(conn);
        return;
      }
    }
    
    // Clicked on empty space - deselect
    this.deselectAll();
  }
  
  handleMouseMove(e) {
    const pos = this.getMousePos(e);
    const x = pos.x;
    const y = pos.y;
    
    // Handle different mouse modes
    if (this.isResizing) {
      this.updateResize(x, y);
      return;
    }
    
    if (this.isReconnecting) {
      this.tempConnectionEnd = { x, y };
      this.render();
      return;
    }
    
    if (this.isConnecting) {
      this.tempConnectionEnd = { x, y };
      this.render();
      return;
    }
    
    if (this.isDragging && this.selectedNode) {
      this.updateDrag(x, y);
      return;
    }
    
    // Update cursor based on hover state
    this.updateCursor(x, y);
  }
  
  handleMouseUp(e) {
    const pos = this.getMousePos(e);
    const x = pos.x;
    const y = pos.y;
    
    if (this.isResizing) {
      this.finishResizing();
      return;
    }
    
    if (this.isReconnecting) {
      this.finishReconnecting(x, y);
      return;
    }
    
    if (this.isConnecting) {
      this.finishConnecting(x, y);
      return;
    }
    
    if (this.isDragging) {
      this.finishDragging();
    }
  }

  handleDoubleClick(e) {
    const pos = this.getMousePos(e);
    const x = pos.x;
    const y = pos.y;
    
    // Check if double-clicked on a node
    for (let node of this.nodes) {
      if (node.containsPoint(x, y)) {
        this.startEditingNode(node);
        return;
      }
    }
  }

  // ============================================================================
  // Mouse Interaction Helpers
  // ============================================================================

  startResizing(handle, x, y) {
    this.isResizing = true;
    this.resizeHandle = handle.position;
    this.resizeStartWidth = this.selectedNode.width;
    this.resizeStartHeight = this.selectedNode.height;
    this.resizeStartX = x;
    this.resizeStartY = y;
    this.resizeStartNodeX = this.selectedNode.x;
    this.resizeStartNodeY = this.selectedNode.y;
    this.canvas.style.cursor = this.getResizeCursor(handle.position);
  }

  updateResize(x, y) {
    const dx = x - this.resizeStartX;
    const dy = y - this.resizeStartY;
    const minWidth = 60;
    const minHeight = 40;
    
    switch(this.resizeHandle) {
      case 'top-left':
        const newWidth_tl = Math.max(minWidth, this.resizeStartWidth - dx);
        const newHeight_tl = Math.max(minHeight, this.resizeStartHeight - dy);
        const actualDx_tl = this.resizeStartWidth - newWidth_tl;
        const actualDy_tl = this.resizeStartHeight - newHeight_tl;
        this.selectedNode.width = newWidth_tl;
        this.selectedNode.height = newHeight_tl;
        this.selectedNode.x = this.resizeStartNodeX - actualDx_tl / 2;
        this.selectedNode.y = this.resizeStartNodeY - actualDy_tl / 2;
        break;
        
      case 'top-right':
        const newWidth_tr = Math.max(minWidth, this.resizeStartWidth + dx);
        const newHeight_tr = Math.max(minHeight, this.resizeStartHeight - dy);
        const actualDx_tr = newWidth_tr - this.resizeStartWidth;
        const actualDy_tr = this.resizeStartHeight - newHeight_tr;
        this.selectedNode.width = newWidth_tr;
        this.selectedNode.height = newHeight_tr;
        this.selectedNode.x = this.resizeStartNodeX + actualDx_tr / 2;
        this.selectedNode.y = this.resizeStartNodeY - actualDy_tr / 2;
        break;
        
      case 'bottom-right':
        const newWidth_br = Math.max(minWidth, this.resizeStartWidth + dx);
        const newHeight_br = Math.max(minHeight, this.resizeStartHeight + dy);
        const actualDx_br = newWidth_br - this.resizeStartWidth;
        const actualDy_br = newHeight_br - this.resizeStartHeight;
        this.selectedNode.width = newWidth_br;
        this.selectedNode.height = newHeight_br;
        this.selectedNode.x = this.resizeStartNodeX + actualDx_br / 2;
        this.selectedNode.y = this.resizeStartNodeY + actualDy_br / 2;
        break;
        
      case 'bottom-left':
        const newWidth_bl = Math.max(minWidth, this.resizeStartWidth - dx);
        const newHeight_bl = Math.max(minHeight, this.resizeStartHeight + dy);
        const actualDx_bl = this.resizeStartWidth - newWidth_bl;
        const actualDy_bl = newHeight_bl - this.resizeStartHeight;
        this.selectedNode.width = newWidth_bl;
        this.selectedNode.height = newHeight_bl;
        this.selectedNode.x = this.resizeStartNodeX - actualDx_bl / 2;
        this.selectedNode.y = this.resizeStartNodeY + actualDy_bl / 2;
        break;
    }
    
    this.render();
  }

  finishResizing() {
    this.isResizing = false;
    this.resizeHandle = null;
    this.canvas.style.cursor = 'default';
    this.saveState();
  }

  startReconnecting(endpoint, x, y) {
    this.isReconnecting = true;
    this.reconnectingConnection = endpoint.connection;
    this.reconnectingEnd = endpoint.endpoint;
    this.tempConnectionEnd = { x, y };
    this.canvas.style.cursor = 'crosshair';
    this.selectedConnection = endpoint.connection;
    this.selectedNode = null;
    this.render();
  }

  finishReconnecting(x, y) {
    for (let node of this.nodes) {
      if (node.containsPoint(x, y)) {
        const closestPoint = node.getClosestConnectionPoint(x, y);
        
        if (this.reconnectingEnd === 'start') {
          if (node !== this.reconnectingConnection.toNode) {
            this.reconnectingConnection.fromNode = node;
            this.reconnectingConnection.fromPort = closestPoint.position;
            this.saveState();
          }
        } else {
          if (node !== this.reconnectingConnection.fromNode) {
            this.reconnectingConnection.toNode = node;
            this.reconnectingConnection.toPort = closestPoint.position;
            this.saveState();
          }
        }
        break;
      }
    }
    
    this.isReconnecting = false;
    this.reconnectingConnection = null;
    this.reconnectingEnd = null;
    this.tempConnectionEnd = null;
    this.canvas.style.cursor = 'default';
    this.render();
  }

  startConnecting(node, connectionPoint, x, y) {
    this.isConnecting = true;
    this.connectionStart = node;
    this.connectionStartPort = connectionPoint.position;
    this.tempConnectionEnd = { x, y };
    this.canvas.style.cursor = 'crosshair';
  }

  finishConnecting(x, y) {
    for (let node of this.nodes) {
      if (node !== this.connectionStart && node.containsPoint(x, y)) {
        const closestPoint = node.getClosestConnectionPoint(x, y);
        this.addConnection(
          this.connectionStart, 
          this.connectionStartPort,
          node,
          closestPoint.position
        );
        break;
      }
    }
    
    this.isConnecting = false;
    this.connectionStart = null;
    this.connectionStartPort = null;
    this.tempConnectionEnd = null;
    this.canvas.style.cursor = 'default';
    this.render();
  }

  startDragging(node, x, y) {
    this.selectedNode = node;
    this.selectedConnection = null;
    this.isDragging = true;
    this.dragOffsetX = x - node.x;
    this.dragOffsetY = y - node.y;
    this.canvas.style.cursor = 'grabbing';
    this.render();
  }

  updateDrag(x, y) {
    this.selectedNode.x = x - this.dragOffsetX;
    this.selectedNode.y = y - this.dragOffsetY;
    this.render();
  }

  finishDragging() {
    this.isDragging = false;
    this.canvas.style.cursor = 'default';
    this.saveState();
  }

  selectConnection(conn) {
    this.selectedConnection = conn;
    this.selectedNode = null;
    this.render();
  }

  deselectAll() {
    this.selectedNode = null;
    this.selectedConnection = null;
    this.render();
  }

  updateCursor(x, y) {
    if (this.selectedNode) {
      const handle = this.selectedNode.isOnResizeHandle(x, y);
      if (handle) {
        this.canvas.style.cursor = this.getResizeCursor(handle.position);
        return;
      }
      
      if (this.selectedNode.isOnConnectionPoint(x, y)) {
        this.canvas.style.cursor = 'pointer';
        return;
      }
    }
    
    const endpoint = this.getConnectionEndpointAt(x, y);
    if (endpoint) {
      this.canvas.style.cursor = 'pointer';
      return;
    }
    
    if (!this.isDragging && !this.isConnecting && !this.isReconnecting) {
      this.canvas.style.cursor = 'default';
    }
  }

  getResizeCursor(position) {
    switch(position) {
      case 'top-left':
      case 'bottom-right':
        return 'nwse-resize';
      case 'top-right':
      case 'bottom-left':
        return 'nesw-resize';
      default:
        return 'default';
    }
  }

  // ============================================================================
  // Text Editing
  // ============================================================================

  startEditingNode(node) {
    this.editingNode = node;
    this.originalNodeText = node.text;
    
    node.text = '';
    this.render();
    
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = rect.width / this.logicalWidth;
    const scaleY = rect.height / this.logicalHeight;
    
    this.textInput = document.createElement('input');
    this.textInput.type = 'text';
    this.textInput.value = '';
    this.textInput.style.cssText = `
      position: absolute;
      left: ${rect.left + (node.x - node.width / 2 + 10) * scaleX}px;
      top: ${rect.top + (node.y - 10) * scaleY}px;
      width: ${(node.width - 20) * scaleX}px;
      height: 20px;
      font-size: 14px;
      font-family: Arial;
      text-align: center;
      padding: 4px;
      margin: 0;
      border: none !important;
      outline: none !important;
      background: transparent;
      background-color: transparent;
      color: #000;
      border-radius: 0;
      box-shadow: none !important;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      z-index: 1000;
    `;
    
    document.body.appendChild(this.textInput);
    this.textInput.focus();
    
    this.textInput.addEventListener('blur', () => this.finishEditingNode());
    this.textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.finishEditingNode();
      } else if (e.key === 'Escape') {
        this.cancelEditingNode();
      }
    });
  }

  finishEditingNode() {
    if (this.editingNode && this.textInput) {
      if (this.textInput.value.trim() === '') {
        this.editingNode.text = this.originalNodeText;
      } else {
        this.editingNode.text = this.textInput.value;
      }
      
      document.body.removeChild(this.textInput);
      this.textInput = null;
      this.editingNode = null;
      this.originalNodeText = null;
      this.render();
      this.saveState();
    }
  }

  cancelEditingNode() {
    if (this.textInput) {
      if (this.editingNode && this.originalNodeText !== undefined) {
        this.editingNode.text = this.originalNodeText;
      }
      
      document.body.removeChild(this.textInput);
      this.textInput = null;
      this.editingNode = null;
      this.originalNodeText = null;
      this.render();
    }
  }

  // ============================================================================
  // Keyboard Event Handler
  // ============================================================================

  handleKeyDown(e) {
    if (this.editingNode) {
      return;
    }
    
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
    
    if (ctrlKey && e.key === 'z' && !e.shiftKey) {
      this.undo();
      e.preventDefault();
      return;
    }
    
    if (ctrlKey && e.key === 'z' && e.shiftKey) {
      this.redo();
      e.preventDefault();
      return;
    }
    
    if (!isMac && ctrlKey && e.key === 'y') {
      this.redo();
      e.preventDefault();
      return;
    }
    
    if (ctrlKey && e.key === 'c') {
      this.copySelected();
      e.preventDefault();
      return;
    }
    
    if (ctrlKey && e.key === 'v') {
      this.paste();
      e.preventDefault();
      return;
    }
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.selectedNode) {
        this.deleteNode(this.selectedNode);
        e.preventDefault();
      } else if (this.selectedConnection) {
        this.deleteConnection(this.selectedConnection);
        e.preventDefault();
      }
    }
  }

  // ============================================================================
  // History Management (Undo/Redo)
  // ============================================================================

  saveState() {
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    const state = {
      nodes: this.nodes.map(node => ({
        id: node.id,
        type: node.type,
        x: node.x,
        y: node.y,
        text: node.text,
        width: node.width,
        height: node.height
      })),
      connections: this.connections.map(conn => ({
        id: conn.id,
        fromNodeId: conn.fromNode.id,
        fromPort: conn.fromPort,
        toNodeId: conn.toNode.id,
        toPort: conn.toPort
      }))
    };
    
    this.history.push(state);
    
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  restoreState(state) {
    this.nodes = [];
    this.connections = [];
    this.selectedNode = null;
    this.selectedConnection = null;
    
    const nodeMap = new Map();
    state.nodes.forEach(nodeData => {
      const node = new Node(nodeData.id, nodeData.type, nodeData.x, nodeData.y, nodeData.text);
      node.width = nodeData.width;
      node.height = nodeData.height;
      this.nodes.push(node);
      nodeMap.set(nodeData.id, node);
    });
    
    const maxNodeId = Math.max(0, ...state.nodes.map(n => parseInt(n.id.split('-')[1]) || 0));
    this.nodeIdCounter = maxNodeId + 1;
    
    state.connections.forEach(connData => {
      const fromNode = nodeMap.get(connData.fromNodeId);
      const toNode = nodeMap.get(connData.toNodeId);
      if (fromNode && toNode) {
        const conn = new Connection(connData.id, fromNode, connData.fromPort, toNode, connData.toPort);
        this.connections.push(conn);
      }
    });
    
    const maxConnId = Math.max(0, ...state.connections.map(c => parseInt(c.id.split('-')[1]) || 0));
    this.connectionIdCounter = maxConnId + 1;
    
    this.render();
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

  // ============================================================================
  // Copy/Paste
  // ============================================================================

  copySelected() {
    if (this.selectedNode) {
      this.clipboard = {
        type: 'node',
        data: {
          type: this.selectedNode.type,
          text: this.selectedNode.text,
          width: this.selectedNode.width,
          height: this.selectedNode.height
        }
      };
    }
  }

  paste() {
    if (this.clipboard && this.clipboard.type === 'node') {
      const data = this.clipboard.data;
      const newNode = this.addNode(
        data.type,
        data.text,
        this.selectedNode ? this.selectedNode.x + 30 : 150,
        this.selectedNode ? this.selectedNode.y + 30 : 150
      );
      newNode.width = data.width;
      newNode.height = data.height;
      
      this.selectedNode = newNode;
      this.saveState();
    }
  }

  // ============================================================================
  // Export/Import
  // ============================================================================

  exportToJSON() {
    const data = {
      nodes: this.nodes.map(node => ({
        id: node.id,
        type: node.type,
        x: node.x,
        y: node.y,
        text: node.text,
        width: node.width,
        height: node.height
      })),
      connections: this.connections.map(conn => ({
        id: conn.id,
        fromNodeId: conn.fromNode.id,
        fromPort: conn.fromPort,
        toNodeId: conn.toNode.id,
        toPort: conn.toPort
      }))
    };
    return JSON.stringify(data, null, 2);
  }

  importFromJSON(jsonString) {
    const data = JSON.parse(jsonString);
    this.clear();
    
    const nodeMap = new Map();
    data.nodes.forEach(nodeData => {
      const node = new Node(nodeData.id, nodeData.type, nodeData.x, nodeData.y, nodeData.text);
      node.width = nodeData.width;
      node.height = nodeData.height;
      this.nodes.push(node);
      nodeMap.set(nodeData.id, node);
    });
    
    const maxNodeId = Math.max(0, ...data.nodes.map(n => parseInt(n.id.split('-')[1]) || 0));
    this.nodeIdCounter = maxNodeId + 1;
    
    data.connections.forEach(connData => {
      const fromNode = nodeMap.get(connData.fromNodeId);
      const toNode = nodeMap.get(connData.toNodeId);
      if (fromNode && toNode) {
        const conn = new Connection(connData.id, fromNode, connData.fromPort, toNode, connData.toPort);
        this.connections.push(conn);
      }
    });
    
    const maxConnId = Math.max(0, ...data.connections.map(c => parseInt(c.id.split('-')[1]) || 0));
    this.connectionIdCounter = maxConnId + 1;
    
    this.render();
  }

  exportToPNG() {
    return this.canvas.toDataURL('image/png');
  }

  exportToPDF() {
    if (typeof jspdf === 'undefined') {
      throw new Error('jsPDF library is required for PDF export');
    }
    
    const imgData = this.canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF({
      orientation: this.canvas.width > this.canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [this.logicalWidth, this.logicalHeight]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, this.logicalWidth, this.logicalHeight);
    return pdf;
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.canvas) {
      this.canvas.remove();
    }
  }
}

// Export
export { FlowchartCanvas as Canvas, Node, Connection };
export default { Canvas: FlowchartCanvas, Node, Connection };

if (typeof window !== 'undefined') {
  window.FlowchartLib = { Canvas: FlowchartCanvas, Node, Connection };
}