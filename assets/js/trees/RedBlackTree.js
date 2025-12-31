/**
 * TreeLab - Red-Black Tree Implementation
 * 
 * Purpose: Self-balancing BST using color properties
 * 
 * Properties:
 * - Every node is RED or BLACK
 * - Root is always BLACK
 * - RED nodes cannot have RED children
 * - Every path from root to null has same number of BLACK nodes
 * - Guarantees O(log n) operations
 */

class RedBlackTree extends TreeBase {
    constructor() {
        super('Red-Black Tree');
    }

    /**
     * Insert a value into the Red-Black tree
     * @param {number} value
     */
    insert(value) {
        this.clearAnimationSteps();
        this.root = this._insertNode(this.root, value);
        if (this.root) {
            this.root.color = 'BLACK';
        }
        eventBus.emit(EVENTS.NODE_INSERTED, { value, tree: this });
    }

    /**
     * Helper: Insert and fix Red-Black properties
     * @private
     */
    _insertNode(node, value) {
        // Standard BST insertion
        if (node === null) {
            this.nodeCount++;
            const newNode = new TreeNode(value);
            newNode.color = 'RED'; // New nodes are always RED
            this._addAnimationStep('insert', { node: newNode, isNew: true });
            return newNode;
        }

        this._addAnimationStep('compare', { node, value });

        if (value < node.value) {
            node.left = this._insertNode(node.left, value);
            node.left.parent = node;
        } else if (value > node.value) {
            node.right = this._insertNode(node.right, value);
            node.right.parent = node;
        } else {
            return node; // Duplicate
        }

        // Fix Red-Black properties
        return this._fixInsertion(node);
    }

    /**
     * Fix Red-Black tree properties after insertion
     * @private
     */
    _fixInsertion(node) {
        // Case 1: Both children are RED
        if (this._isRed(node.left) && this._isRed(node.right)) {
            this._flipColors(node);
        }

        // Case 2: Right child is RED, left is not (rotate left)
        if (this._isRed(node.right) && !this._isRed(node.left)) {
            node = this._rotateLeft(node);
        }

        // Case 3: Left child and left-left grandchild are RED (rotate right)
        if (this._isRed(node.left) && this._isRed(node.left?.left)) {
            node = this._rotateRight(node);
        }

        return node;
    }

    /**
     * Check if node is RED
     * @private
     */
    _isRed(node) {
        if (node === null) return false;
        return node.color === 'RED';
    }

    /**
     * Flip colors
     * @private
     */
    _flipColors(node) {
        this._addAnimationStep('colorFlip', { node, description: 'Renk değişimi' });
        node.color = 'RED';
        if (node.left) node.left.color = 'BLACK';
        if (node.right) node.right.color = 'BLACK';
    }

    /**
     * Left rotation
     * @private
     */
    _rotateLeft(node) {
        this._addAnimationStep('rotation', { type: 'left', pivot: node, description: 'Sola rotasyon' });
        
        const x = node.right;
        node.right = x.left;
        if (x.left) x.left.parent = node;
        
        x.left = node;
        x.color = node.color;
        node.color = 'RED';
        
        x.parent = node.parent;
        node.parent = x;
        
        return x;
    }

    /**
     * Right rotation
     * @private
     */
    _rotateRight(node) {
        this._addAnimationStep('rotation', { type: 'right', pivot: node, description: 'Sağa rotasyon' });
        
        const x = node.left;
        node.left = x.right;
        if (x.right) x.right.parent = node;
        
        x.right = node;
        x.color = node.color;
        node.color = 'RED';
        
        x.parent = node.parent;
        node.parent = x;
        
        return x;
    }

    /**
     * Search for a value
     * @param {number} value
     * @returns {TreeNode|null}
     */
    search(value) {
        this.clearAnimationSteps();
        const result = this._searchNode(this.root, value);
        eventBus.emit(EVENTS.NODE_SEARCHED, { value, found: result !== null, tree: this });
        return result;
    }

    /**
     * Helper: Search recursively
     * @private
     */
    _searchNode(node, value) {
        if (node === null) return null;

        this._addAnimationStep('visit', { node });

        if (value === node.value) {
            this._addAnimationStep('found', { node });
            return node;
        }

        if (value < node.value) {
            return this._searchNode(node.left, value);
        } else {
            return this._searchNode(node.right, value);
        }
    }

    /**
     * Delete operation (simplified version)
     * @param {number} value
     * @returns {boolean}
     */
    delete(value) {
        // Red-Black delete is complex, using simplified BST delete
        this.clearAnimationSteps();
        const initialCount = this.nodeCount;
        this.root = this._simpleBSTDelete(this.root, value);
        const deleted = this.nodeCount < initialCount;
        
        if (deleted && this.root) {
            this.root.color = 'BLACK';
            eventBus.emit(EVENTS.NODE_DELETED, { value, tree: this });
        }
        
        return deleted;
    }

    /**
     * Simplified BST delete
     * @private
     */
    _simpleBSTDelete(node, value) {
        if (node === null) return null;

        if (value < node.value) {
            node.left = this._simpleBSTDelete(node.left, value);
        } else if (value > node.value) {
            node.right = this._simpleBSTDelete(node.right, value);
        } else {
            if (!node.left) {
                this.nodeCount--;
                return node.right;
            }
            if (!node.right) {
                this.nodeCount--;
                return node.left;
            }

            const successor = this._findMin(node.right);
            node.value = successor.value;
            node.right = this._simpleBSTDelete(node.right, successor.value);
        }

        return node;
    }

    /**
     * Find minimum node
     * @private
     */
    _findMin(node) {
        while (node.left !== null) {
            node = node.left;
        }
        return node;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.RedBlackTree = RedBlackTree;
}
