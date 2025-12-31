/**
 * TreeLab - Binary Search Tree Implementation
 * 
 * Purpose: Implements a Binary Search Tree with insertion, deletion, and search
 * 
 * SOLID Principles:
 * - Single Responsibility: Manages BST-specific logic
 * - Open/Closed: Extends TreeBase without modifying it
 * - Liskov Substitution: Can be used anywhere TreeBase is expected
 */

class BSTTree extends TreeBase {
    constructor() {
        super('Binary Search Tree');
    }

    /**
     * Insert a value into the BST
     * @param {number} value - Value to insert
     */
    insert(value) {
        this.clearAnimationSteps();
        
        if (this.root === null) {
            this.root = new TreeNode(value);
            this.nodeCount++;
            this._addAnimationStep('insert', { node: this.root, isNew: true });
            eventBus.emit(EVENTS.NODE_INSERTED, { value, tree: this });
            return;
        }

        this._insertNode(this.root, value);
        eventBus.emit(EVENTS.NODE_INSERTED, { value, tree: this });
    }

    /**
     * Helper: Insert node recursively
     * @private
     */
    _insertNode(node, value) {
        this._addAnimationStep('compare', { node, value });

        if (value < node.value) {
            if (node.left === null) {
                node.left = new TreeNode(value);
                node.left.parent = node;
                this.nodeCount++;
                this._addAnimationStep('insert', { node: node.left, isNew: true });
            } else {
                this._insertNode(node.left, value);
            }
        } else if (value > node.value) {
            if (node.right === null) {
                node.right = new TreeNode(value);
                node.right.parent = node;
                this.nodeCount++;
                this._addAnimationStep('insert', { node: node.right, isNew: true });
            } else {
                this._insertNode(node.right, value);
            }
        }
        // If value === node.value, ignore (no duplicates)
    }

    /**
     * Search for a value in the BST
     * @param {number} value - Value to search for
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
        if (node === null) {
            return null;
        }

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
     * Delete a value from the BST
     * @param {number} value - Value to delete
     * @returns {boolean} True if deleted
     */
    delete(value) {
        this.clearAnimationSteps();
        const initialCount = this.nodeCount;
        this.root = this._deleteNode(this.root, value);
        const deleted = this.nodeCount < initialCount;
        
        if (deleted) {
            eventBus.emit(EVENTS.NODE_DELETED, { value, tree: this });
        }
        
        return deleted;
    }

    /**
     * Helper: Delete node recursively
     * @private
     */
    _deleteNode(node, value) {
        if (node === null) {
            return null;
        }

        this._addAnimationStep('compare', { node, value });

        if (value < node.value) {
            node.left = this._deleteNode(node.left, value);
            return node;
        } else if (value > node.value) {
            node.right = this._deleteNode(node.right, value);
            return node;
        } else {
            // Found node to delete
            this._addAnimationStep('delete', { node });

            // Case 1: Leaf node
            if (node.isLeaf()) {
                this.nodeCount--;
                return null;
            }

            // Case 2: One child
            if (node.hasOneChild()) {
                this.nodeCount--;
                return node.left || node.right;
            }

            // Case 3: Two children - find inorder successor
            const successor = this._findMin(node.right);
            this._addAnimationStep('highlight', { node: successor, reason: 'successor' });
            
            node.value = successor.value;
            this._addAnimationStep('replace', { node, successor });
            
            node.right = this._deleteNode(node.right, successor.value);
            return node;
        }
    }

    /**
     * Find minimum value node in subtree
     * @private
     */
    _findMin(node) {
        while (node.left !== null) {
            node = node.left;
        }
        return node;
    }

    /**
     * Find maximum value node in subtree
     * @private
     */
    _findMax(node) {
        while (node.right !== null) {
            node = node.right;
        }
        return node;
    }

    /**
     * Check if tree is valid BST
     * @returns {boolean}
     */
    isValidBST() {
        return this._isValidBSTHelper(this.root, -Infinity, Infinity);
    }

    /**
     * Helper: Validate BST property
     * @private
     */
    _isValidBSTHelper(node, min, max) {
        if (node === null) return true;
        
        if (node.value <= min || node.value >= max) {
            return false;
        }
        
        return this._isValidBSTHelper(node.left, min, node.value) &&
               this._isValidBSTHelper(node.right, node.value, max);
    }

    /**
     * Balance the BST
     */
    balance() {
        this.clearAnimationSteps();
        
        // 1. Get all nodes in sorted order
        const nodes = [];
        this.inorderTraversal(node => nodes.push(node));
        
        if (nodes.length <= 2) return; // Already balanced enough or empty

        // 2. Clear current tree structure logic relative to children/parents
        // (We will rebuild connections)
        
        // 3. Rebuild balanced tree
        this.root = this._buildBalancedTree(nodes, 0, nodes.length - 1);
        
        // 4. Update parent pointers? 
        // _buildBalancedTree handles left/right, need to handle parents if TreeBase/Visualization uses them.
        // The TreeNode class has 'parent' property.
        
        // Trigger visualization reset or re-draw
        // We might want to animate the balancing? 
        // For now, instantaneous balance + redraw is fine.
        // We can add a "Rebalanced" message or animation step.
        this._addAnimationStep('root_change', { node: this.root }); // Mock animation step
        eventBus.emit(EVENTS.TREE_RESET, { tree: this }); // Force redraw
    }

    _buildBalancedTree(nodes, start, end) {
        if (start > end) return null;

        const mid = Math.floor((start + end) / 2);
        const node = nodes[mid];

        // Reset pointers
        node.left = this._buildBalancedTree(nodes, start, mid - 1);
        if (node.left) node.left.parent = node;

        node.right = this._buildBalancedTree(nodes, mid + 1, end);
        if (node.right) node.right.parent = node;
        
        // Reset height/visuals if necessary
        node.resetVisualState();

        return node;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BSTTree = BSTTree;
}
