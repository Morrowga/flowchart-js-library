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

export default Node;