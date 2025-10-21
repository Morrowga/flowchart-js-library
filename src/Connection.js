// src/Connection.js
// Represents a connection between two flowchart nodes

class Connection {
  constructor(id, fromNode, fromPort, toNode, toPort) {
    this.id = id;
    this.fromNode = fromNode;
    this.fromPort = fromPort; // 'top', 'right', 'bottom', 'left'
    this.toNode = toNode;
    this.toPort = toPort; // 'top', 'right', 'bottom', 'left'
    this.selected = false;
  }
  
  // ============================================================================
  // Port Position
  // ============================================================================
  
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

  // ============================================================================
  // Point Detection
  // ============================================================================

  isNearPoint(x, y, threshold = 15) {
    const start = this.getPortPosition(this.fromNode, this.fromPort);
    const end = this.getPortPosition(this.toNode, this.toPort);
    
    // Check if near start or end point
    if (this.distanceToPoint(x, y, start.x, start.y) < threshold) {
      return true;
    }
    if (this.distanceToPoint(x, y, end.x, end.y) < threshold) {
      return true;
    }
    
    // Check if near the line
    const dist = this.pointToLineDistance(x, y, start.x, start.y, end.x, end.y);
    
    // Check middle area (for curved lines)
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    if (this.distanceToPoint(x, y, midX, midY) < threshold * 2) {
      return true;
    }
    
    return dist < threshold;
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

  // ============================================================================
  // Drawing Methods
  // ============================================================================
  
  draw(ctx, isSelected = false) {
    ctx.save();
    
    const start = this.getPortPosition(this.fromNode, this.fromPort);
    const end = this.getPortPosition(this.toNode, this.toPort);
    
    // Set style - ALWAYS BLACK, solid line
    ctx.strokeStyle = '#000';  // Always black
    ctx.lineWidth = isSelected ? 3 : 2;  // Thicker when selected
    ctx.setLineDash([]);  // Solid line (no dashes)
    
    // Draw the connection line
    this.drawConnectionLine(ctx, start, end);
    
    // Arrow head removed - no longer drawing it
    
    ctx.restore();
  }

  drawConnectionLine(ctx, start, end) {
    const needsBend = this.needsBendingPath(start, end);
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    
    if (needsBend) {
      // Create smooth path with control points
      const offset = 50;
      const cp1 = this.getControlPoint(start, this.fromPort, offset);
      const cp2 = this.getControlPoint(end, this.toPort, offset);
      
      // Draw curved line
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    } else {
      // Simple straight line
      ctx.lineTo(end.x, end.y);
    }
    
    ctx.stroke();
  }

  getControlPoint(point, port, offset) {
    switch(port) {
      case 'right':
        return { x: point.x + offset, y: point.y };
      case 'left':
        return { x: point.x - offset, y: point.y };
      case 'top':
        return { x: point.x, y: point.y - offset };
      case 'bottom':
        return { x: point.x, y: point.y + offset };
      default:
        return point;
    }
  }

  needsBendingPath(start, end) {
    // Simple heuristic: if distance is large or not aligned, use curves
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    return dx > 50 || dy > 50;
  }
  
  drawArrowHead(ctx, start, end) {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLength = 12;
    
    // Adjust arrow angle based on which port we're connecting to
    let arrowAngle = angle;
    switch(this.toPort) {
      case 'right':
        arrowAngle = 0;
        break;
      case 'left':
        arrowAngle = Math.PI;
        break;
      case 'top':
        arrowAngle = -Math.PI / 2;
        break;
      case 'bottom':
        arrowAngle = Math.PI / 2;
        break;
    }
    
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - arrowLength * Math.cos(arrowAngle - Math.PI / 6),
      end.y - arrowLength * Math.sin(arrowAngle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - arrowLength * Math.cos(arrowAngle + Math.PI / 6),
      end.y - arrowLength * Math.sin(arrowAngle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }
}

export default Connection;
