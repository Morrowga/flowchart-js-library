const fs = require('fs');
const path = require('path');

console.log('📦 Building flowchart-lib...');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Read source files IN ORDER
const nodeCode = fs.readFileSync(path.join(srcDir, 'Node.js'), 'utf8');
const connectionCode = fs.readFileSync(path.join(srcDir, 'Connection.js'), 'utf8');
const areaCode = fs.readFileSync(path.join(srcDir, 'Area.js'), 'utf8');
const nodeSettingsDialogCode = fs.readFileSync(path.join(srcDir, 'NodeSettingsDialog.js'), 'utf8');
const areaSettingsDialogCode = fs.readFileSync(path.join(srcDir, 'AreaSettingsDialog.js'), 'utf8');
const indexCode = fs.readFileSync(path.join(srcDir, 'index.js'), 'utf8');

// Clean all export statements from the code
function cleanExports(code) {
  return code
    .replace(/window\.FlowchartLib\s*=\s*{[\s\S]*?};/g, '')
    .replace(/export\s+{\s*[\s\S]*?\s*};?/g, '')
    .replace(/export\s+default\s+[\s\S]*?;/g, '')
    .replace(/export\s+\{[\s\S]*?\}\s*;?/g, '')
    .replace(/export\s+(default\s+)?(class|function|const|let|var)/g, '$2')
    .replace(/^export\s+.*$/gm, '')
    .replace(/^import\s+.*$/gm, '')
    .trim();
}

const cleanedNodeCode = cleanExports(nodeCode);
const cleanedConnectionCode = cleanExports(connectionCode);
const cleanedAreaCode = cleanExports(areaCode);
const cleanedNodeSettingsDialogCode = cleanExports(nodeSettingsDialogCode);
const cleanedAreaSettingsDialogCode = cleanExports(areaSettingsDialogCode);
const cleanedIndexCode = cleanExports(indexCode);

// ============================================================================
// Build 1: UMD (Universal Module Definition) - for browsers
// ============================================================================
const umdOutput = `/*!
 * FlowchartLib v1.0.0
 * (c) ${new Date().getFullYear()}
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
  ${cleanedNodeCode}
  
  // Connection class
  ${cleanedConnectionCode}
  
  // Area class
  ${cleanedAreaCode}
  
  // NodeSettingsDialog class
  ${cleanedNodeSettingsDialogCode}
  
  // AreaSettingsDialog class
  ${cleanedAreaSettingsDialogCode}
  
  // Main Canvas class
  ${cleanedIndexCode}
  
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
`;

// ============================================================================
// Build 2: CommonJS - for Node.js and older bundlers
// ============================================================================
const cjsOutput = `/*!
 * FlowchartLib v1.0.0 - CommonJS
 */
'use strict';

const JSZip = require('jszip');

// Node class
${cleanedNodeCode}

// Connection class
${cleanedConnectionCode}

// Area class
${cleanedAreaCode}

// NodeSettingsDialog class
${cleanedNodeSettingsDialogCode}

// AreaSettingsDialog class
${cleanedAreaSettingsDialogCode}

// Main Canvas class
${cleanedIndexCode}

// Export
module.exports = {
  Canvas: FlowchartCanvas,
  Node: Node,
  Connection: Connection,
  Area: Area,
  NodeSettingsDialog: NodeSettingsDialog,
  AreaSettingsDialog: AreaSettingsDialog
};

module.exports.default = module.exports;
`;

// ============================================================================
// Build 3: ES Module - for modern bundlers (Vue, React, etc.)
// ============================================================================
const esmOutput = `/*!
 * FlowchartLib v1.0.0 - ES Module
 */

import JSZip from 'jszip';

// Node class
${cleanedNodeCode}

// Connection class
${cleanedConnectionCode}

// Area class
${cleanedAreaCode}

// NodeSettingsDialog class
${cleanedNodeSettingsDialogCode}

// AreaSettingsDialog class
${cleanedAreaSettingsDialogCode}

// Main Canvas class
${cleanedIndexCode}

// Named exports
export { FlowchartCanvas as Canvas, Node, Connection, Area, NodeSettingsDialog, AreaSettingsDialog };

// Default export
export default {
  Canvas: FlowchartCanvas,
  Node,
  Connection,
  Area,
  NodeSettingsDialog,
  AreaSettingsDialog
};
`;

// Write all builds
fs.writeFileSync(path.join(distDir, 'flowchart-lib.umd.js'), umdOutput);
fs.writeFileSync(path.join(distDir, 'flowchart-lib.js'), cjsOutput);
fs.writeFileSync(path.join(distDir, 'flowchart-lib.esm.js'), esmOutput);

console.log('✅ Built: dist/flowchart-lib.umd.js (for browsers)');
console.log('✅ Built: dist/flowchart-lib.js (CommonJS)');
console.log('✅ Built: dist/flowchart-lib.esm.js (ES Module)');

// ============================================================================
// Minification with Terser
// ============================================================================
async function minifyBuild() {
  try {
    const { minify } = require('terser');
    
    const minified = await minify(umdOutput, {
      compress: {
        drop_console: false,
        passes: 2
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: true
      },
      format: {
        comments: /^!/,
        preamble: `/*! FlowchartLib v1.0.0 | MIT License */`
      }
    });
    
    if (minified.code) {
      fs.writeFileSync(path.join(distDir, 'flowchart-lib.umd.min.js'), minified.code);
      console.log('✅ Built: dist/flowchart-lib.umd.min.js (minified)');
      
      const originalSize = (Buffer.byteLength(umdOutput, 'utf8') / 1024).toFixed(2);
      const minifiedSize = (Buffer.byteLength(minified.code, 'utf8') / 1024).toFixed(2);
      const savings = (((originalSize - minifiedSize) / originalSize) * 100).toFixed(1);
      
      console.log(`\n📊 Size: ${originalSize}KB → ${minifiedSize}KB (${savings}% smaller)`);
    }
  } catch (err) {
    console.log('\n⚠️  Minification failed:', err.message);
    console.log('💡 Make sure terser is installed: npm install --save-dev terser');
  }
}

minifyBuild().then(() => {
  console.log('\n🎉 Build complete!\n');
}).catch(() => {
  console.log('\n🎉 Build complete (without minification)!\n');
});