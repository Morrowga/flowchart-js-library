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

export default Area;