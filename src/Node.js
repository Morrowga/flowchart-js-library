// src/Node.js
// Represents a single flowchart node

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

  isOnConnectionPoint(x, y) {
    const points = this.getConnectionPoints();
    for (let point of points) {
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      if (distance < 10) {
        return point;
      }
    }
    return null;
  }

  isOnResizeHandle(x, y) {
    const handles = this.getResizeHandles();
    for (let handle of handles) {
      const distance = Math.sqrt((x - handle.x) ** 2 + (y - handle.y) ** 2);
      if (distance < 8) {
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
  // Drawing Methods
  // ============================================================================
  
  draw(ctx, isSelected = false) {
    ctx.save();
    
    // Set styles
    ctx.fillStyle = this.getFillColor();
    ctx.strokeStyle = isSelected ? '#2196F3' : '#333';
    ctx.lineWidth = isSelected ? 3 : 2;
    
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
    
    // Draw text
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
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x, this.y);
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
    switch(this.type) {
      case 'start': return '#90EE90';  // Light green
      case 'end': return '#FFB6C1';     // Light pink
      case 'process': return '#87CEEB'; // Light blue
      case 'decision': return '#FFD700'; // Gold
      default: return '#FFF';
    }
  }
}

export default Node;
