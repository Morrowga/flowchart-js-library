# Flowchart Library - User Guide

Welcome to the Flowchart Library! This guide will help you create professional flowcharts quickly and easily.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Adding Nodes](#adding-nodes)
- [Moving and Arranging Nodes](#moving-and-arranging-nodes)
- [Editing Node Text](#editing-node-text)
- [Resizing Nodes](#resizing-nodes)
- [Creating Connections](#creating-connections)
- [Reconnecting Lines](#reconnecting-lines)
- [Selecting and Deleting](#selecting-and-deleting)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Copy and Paste](#copy-and-paste)
- [Export and Import](#export-and-import)
- [Tips and Tricks](#tips-and-tricks)

---

## 🚀 Getting Started

When you open the Flowchart Library, you'll see:
- **Toolbar** at the top with shape buttons and export options
- **Canvas** in the center with a grid background where you create your flowchart
- **Instructions** at the bottom with quick tips

---

## ➕ Adding Nodes

Click any of the shape buttons in the toolbar to add a node to the canvas:

### Available Node Types

| Button | Node Type | Description |
|--------|-----------|-------------|
| **Start** | Oval | Use for the beginning of your flowchart |
| **Process** | Rectangle | Use for process steps or actions |
| **Decision** | Diamond | Use for yes/no questions or conditional branches |
| **End** | Oval | Use for the end of your flowchart |

**How to add:**
1. Click one of the shape buttons (Start, Process, Decision, or End)
2. The node will appear on the canvas
3. New nodes automatically position themselves from left to right

---

## 🎯 Moving and Arranging Nodes

### Dragging Nodes
1. **Click** on any node to select it (it will show a blue outline)
2. **Drag** the node to move it anywhere on the canvas
3. **Release** the mouse button to place it

**Tips:**
- Selected nodes show a blue outline with resize handles at the corners
- You can move nodes precisely by clicking and dragging from the center
- The grid helps you align nodes neatly

---

## ✏️ Editing Node Text

Every node can have custom text to describe its purpose.

### How to Edit:
1. **Double-click** on any node
2. A text input field will appear
3. **Type** your text
4. Press **Enter** to save or **Escape** to cancel

**Important:**
- If you leave the text empty and press Enter, the original text will be restored
- Text is automatically centered in the node
- Keep text concise for better readability

---

## 🔄 Resizing Nodes

You can make nodes bigger or smaller to fit your text or design.

### How to Resize:
1. **Click** on a node to select it
2. Look for the **small blue squares** at each corner (resize handles)
3. **Drag** any corner handle to resize the node
4. The node will resize from the center

**Resize Handles:**
- **Top-left corner** - resize from top-left
- **Top-right corner** - resize from top-right
- **Bottom-left corner** - resize from bottom-left
- **Bottom-right corner** - resize from bottom-right

**Constraints:**
- Nodes have a minimum size (60px width, 40px height)
- Resizing maintains the node's center position

---

## 🔗 Creating Connections

Connections (arrows) link nodes together to show the flow of your process.

### Connection Points
Each node has **4 green connection points** (ports):
- **Top** - connects to nodes above
- **Right** - connects to nodes on the right
- **Bottom** - connects to nodes below
- **Left** - connects to nodes on the left

### How to Create a Connection:
1. **Hover** over a node to see its green connection points
2. **Click and drag** from any green point
3. A line will follow your cursor
4. **Release** on another node to create the connection
5. The connection will automatically attach to the nearest port on the target node

**Notes:**
- You cannot connect a node to itself
- Duplicate connections between the same ports are prevented
- Connections appear as black lines

---

## 🔄 Reconnecting Lines

You can change where a connection starts or ends without deleting it.

### How to Reconnect:
1. **Click and drag** from either end of an existing connection line
2. The line will follow your cursor
3. **Release** on a different node to reconnect
4. The connection will attach to the closest port

**Tips:**
- This is useful for reorganizing complex flowcharts
- You can reconnect either the start or end of any connection
- Click near the endpoints (within 15 pixels) to grab them

---

## 🗑️ Selecting and Deleting

### Selecting Items

**Select a Node:**
- Click on any node
- Selected nodes show a blue outline with corner handles

**Select a Connection:**
- Click on any connection line
- Selected connections highlight

**Deselect:**
- Click on empty canvas space

### Deleting Items

**Delete Selected Node or Connection:**
- Press **Delete** key or **Backspace** key
- When you delete a node, all its connections are also deleted

---

## ⌨️ Keyboard Shortcuts

Master these shortcuts to work faster:

| Shortcut | Action | Description |
|----------|--------|-------------|
| **Double-click** | Edit Text | Edit the text of a node |
| **Delete / Backspace** | Delete | Remove selected node or connection |
| **Ctrl+Z** (Win/Linux)<br>**Cmd+Z** (Mac) | Undo | Undo the last action |
| **Ctrl+Shift+Z** (Win/Linux)<br>**Cmd+Shift+Z** (Mac)<br>**Ctrl+Y** (Win/Linux) | Redo | Redo an undone action |
| **Ctrl+C** (Win/Linux)<br>**Cmd+C** (Mac) | Copy | Copy selected node |
| **Ctrl+V** (Win/Linux)<br>**Cmd+V** (Mac) | Paste | Paste copied node |

---

## 📋 Copy and Paste

You can duplicate nodes to speed up flowchart creation.

### How to Copy and Paste:
1. **Select** a node by clicking on it
2. Press **Ctrl+C** (Windows/Linux) or **Cmd+C** (Mac)
3. Press **Ctrl+V** (Windows/Linux) or **Cmd+V** (Mac)
4. A new node will appear slightly offset from the original
5. The new node will have the same:
   - Shape type
   - Text
   - Size

**Note:** Connections are not copied, only the node itself.

---

## 💾 Export and Import

Save your work and share it with others using export and import features.

### Export Formats

#### 1. **JSON** - Save Your Work
- Saves the complete flowchart structure
- Can be imported later to continue editing
- Best for backup and version control

**How to export JSON:**
1. Click the **JSON** button in the toolbar
2. A file named `flowchart.json` will be downloaded

#### 2. **PNG** - Image Export
- Creates a high-quality image of your flowchart
- Perfect for presentations and documents
- Supports high-DPI displays (Retina, 4K)

**How to export PNG:**
1. Click the **PNG** button in the toolbar
2. A file named `flowchart.png` will be downloaded

#### 3. **PDF** - Document Export
- Creates a PDF document of your flowchart
- Maintains high quality and resolution
- Ideal for printing and professional documents

**How to export PDF:**
1. Click the **PDF** button in the toolbar
2. A file named `flowchart.pdf` will be downloaded

### Import

Load previously saved flowcharts to continue editing.

**How to import:**
1. Click the **Import** button in the toolbar
2. Select a `.json` file you previously exported
3. Your flowchart will be loaded onto the canvas

**Note:** Importing will replace the current canvas content.

---

## 🔄 Undo and Redo

The library keeps track of all your changes so you can undo mistakes.

### Undo
- **Keyboard:** Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
- Reverts the last action
- You can undo up to 50 actions

### Redo
- **Keyboard:** Ctrl+Shift+Z or Ctrl+Y (Windows/Linux), Cmd+Shift+Z (Mac)
- Restores an undone action
- Only available after you've used undo

**What can be undone/redone:**
- Adding nodes
- Deleting nodes
- Moving nodes
- Resizing nodes
- Creating connections
- Deleting connections
- Reconnecting lines
- Editing text
- Pasting nodes

---

## 🎨 Tips and Tricks

### Best Practices

**1. Plan Your Layout**
- Start with the Start node on the left
- Place the End node on the right
- Arrange process steps in between

**2. Use Consistent Spacing**
- The grid helps you align nodes
- Keep similar spacing between nodes
- Resize nodes to accommodate text

**3. Label Clearly**
- Use concise, action-oriented text
- For decisions, phrase as questions (e.g., "Is valid?")
- Avoid overly long text in nodes

**4. Color and Flow**
- Start and End nodes use the same oval shape but different colors (green and red)
- Follow a logical top-to-bottom or left-to-right flow
- Use the Decision node for branching logic

**5. Save Regularly**
- Export to JSON periodically to save your work
- Keep backup copies of complex flowcharts
- Export to PNG/PDF for sharing with non-editors

### Common Workflows

**Creating a Simple Process:**
1. Add a Start node
2. Add Process nodes for each step
3. Add an End node
4. Connect them in order
5. Edit text for each step
6. Export as PNG or PDF

**Creating a Decision Tree:**
1. Add a Start node
2. Add a Decision node
3. Add Process nodes for "Yes" and "No" branches
4. Add End nodes or loop back
5. Create connections showing the flow
6. Label connections if needed

**Reorganizing:**
1. Select and drag nodes to new positions
2. Use reconnection to change flow
3. Resize nodes as needed
4. Use Undo if you make a mistake

---

## ❓ Troubleshooting

### Node won't move
- Make sure you're clicking on the node itself, not a connection point
- Check that you're not in text editing mode (press Escape to exit)

### Can't create connection
- Make sure you're dragging from a green connection point
- Ensure you're releasing on a different node (can't connect to self)
- Check that the connection doesn't already exist

### Text input disappeared
- Press Escape to cancel editing
- Double-click the node again to restart editing

### Export button not working
- For PDF export, ensure the jsPDF library is loaded
- Check your browser's download settings
- Try a different browser if issues persist

---

## 📞 Support

If you encounter any issues or have questions:
- Check this guide for solutions
- Review the Tips and Tricks section
- Refer to keyboard shortcuts for faster workflows

---

## 🎉 Quick Start Tutorial

**Create your first flowchart in 2 minutes:**

1. **Add Start node** - Click "Start" button
2. **Add Process node** - Click "Process" button
3. **Add End node** - Click "End" button
4. **Connect them** - Drag from green point on Start to Process, then Process to End
5. **Edit text** - Double-click each node and type:
   - Start: "Begin"
   - Process: "Do something"
   - End: "Finish"
6. **Export** - Click "PNG" to save an image

Congratulations! You've created your first flowchart! 🎊

---

**Happy Flowcharting! 📊✨**