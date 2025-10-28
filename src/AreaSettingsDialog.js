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

export default AreaSettingsDialog;