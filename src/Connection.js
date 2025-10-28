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

export default Connection;