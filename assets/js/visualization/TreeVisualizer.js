/**
 * TreeLab - TreeVisualizer (Canvas-based Rendering)
 * 
 * Purpose: Renders tree structures on HTML5 Canvas with smooth animations
 * 
 * SOLID Principles:
 * - Single Responsibility: Handles only visual rendering
 * - Open/Closed: Can be extended for different rendering styles
 * - Dependency Inversion: Depends on TreeBase abstraction
 */

class TreeVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.tree = null;
        
        // Styling configuration
        this.config = {
            nodeRadius: 30,
            nodeStrokeWidth: 3,
            edgeStrokeWidth: 2,
            verticalSpacing: 80,
            horizontalSpacing: 60,
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            colors: {
                nodeDefault: '#2196f3',
                nodeHighlight: '#4caf50',
                nodeVisited: '#90caf9',
                nodeCurrent: '#ff9800',
                nodeRed: '#e53935',
                nodeBlack: '#212121',
                text: '#ffffff',
                textDark: '#212121',
                edge: '#757575'
            }
        };
        
        // Handle canvas sizing
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Set tree to visualize
     * @param {TreeBase} tree
     */
    setTree(tree) {
        this.tree = tree;
        this.draw();
    }

    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set canvas size with device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = Math.max(500, rect.height) * dpr;
        
        // Scale context
        this.ctx.scale(dpr, dpr);
        
        // Set display size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = Math.max(500, rect.height) + 'px';
        
        // Redraw
        if (this.tree) {
            this.draw();
        }
    }

    /**
     * Calculate positions for all nodes
     * @private
     */
    _calculatePositions(node, x, y, xSpacing) {
        if (!node) return;
        
        // Set node position
        node.x = x;
        node.y = y;
        
        // Calculate child positions
        const nextY = y + this.config.verticalSpacing;
        const nextSpacing = xSpacing / 2;
        
        // Handle Trie nodes (have children Map)
        if (node.children && node.children instanceof Map) {
            const childrenArray = Array.from(node.children.values());
            const childCount = childrenArray.length;
            
            if (childCount > 0) {
                const totalWidth = xSpacing * (childCount - 1);
                const startX = x - totalWidth / 2;
                
                childrenArray.forEach((child, index) => {
                    const childX = startX + (index * xSpacing);
                    this._calculatePositions(child, childX, nextY, nextSpacing);
                });
            }
        } else if (Array.isArray(node.children) && node.children.length > 0) {
            // Handle B-Tree / General Tree nodes (Array children)
            const childCount = node.children.length;
            const totalWidth = xSpacing * (childCount - 1);
            const startX = x - totalWidth / 2;
            
            node.children.forEach((child, index) => {
                if (child) {
                    const childX = startX + (index * xSpacing);
                    this._calculatePositions(child, childX, nextY, nextSpacing);
                }
            });
        } else {
            // Handle binary tree nodes (have left/right)
            if (node.left) {
                this._calculatePositions(node.left, x - xSpacing, nextY, nextSpacing);
            }
            
            if (node.right) {
                this._calculatePositions(node.right, x + xSpacing, nextY, nextSpacing);
            }
        }
    }

    /**
     * Draw the tree
     */
    draw() {
        if (!this.tree || !this.tree.root) {
            this._clearCanvas();
            this._drawEmptyState();
            return;
        }
        
        // Clear canvas
        this._clearCanvas();
        
        // Calculate positions
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const startX = canvasWidth / 2;
        const startY = 50;
        
        // Calculate spacing based on tree height
        const height = this.tree.getHeight();
        const baseSpacing = Math.max(40, Math.min(120, canvasWidth / (Math.pow(2, height))));
        
        this._calculatePositions(this.tree.root, startX, startY, baseSpacing);
        
        // Draw edges first (so nodes appear on top)
        this._drawEdges(this.tree.root);
        
        // Draw nodes
        this._drawNodes(this.tree.root);
    }

    /**
     * Clear canvas
     * @private
     */
    _clearCanvas() {
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, width, height);
        
        // Fill background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, width, height);
    }

    /**
     * Draw empty state message
     * @private
     */
    _drawEmptyState() {
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        this.ctx.font = '18px ' + this.config.fontFamily;
        this.ctx.fillStyle = '#9e9e9e';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Ağaç boş - Değer eklemek için yukarıdaki kontrolü kullanın', width / 2, height / 2);
    }

    /**
     * Draw all edges recursively
     * @private
     */
    _drawEdges(node) {
        if (!node) return;
        
        this.ctx.strokeStyle = this.config.colors.edge;
        this.ctx.lineWidth = this.config.edgeStrokeWidth;
        
        // Handle Trie nodes
        if (node.children && node.children instanceof Map) {
            for (const child of node.children.values()) {
                if (child) {
                    this._drawEdge(node.x, node.y, child.x, child.y);
                    this._drawEdges(child);
                }
            }
        } else if (Array.isArray(node.children) && node.children.length > 0) {
            // Handle B-Tree / General Tree nodes
            node.children.forEach(child => {
                if (child) {
                    this._drawEdge(node.x, node.y, child.x, child.y);
                    this._drawEdges(child);
                }
            });
        } else {
            // Handle binary tree nodes
            if (node.left) {
                this._drawEdge(node.x, node.y, node.left.x, node.left.y);
                this._drawEdges(node.left);
            }
            
            if (node.right) {
                this._drawEdge(node.x, node.y, node.right.x, node.right.y);
                this._drawEdges(node.right);
            }
        }
    }

    /**
     * Draw a single edge
     * @private
     */
    _drawEdge(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    /**
     * Draw all nodes recursively
     * @private
     */
    _drawNodes(node) {
        if (!node) return;
        
        // Handle Trie nodes
        if (node.children && node.children instanceof Map) {
            for (const child of node.children.values()) {
                if (child) {
                    this._drawNodes(child);
                }
            }
        } else if (Array.isArray(node.children) && node.children.length > 0) {
            // Handle B-Tree / General Tree nodes
            node.children.forEach(child => {
                if (child) this._drawNodes(child);
            });
        } else {
            // Handle binary tree nodes - draw children first (for proper layering)
            if (node.left) this._drawNodes(node.left);
            if (node.right) this._drawNodes(node.right);
        }
        
        // Draw this node
        this._drawNode(node);
    }

    /**
     * Draw a single node
     * @private
     */
    _drawNode(node) {
        const { x, y } = node;
        const radius = this.config.nodeRadius;
        
        // Determine node color based on state
        // Check for Multi-Key Node (B-Tree)
        if (node.keys && Array.isArray(node.keys)) {
            this._drawMultiKeyNode(node);
            return;
        }

        // Determine node color based on state
        let fillColor = this.config.colors.nodeDefault;
        let strokeColor = this.config.colors.nodeDefault;
        
        if (node.isCurrent) {
            fillColor = this.config.colors.nodeCurrent;
        } else if (node.isHighlighted) {
            fillColor = this.config.colors.nodeHighlight;
        } else if (node.isVisited) {
            fillColor = this.config.colors.nodeVisited;
        } else if (node.color === 'RED') {
            fillColor = this.config.colors.nodeRed;
        } else if (node.color === 'BLACK') {
            fillColor = this.config.colors.nodeBlack;
        }
        
        // Draw circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
        this.ctx.lineWidth = this.config.nodeStrokeWidth;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.stroke();
        
        // Draw value (for Trie, show char; for others, show value)
        this.ctx.font = `bold ${this.config.fontSize}px ${this.config.fontFamily}`;
        this.ctx.fillStyle = this.config.colors.text;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // For Trie nodes, show the character; for others show the value
        const displayText = (node.char !== undefined && node.char !== '') ? node.char : node.value.toString();
        this.ctx.fillText(displayText, x, y);
        
        // Show end-of-word marker for Trie
        if (node.isEndOfWord) {
            this.ctx.font = `12px ${this.config.fontFamily}`;
            this.ctx.fillStyle = this.config.colors.nodeHighlight;
            this.ctx.fillText('*', x + radius - 5, y - radius + 10);
        }
        
        // Draw height for AVL trees (optional)
        if (this.tree && this.tree.name === 'AVL Tree' && node.height !== undefined) {
            this.ctx.font = `10px ${this.config.fontFamily}`;
            this.ctx.fillStyle = this.config.colors.textDark;
            this.ctx.fillText(`h:${node.height}`, x, y + radius + 15);
        }
    }

    /**
     * Draw a multi-key node (for B-Tree)
     * @private
     */
    _drawMultiKeyNode(node) {
        const { x, y } = node;
        const keyCount = node.keys.length;
        const cellWidth = 30;
        const cellHeight = 30;
        const totalWidth = keyCount * cellWidth;
        const startX = x - totalWidth / 2;
        const startY = y - cellHeight / 2;
        
        this.ctx.font = `bold ${this.config.fontSize}px ${this.config.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw container
        for (let i = 0; i < keyCount; i++) {
            const cellX = startX + i * cellWidth;
            
            // Draw cell background
            this.ctx.fillStyle = this.config.colors.nodeDefault;
            if (node.highlighted) this.ctx.fillStyle = this.config.colors.nodeHighlight;
            // Note: BTree logic uses `highlighted`, base uses `isHighlighted`. 
            // We should sync this or check both.
            if (node.isHighlighted) this.ctx.fillStyle = this.config.colors.nodeHighlight;

            this.ctx.fillRect(cellX, startY, cellWidth, cellHeight);
            
            // Draw cell border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(cellX, startY, cellWidth, cellHeight);
            
            // Draw text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(node.keys[i], cellX + cellWidth/2, startY + cellHeight/2);
        }
        
        // Draw main border
        this.ctx.strokeStyle = this.config.colors.nodeDefault;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(startX, startY, totalWidth, cellHeight);
    }

    /**
     * Highlight a specific node
     * @param {TreeNode} node
     * @param {string} state - 'highlight', 'visit', 'current'
     */
    highlightNode(node, state = 'highlight') {
        if (!node) return;
        
        // Reset all nodes
        this.tree.resetVisualState();
        
        // Set state
        switch (state) {
            case 'highlight':
                node.isHighlighted = true;
                break;
            case 'visit':
                node.isVisited = true;
                break;
            case 'current':
                node.isCurrent = true;
                break;
        }
        
        this.draw();
    }

    /**
     * Clear all highlights
     */
    clearHighlights() {
        if (this.tree) {
            this.tree.resetVisualState();
            this.draw();
        }
    }
}

// Export
if (typeof window !== 'undefined') {
    window.TreeVisualizer = TreeVisualizer;
}
