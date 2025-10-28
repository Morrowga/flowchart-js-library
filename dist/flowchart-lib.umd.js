/*!
 * FlowchartLib v1.0.0
 * (c) 2025
 * @license MIT
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jszip'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('jszip'));
  } else {
    root.FlowchartLib = factory(root.JSZip);
  }
}(typeof self !== 'undefined' ? self : this, function(JSZip) {
  'use strict';
  
  // Make JSZip available globally within the library
  if (typeof window !== 'undefined' && !window.JSZip && JSZip) {
    window.JSZip = JSZip;
  }
  
  // Node class
  // src/Node.js
// Represents a single flowchart node with zoom support and customizable properties

class Node {
  constructor(id, type, x, y, text = '') {
    this.id = id;
    this.type = type;  // 'start', 'process', 'decision', 'end'
    this.x = x;
    this.y = y;
    this.text = text;
    this.width = 120;
    this.height = 60;
    this.selected = false;
    
    // Customizable properties with default values
    this.link = '';  // URL link (blank)
    this.fillColor = '#FFFFFF';  // White
    this.fontColor = '#000000';  // Black
    this.fontSize = 14;  // Normal
    this.outlineColor = '#000000';  // Black
    this.outlineWidth = 2;
  }
  
  // ============================================================================
  // Point Detection
  // ============================================================================
  
  containsPoint(x, y) {
    return x >= this.x - this.width / 2 &&
           x <= this.x + this.width / 2 &&
           y >= this.y - this.height / 2 &&
           y <= this.y + this.height / 2;
  }

  isOnConnectionPoint(x, y, zoom = 1) {
    const points = this.getConnectionPoints();
    const threshold = 10 / zoom; // Adjust threshold based on zoom
    
    for (let point of points) {
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      if (distance < threshold) {
        return point;
      }
    }
    return null;
  }

  isOnResizeHandle(x, y, zoom = 1) {
    const handles = this.getResizeHandles();
    const threshold = 8 / zoom; // Adjust threshold based on zoom
    
    for (let handle of handles) {
      const distance = Math.sqrt((x - handle.x) ** 2 + (y - handle.y) ** 2);
      if (distance < threshold) {
        return handle;
      }
    }
    return null;
  }

  // ============================================================================
  // Connection Points
  // ============================================================================

  getConnectionPoints() {
    return [
      { x: this.x, y: this.y - this.height / 2, position: 'top' },
      { x: this.x + this.width / 2, y: this.y, position: 'right' },
      { x: this.x, y: this.y + this.height / 2, position: 'bottom' },
      { x: this.x - this.width / 2, y: this.y, position: 'left' }
    ];
  }

  getClosestConnectionPoint(x, y) {
    const points = this.getConnectionPoints();
    let closest = points[0];
    let minDistance = Infinity;
    
    for (let point of points) {
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closest = point;
      }
    }
    
    return closest;
  }

  // ============================================================================
  // Resize Handles
  // ============================================================================

  getResizeHandles() {
    const left = this.x - this.width / 2;
    const right = this.x + this.width / 2;
    const top = this.y - this.height / 2;
    const bottom = this.y + this.height / 2;
    
    return [
      { x: left, y: top, position: 'top-left' },
      { x: right, y: top, position: 'top-right' },
      { x: right, y: bottom, position: 'bottom-right' },
      { x: left, y: bottom, position: 'bottom-left' }
    ];
  }

  // ============================================================================
  // Settings Methods
  // ============================================================================
  
  updateSettings(settings) {
    if (settings.text !== undefined) this.text = settings.text;
    if (settings.link !== undefined) this.link = settings.link;
    if (settings.fillColor !== undefined) this.fillColor = settings.fillColor;
    if (settings.fontColor !== undefined) this.fontColor = settings.fontColor;
    if (settings.fontSize !== undefined) this.fontSize = settings.fontSize;
    if (settings.outlineColor !== undefined) this.outlineColor = settings.outlineColor;
    if (settings.outlineWidth !== undefined) this.outlineWidth = settings.outlineWidth;
  }

  getSettings() {
    return {
      text: this.text,
      link: this.link,
      fillColor: this.fillColor,
      fontColor: this.fontColor,
      fontSize: this.fontSize,
      outlineColor: this.outlineColor,
      outlineWidth: this.outlineWidth
    };
  }

  // ============================================================================
  // Drawing Methods
  // ============================================================================
  
  draw(ctx, isSelected = false) {
    ctx.save();
    
    // Set styles using custom properties
    ctx.fillStyle = this.fillColor;
    ctx.strokeStyle = isSelected ? '#2196F3' : this.outlineColor;
    ctx.lineWidth = isSelected ? 3 : this.outlineWidth;
    
    // Draw shape based on type
    switch(this.type) {
      case 'start':
      case 'end':
        this.drawRounded(ctx);
        break;
      case 'process':
        this.drawRectangle(ctx);
        break;
      case 'decision':
        this.drawDiamond(ctx);
        break;
      default:
        this.drawRectangle(ctx);
    }
    
    // Draw text with custom properties
    this.drawText(ctx);

    // Draw connection points
    this.drawConnectionPoints(ctx);

    // Draw selection highlight and resize handles
    if (isSelected) {
      this.drawSelectionOutline(ctx);
      this.drawResizeHandles(ctx);
    }

    ctx.restore();
  }
  
  drawRounded(ctx) {
    const x = this.x - this.width / 2;
    const y = this.y - this.height / 2;
    const radius = this.height / 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + this.width - radius, y);
    ctx.arcTo(x + this.width, y, x + this.width, y + radius, radius);
    ctx.lineTo(x + this.width, y + this.height - radius);
    ctx.arcTo(x + this.width, y + this.height, x + this.width - radius, y + this.height, radius);
    ctx.lineTo(x + radius, y + this.height);
    ctx.arcTo(x, y + this.height, x, y + this.height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
  }
  
  drawRectangle(ctx) {
    const x = this.x - this.width / 2;
    const y = this.y - this.height / 2;
    
    ctx.fillRect(x, y, this.width, this.height);
    ctx.strokeRect(x, y, this.width, this.height);
  }
  
  drawDiamond(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.height / 2);
    ctx.lineTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x, this.y + this.height / 2);
    ctx.lineTo(this.x - this.width / 2, this.y);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
  }
  
  drawText(ctx) {
    ctx.fillStyle = this.fontColor;
    ctx.font = `${this.fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Handle multi-line text
    const lines = this.text.split('\n');
    const lineHeight = this.fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const startY = this.y - totalHeight / 2 + lineHeight / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, this.x, startY + index * lineHeight);
    });
  }

  drawConnectionPoints(ctx) {
    const points = this.getConnectionPoints();
    
    for (let point of points) {
      // Draw circle background - BLACK
      ctx.fillStyle = '#000';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw + icon - WHITE
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(point.x - 4, point.y);
      ctx.lineTo(point.x + 4, point.y);
      ctx.stroke();
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(point.x, point.y - 4);
      ctx.lineTo(point.x, point.y + 4);
      ctx.stroke();
    }
  }

  drawSelectionOutline(ctx) {
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    
    switch(this.type) {
      case 'start':
      case 'end':
        this.drawRoundedSelectionOutline(ctx);
        break;
      case 'decision':
        this.drawDiamondSelectionOutline(ctx);
        break;
      default:
        this.drawRectangleSelectionOutline(ctx);
    }
    
    ctx.setLineDash([]);
  }

  drawRoundedSelectionOutline(ctx) {
    const x = this.x - this.width / 2;
    const y = this.y - this.height / 2;
    const radius = this.height / 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + this.width - radius, y);
    ctx.arcTo(x + this.width, y, x + this.width, y + radius, radius);
    ctx.lineTo(x + this.width, y + this.height - radius);
    ctx.arcTo(x + this.width, y + this.height, x + this.width - radius, y + this.height, radius);
    ctx.lineTo(x + radius, y + this.height);
    ctx.arcTo(x, y + this.height, x, y + this.height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.stroke();
  }

  drawDiamondSelectionOutline(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.height / 2 - 5);
    ctx.lineTo(this.x + this.width / 2 + 5, this.y);
    ctx.lineTo(this.x, this.y + this.height / 2 + 5);
    ctx.lineTo(this.x - this.width / 2 - 5, this.y);
    ctx.closePath();
    ctx.stroke();
  }

  drawRectangleSelectionOutline(ctx) {
    ctx.strokeRect(
      this.x - this.width / 2 - 5,
      this.y - this.height / 2 - 5,
      this.width + 10,
      this.height + 10
    );
  }

  drawResizeHandles(ctx) {
    const handles = this.getResizeHandles();
    
    ctx.fillStyle = '#2196F3';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    
    for (let handle of handles) {
      ctx.fillRect(handle.x - 4, handle.y - 4, 8, 8);
      ctx.strokeRect(handle.x - 4, handle.y - 4, 8, 8);
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  getFillColor() {
    return this.fillColor;
  }
}
  
  // Connection class
  // src/Connection.js
// Represents a connection between two flowchart nodes with orthogonal routing

class Connection {
  constructor(id, fromNode, fromPort, toNode, toPort) {
    this.id = id;
    this.fromNode = fromNode;
    this.fromPort = fromPort;
    this.toNode = toNode;
    this.toPort = toPort;
    this.selected = false;
    this.waypoints = [];
  }
  
  getPortPosition(node, port) {
    switch(port) {
      case 'top':
        return { x: node.x, y: node.y - node.height / 2 };
      case 'right':
        return { x: node.x + node.width / 2, y: node.y };
      case 'bottom':
        return { x: node.x, y: node.y + node.height / 2 };
      case 'left':
        return { x: node.x - node.width / 2, y: node.y };
      default:
        return { x: node.x, y: node.y };
    }
  }

  isNearPoint(x, y, zoom = 1, threshold = 15) {
    const adjustedThreshold = threshold / zoom;
    const points = this.getPathPoints();
    
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      const dist = this.pointToLineDistance(x, y, start.x, start.y, end.x, end.y);
      if (dist < adjustedThreshold) {
        return true;
      }
    }
    return false;
  }

  distanceToPoint(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  pointToLineDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;
    
    if (lengthSquared === 0) {
      return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }
    
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    
    const nearestX = x1 + t * dx;
    const nearestY = y1 + t * dy;
    
    return Math.sqrt((px - nearestX) * (px - nearestX) + (py - nearestY) * (py - nearestY));
  }

  getPathPoints() {
    const start = this.getPortPosition(this.fromNode, this.fromPort);
    const end = this.getPortPosition(this.toNode, this.toPort);
    
    if (this.waypoints.length > 0) {
      return [start, ...this.waypoints, end];
    }
    
    return this.calculateOrthogonalPath(start, end, this.fromPort, this.toPort);
  }

  calculateOrthogonalPath(start, end, startPort, endPort) {
    const points = [start];
    const offset = 30;
    
    // Check for simple aligned cases - straight line
    const isHorizontallyAligned = Math.abs(start.y - end.y) < 10;
    const isVerticallyAligned = Math.abs(start.x - end.x) < 10;
    
    if (isHorizontallyAligned && (startPort === 'left' || startPort === 'right') &&
        (endPort === 'left' || endPort === 'right')) {
      points.push(end);
      return points;
    }
    
    if (isVerticallyAligned && (startPort === 'top' || startPort === 'bottom') &&
        (endPort === 'top' || endPort === 'bottom')) {
      points.push(end);
      return points;
    }
    
    // Get directions
    const startDir = this.getPortDirection(startPort);
    const endDir = this.getPortDirection(endPort);
    
    // PERPENDICULAR CONNECTIONS (horizontal to vertical OR vertical to horizontal)
    // These ALWAYS use simple L-shape: start -> corner -> end (3 points total)
    if ((startPort === 'right' || startPort === 'left') && 
        (endPort === 'top' || endPort === 'bottom')) {
      // Horizontal start to vertical end
      points.push({ x: end.x, y: start.y });
      points.push(end);
      return points;
    }
    
    if ((startPort === 'top' || startPort === 'bottom') && 
        (endPort === 'right' || endPort === 'left')) {
      // Vertical start to horizontal end  
      points.push({ x: start.x, y: end.y });
      points.push(end);
      return points;
    }
    
    // PARALLEL CONNECTIONS (both horizontal OR both vertical)
    // These need offset points and middle segments
    const p1 = {
      x: start.x + startDir.x * offset,
      y: start.y + startDir.y * offset
    };
    
    const p2 = {
      x: end.x + endDir.x * offset,
      y: end.y + endDir.y * offset
    };
    
    points.push(p1);
    
    if ((startPort === 'right' || startPort === 'left') && 
        (endPort === 'right' || endPort === 'left')) {
      // Both horizontal
      const midX = (p1.x + p2.x) / 2;
      points.push({ x: midX, y: p1.y });
      points.push({ x: midX, y: p2.y });
    } else if ((startPort === 'top' || startPort === 'bottom') && 
               (endPort === 'top' || endPort === 'bottom')) {
      // Both vertical
      const midY = (p1.y + p2.y) / 2;
      points.push({ x: p1.x, y: midY });
      points.push({ x: p2.x, y: midY });
    }
    
    points.push(p2);
    points.push(end);
    
    return points;
  }

  getPortDirection(port) {
    switch(port) {
      case 'top': return { x: 0, y: -1 };
      case 'right': return { x: 1, y: 0 };
      case 'bottom': return { x: 0, y: 1 };
      case 'left': return { x: -1, y: 0 };
      default: return { x: 0, y: 0 };
    }
  }

  draw(ctx, isSelected = false) {
    ctx.save();
    
    const points = this.getPathPoints();
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
    
    if (isSelected && this.waypoints.length > 0) {
      ctx.fillStyle = '#2196F3';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      
      this.waypoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }
    
    ctx.restore();
  }
}
  
  // Area class
  // src/Area.js
// Represents a rectangular area/section in the flowchart

class Area {
  constructor(id, x1, y1, x2, y2, title = 'Section') {
    this.id = id;
    this.x1 = Math.min(x1, x2);
    this.y1 = Math.min(y1, y2);
    this.x2 = Math.max(x1, x2);
    this.y2 = Math.max(y1, y2);
    this.title = title;
    this.selected = false;
    
    // Visual properties
    this.fillColor = 'rgba(33, 150, 243, 0.1)';
    this.outlineColor = '#000';
    this.outlineWidth = 1;
    this.titleBgColor = '#000';
    this.titleTextColor = '#FFFFFF';
  }
  
  get width() {
    return this.x2 - this.x1;
  }
  
  get height() {
    return this.y2 - this.y1;
  }
  
  containsPoint(x, y) {
    return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2;
  }
  
  isOnTitleBar(x, y) {
    const titleHeight = 30;
    return x >= this.x1 && x <= this.x2 && 
           y >= this.y1 - titleHeight && y <= this.y1;
  }
  
  isOnResizeHandle(x, y, zoom = 1) {
    const handles = this.getResizeHandles();
    const threshold = 8 / zoom;
    
    for (let handle of handles) {
      const distance = Math.sqrt((x - handle.x) ** 2 + (y - handle.y) ** 2);
      if (distance < threshold) {
        return handle;
      }
    }
    return null;
  }
  
  getResizeHandles() {
    return [
      { x: this.x1, y: this.y1, position: 'top-left' },
      { x: this.x2, y: this.y1, position: 'top-right' },
      { x: this.x2, y: this.y2, position: 'bottom-right' },
      { x: this.x1, y: this.y2, position: 'bottom-left' },
      { x: (this.x1 + this.x2) / 2, y: this.y1, position: 'top' },
      { x: this.x2, y: (this.y1 + this.y2) / 2, position: 'right' },
      { x: (this.x1 + this.x2) / 2, y: this.y2, position: 'bottom' },
      { x: this.x1, y: (this.y1 + this.y2) / 2, position: 'left' }
    ];
  }
  
  updateSettings(settings) {
    if (settings.title !== undefined) this.title = settings.title;
    if (settings.fillColor !== undefined) this.fillColor = settings.fillColor;
    if (settings.outlineColor !== undefined) this.outlineColor = settings.outlineColor;
    if (settings.titleBgColor !== undefined) this.titleBgColor = settings.titleBgColor;
  }
  
  getSettings() {
    return {
      title: this.title,
      fillColor: this.fillColor,
      outlineColor: this.outlineColor,
      titleBgColor: this.titleBgColor
    };
  }
  
  draw(ctx, isSelected = false) {
    ctx.save();
    
    // Draw filled rectangle
    ctx.fillStyle = this.fillColor;
    ctx.fillRect(this.x1, this.y1, this.width, this.height);
    
    // Draw outline
    ctx.strokeStyle = isSelected ? '#FF9800' : this.outlineColor;
    ctx.lineWidth = isSelected ? 3 : this.outlineWidth;
    ctx.setLineDash(isSelected ? [5, 5] : []);
    ctx.strokeRect(this.x1, this.y1, this.width, this.height);
    ctx.setLineDash([]);
    
    // Draw title bar
    const titleHeight = 30;
    ctx.fillStyle = this.titleBgColor;
    ctx.fillRect(this.x1, this.y1 - titleHeight, this.width, titleHeight);
    
    // Draw title text
    ctx.fillStyle = this.titleTextColor;
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.title, this.x1 + 10, this.y1 - titleHeight / 2);
    
    // Draw resize handles if selected
    if (isSelected) {
      this.drawResizeHandles(ctx);
    }
    
    ctx.restore();
  }
  
  drawResizeHandles(ctx) {
    const handles = this.getResizeHandles();
    
    ctx.fillStyle = '#FF9800';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    
    for (let handle of handles) {
      ctx.fillRect(handle.x - 4, handle.y - 4, 8, 8);
      ctx.strokeRect(handle.x - 4, handle.y - 4, 8, 8);
    }
  }
}
  
  // NodeSettingsDialog class
  // src/NodeSettingsDialog.js
// Dialog for editing node properties that appears beside the cursor

class NodeSettingsDialog {
  constructor(canvas) {
    this.canvas = canvas;
    this.dialog = null;
    this.currentNode = null;
    this.onSave = null;
    this.createDialog();
  }

  createDialog() {
    // Create dialog container
    this.dialog = document.createElement('div');
    this.dialog.className = 'flowchart-node-settings-dialog';
    this.dialog.style.cssText = `
      position: fixed;
      background: white;
      border: 2px solid #2196F3;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      display: none;
      min-width: 320px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    `;

    // Create dialog content
    this.dialog.innerHTML = `
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; border-bottom: 2px solid #2196F3; padding-bottom: 8px;">
          Node Settings
        </h3>
      </div>

      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555; font-size: 13px;">
          Text (use Shift+Enter for line breaks):
        </label>
        <textarea id="node-text" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; font-family: Arial, sans-serif; resize: vertical;"></textarea>
      </div>

      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555; font-size: 13px;">
          Link (URL):
        </label>
        <input type="url" id="node-link" placeholder="https://example.com" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555; font-size: 13px;">
            Fill Color:
          </label>
          <div style="display: flex; gap: 5px; align-items: center;">
            <input type="color" id="node-fill-color" style="width: 50px; height: 32px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
            <input type="text" id="node-fill-color-text" placeholder="#FFFFFF" style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; font-family: monospace;">
          </div>
        </div>

        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555; font-size: 13px;">
            Font Color:
          </label>
          <div style="display: flex; gap: 5px; align-items: center;">
            <input type="color" id="node-font-color" style="width: 50px; height: 32px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
            <input type="text" id="node-font-color-text" placeholder="#000000" style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; font-family: monospace;">
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555; font-size: 13px;">
            Font Size:
          </label>
          <input type="number" id="node-font-size" min="8" max="48" value="14" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
        </div>

        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555; font-size: 13px;">
            Outline Width:
          </label>
          <input type="number" id="node-outline-width" min="1" max="10" value="2" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
        </div>
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #555; font-size: 13px;">
          Outline Color:
        </label>
        <div style="display: flex; gap: 5px; align-items: center;">
          <input type="color" id="node-outline-color" style="width: 50px; height: 32px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
          <input type="text" id="node-outline-color-text" placeholder="#000000" style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; font-family: monospace;">
        </div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
        <button id="node-settings-cancel" style="padding: 8px 20px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; color: #666;">
          Cancel
        </button>
        <button id="node-settings-save" style="padding: 8px 20px; border: none; background: #2196F3; color: white; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500;">
          Save
        </button>
      </div>
    `;

    document.body.appendChild(this.dialog);

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // PREVENT KEYBOARD EVENTS FROM BUBBLING TO CANVAS
    this.dialog.addEventListener('keydown', (e) => {
      e.stopPropagation();
    });
    
    this.dialog.addEventListener('keyup', (e) => {
      e.stopPropagation();
    });

    // Color picker sync with text input
    const fillColorPicker = this.dialog.querySelector('#node-fill-color');
    const fillColorText = this.dialog.querySelector('#node-fill-color-text');
    fillColorPicker.addEventListener('input', (e) => {
      fillColorText.value = e.target.value.toUpperCase();
    });
    fillColorText.addEventListener('input', (e) => {
      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        fillColorPicker.value = e.target.value;
      }
    });

    const fontColorPicker = this.dialog.querySelector('#node-font-color');
    const fontColorText = this.dialog.querySelector('#node-font-color-text');
    fontColorPicker.addEventListener('input', (e) => {
      fontColorText.value = e.target.value.toUpperCase();
    });
    fontColorText.addEventListener('input', (e) => {
      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        fontColorPicker.value = e.target.value;
      }
    });

    const outlineColorPicker = this.dialog.querySelector('#node-outline-color');
    const outlineColorText = this.dialog.querySelector('#node-outline-color-text');
    outlineColorPicker.addEventListener('input', (e) => {
      outlineColorText.value = e.target.value.toUpperCase();
    });
    outlineColorText.addEventListener('input', (e) => {
      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        outlineColorPicker.value = e.target.value;
      }
    });

    // Save button
    this.dialog.querySelector('#node-settings-save').addEventListener('click', () => {
      this.saveSettings();
    });

    // Cancel button
    this.dialog.querySelector('#node-settings-cancel').addEventListener('click', () => {
      this.hide();
    });

    // Close on Escape key - but still allow it through
    this.dialog.querySelector('#node-text').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.saveSettings();
      }
    });
  }


  show(node, cursorX, cursorY) {
    this.currentNode = node;
    
    // Store original settings to restore on cancel
    this.originalSettings = {
      text: node.text,
      link: node.link,
      fillColor: node.fillColor,
      fontColor: node.fontColor,
      fontSize: node.fontSize,
      outlineColor: node.outlineColor,
      outlineWidth: node.outlineWidth
    };
    
    // Populate fields with current node values
    const settings = node.getSettings();
    this.dialog.querySelector('#node-text').value = settings.text;
    this.dialog.querySelector('#node-link').value = settings.link || '';
    
    // Fill color
    this.dialog.querySelector('#node-fill-color').value = settings.fillColor;
    this.dialog.querySelector('#node-fill-color-text').value = settings.fillColor.toUpperCase();
    
    // Font color
    this.dialog.querySelector('#node-font-color').value = settings.fontColor;
    this.dialog.querySelector('#node-font-color-text').value = settings.fontColor.toUpperCase();
    
    // Font size
    this.dialog.querySelector('#node-font-size').value = settings.fontSize;
    
    // Outline color
    this.dialog.querySelector('#node-outline-color').value = settings.outlineColor;
    this.dialog.querySelector('#node-outline-color-text').value = settings.outlineColor.toUpperCase();
    
    // Outline width
    this.dialog.querySelector('#node-outline-width').value = settings.outlineWidth;

    // Show dialog
    this.dialog.style.display = 'block';

    // Position beside cursor with boundary checks
    this.positionDialog(cursorX, cursorY);

    // Focus on text input
    setTimeout(() => {
      const textInput = this.dialog.querySelector('#node-text');
      textInput.focus();
      textInput.setSelectionRange(textInput.value.length, textInput.value.length);
    }, 10);
  }

  positionDialog(cursorX, cursorY) {
    // Get dialog dimensions
    const dialogRect = this.dialog.getBoundingClientRect();
    const dialogWidth = dialogRect.width;
    const dialogHeight = dialogRect.height;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default position: beside cursor (to the right)
    let left = cursorX + 20; // 20px offset to the right
    let top = cursorY;

    // Adjust horizontal position if dialog goes off screen
    if (left + dialogWidth > viewportWidth) {
      // Place to the left of cursor instead
      left = cursorX - dialogWidth - 20;
    }

    // Ensure dialog doesn't go off the left edge
    if (left < 10) {
      left = 10;
    }

    // Adjust vertical position if dialog goes off screen
    if (top + dialogHeight > viewportHeight) {
      // Move up
      top = viewportHeight - dialogHeight - 10;
    }

    // Ensure dialog doesn't go off the top edge
    if (top < 10) {
      top = 10;
    }

    this.dialog.style.left = `${left}px`;
    this.dialog.style.top = `${top}px`;
  }

  saveSettings() {
    if (!this.currentNode) return;

    // Get text value and validate - prevent empty text
    const textInput = this.dialog.querySelector('#node-text').value.trim();
    if (textInput === '') {
      alert('Text cannot be empty. Keeping original value.');
      this.dialog.querySelector('#node-text').value = this.originalSettings.text;
      return;
    }

    // Get values from inputs
    const fontSizeInput = this.dialog.querySelector('#node-font-size').value.trim();
    const outlineWidthInput = this.dialog.querySelector('#node-outline-width').value.trim();

    // Parse and validate - use current value if empty or invalid
    let fontSize = parseInt(fontSizeInput);
    if (isNaN(fontSize) || fontSizeInput === '') {
      fontSize = this.currentNode.fontSize; // Keep current value
    } else {
      fontSize = Math.max(8, Math.min(48, fontSize)); // Validate range
    }
    
    let outlineWidth = parseInt(outlineWidthInput);
    if (isNaN(outlineWidth) || outlineWidthInput === '') {
      outlineWidth = this.currentNode.outlineWidth; // Keep current value
    } else {
      outlineWidth = Math.max(1, Math.min(10, outlineWidth)); // Validate range
    }

    const settings = {
      text: textInput,
      link: this.dialog.querySelector('#node-link').value,
      fillColor: this.dialog.querySelector('#node-fill-color').value,
      fontColor: this.dialog.querySelector('#node-font-color').value,
      fontSize: fontSize,
      outlineColor: this.dialog.querySelector('#node-outline-color').value,
      outlineWidth: outlineWidth
    };

    this.currentNode.updateSettings(settings);
    
    // Clear original settings so hide() won't restore them
    this.originalSettings = null;
    
    if (this.onSave) {
      this.onSave(this.currentNode, settings);
    }

    this.hide();
  }

  hide() {
    // Restore original settings if they exist (means dialog was cancelled, not saved)
    if (this.currentNode && this.originalSettings) {
      this.currentNode.updateSettings(this.originalSettings);
      // Trigger a render to show the restored values
      if (this.canvas && this.canvas.render) {
        this.canvas.render();
      }
    }
    
    this.dialog.style.display = 'none';
    this.currentNode = null;
    this.originalSettings = null;
  }

  destroy() {
    if (this.dialog && this.dialog.parentNode) {
      this.dialog.parentNode.removeChild(this.dialog);
    }
  }
}
  
  // AreaSettingsDialog class
  // src/AreaSettingsDialog.js
// Dialog for editing area properties

class AreaSettingsDialog {
  constructor(onSave, onCancel) {
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.dialog = null;
    this.area = null;
  }

  show(area, x, y) {
    this.area = area;
    this.createDialog(x, y);
  }

  createDialog(x, y) {
    if (this.dialog) {
      this.close();
    }

    this.dialog = document.createElement('div');
    this.dialog.style.cssText = `
      position: fixed;
      background: white;
      border: 2px solid #2196F3;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      min-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    `;

    const settings = this.area.getSettings();

    this.dialog.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Area Settings</h3>
        
        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 5px; color: #555; font-size: 13px;">Title:</label>
          <input type="text" id="areaTitle" value="${settings.title}" 
                 style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 5px; color: #555; font-size: 13px;">Fill Color:</label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="color" id="areaFillColorPicker" value="${this.rgbaToHex(settings.fillColor)}"
                   style="width: 50px; height: 35px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
            <input type="range" id="areaFillOpacity" min="0" max="100" value="${this.getOpacity(settings.fillColor)}"
                   style="flex: 1;">
            <span id="areaFillOpacityValue" style="min-width: 40px; color: #555; font-size: 13px;">${this.getOpacity(settings.fillColor)}%</span>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 5px; color: #555; font-size: 13px;">Outline Color:</label>
          <input type="color" id="areaOutlineColor" value="${settings.outlineColor}"
                 style="width: 50px; height: 35px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 5px; color: #555; font-size: 13px;">Title Background:</label>
          <input type="color" id="areaTitleBgColor" value="${settings.titleBgColor}"
                 style="width: 50px; height: 35px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
        </div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="areaCancelBtn" style="padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd; 
                border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
        <button id="areaSaveBtn" style="padding: 8px 16px; background: #2196F3; color: white; border: none; 
                border-radius: 4px; cursor: pointer; font-size: 14px;">Save</button>
      </div>
    `;

    document.body.appendChild(this.dialog);

    // Position the dialog beside the cursor, adjusting if off-screen
    const dialogRect = this.dialog.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Default: position to the right of cursor
    let finalX = x + 20;
    let finalY = y;
    
    // Check if dialog goes off right edge
    if (finalX + dialogRect.width > windowWidth) {
      // Position to the left of cursor instead
      finalX = x - dialogRect.width - 20;
    }
    
    // Check if dialog goes off left edge
    if (finalX < 10) {
      finalX = 10;
    }
    
    // Check if dialog goes off bottom
    if (finalY + dialogRect.height > windowHeight) {
      finalY = windowHeight - dialogRect.height - 10;
    }
    
    // Check if dialog goes off top
    if (finalY < 10) {
      finalY = 10;
    }
    
    this.dialog.style.left = finalX + 'px';
    this.dialog.style.top = finalY + 'px';

    // Event listeners
    const opacitySlider = document.getElementById('areaFillOpacity');
    const opacityValue = document.getElementById('areaFillOpacityValue');
    
    opacitySlider.addEventListener('input', () => {
      opacityValue.textContent = opacitySlider.value + '%';
    });

    document.getElementById('areaSaveBtn').addEventListener('click', () => {
      this.save();
    });

    document.getElementById('areaCancelBtn').addEventListener('click', () => {
      this.close();
      if (this.onCancel) this.onCancel();
    });

    // Prevent dialog from closing when clicking inside
    this.dialog.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick);
    }, 100);
  }

  handleOutsideClick = (e) => {
    if (this.dialog && !this.dialog.contains(e.target)) {
      this.close();
      if (this.onCancel) this.onCancel();
    }
  };

  save() {
    const title = document.getElementById('areaTitle').value;
    const fillColorHex = document.getElementById('areaFillColorPicker').value;
    const fillOpacity = document.getElementById('areaFillOpacity').value / 100;
    const fillColor = this.hexToRgba(fillColorHex, fillOpacity);
    const outlineColor = document.getElementById('areaOutlineColor').value;
    const titleBgColor = document.getElementById('areaTitleBgColor').value;

    if (this.onSave) {
      this.onSave({
        title,
        fillColor,
        outlineColor,
        titleBgColor
      });
    }

    this.close();
  }

  close() {
    if (this.dialog) {
      document.removeEventListener('click', this.handleOutsideClick);
      this.dialog.remove();
      this.dialog = null;
    }
  }

  rgbaToHex(rgba) {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return '#2196F3';
  }

  getOpacity(rgba) {
    const match = rgba.match(/rgba?\([^,]+,[^,]+,[^,]+,?\s*([0-9.]+)?\)/);
    if (match && match[1]) {
      return Math.round(parseFloat(match[1]) * 100);
    }
    return 100;
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
  
  // Main Canvas class
  // src/index.js
// Main flowchart canvas class with pan/zoom support







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




if (typeof window !== 'undefined') {
  
}
  
  // Export
  return {
    Canvas: FlowchartCanvas,
    Node: Node,
    Connection: Connection,
    Area: Area,
    NodeSettingsDialog: NodeSettingsDialog,
    AreaSettingsDialog: AreaSettingsDialog
  };
}));
