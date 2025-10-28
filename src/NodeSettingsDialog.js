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

export default NodeSettingsDialog;