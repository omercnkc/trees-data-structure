/**
 * TreeLab - AVL Tree Implementation
 * 
 * Purpose: Self-balancing Binary Search Tree using rotations
 * 
 * Properties:
 * - Height balanced: |height(left) - height(right)| ≤ 1
 * - Automatic rebalancing after insertion/deletion
 * - Guaranteed O(log n) operations
 */

class AVLTree extends TreeBase {
    constructor() {
        super('AVL Tree');
    }

    /**
     * Get height of a node (handles null)
     * @private
     */
    _getNodeHeight(node) {
        return node === null ? 0 : node.height;
    }

    /**
     * Update height of a node
     * @private
     */
    _updateHeight(node) {
        if (node !== null) {
            node.height = 1 + Math.max(
                this._getNodeHeight(node.left),
                this._getNodeHeight(node.right)
            );
        }
    }

    /**
     * Get balance factor of a node
     * @private
     */
    _getBalance(node) {
        if (node === null) return 0;
        return this._getNodeHeight(node.left) - this._getNodeHeight(node.right);
    }

    /**
     * Right rotation
     * @private
     */
    _rotateRight(y) {
        this._addAnimationStep('rotation', { type: 'right', pivot: y, description: 'Sağa rotasyon' });
        
        const x = y.left;
        const T2 = x.right;

        // Perform rotation
        x.right = y;
        y.left = T2;

        // Update parents
        if (T2) T2.parent = y;
        x.parent = y.parent;
        y.parent = x;

        // Update heights
        this._updateHeight(y);
        this._updateHeight(x);

        return x;
    }

    /**
     * Left rotation
     * @private
     */
    _rotateLeft(x) {
        this._addAnimationStep('rotation', { type: 'left', pivot: x, description: 'Sola rotasyon' });
        
        const y = x.right;
        const T2 = y.left;

        // Perform rotation
        y.left = x;
        x.right = T2;

        // Update parents
        if (T2) T2.parent = x;
        y.parent = x.parent;
        x.parent = y;

        // Update heights
        this._updateHeight(x);
        this._updateHeight(y);

        return y;
    }

    /**
     * Insert a value into the AVL tree
     * @param {number} value
     */
    insert(value) {
        this.clearAnimationSteps();
        this.root = this._insertNode(this.root, value);
        eventBus.emit(EVENTS.NODE_INSERTED, { value, tree: this });
    }

    /**
     * Helper: Insert and balance
     * @private
     */
    _insertNode(node, value) {
        // Standard BST insertion
        if (node === null) {
            this.nodeCount++;
            const newNode = new TreeNode(value);
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
            // Duplicate value, don't insert
            return node;
        }

        // Update height
        this._updateHeight(node);

        // Get balance factor
        const balance = this._getBalance(node);
        this._addAnimationStep('checkBalance', { node, balance });

        // Left Left Case
        if (balance > 1 && value < node.left.value) {
            return this._rotateRight(node);
        }

        // Right Right Case
        if (balance < -1 && value > node.right.value) {
            return this._rotateLeft(node);
        }

        // Left Right Case
        if (balance > 1 && value > node.left.value) {
            node.left = this._rotateLeft(node.left);
            return this._rotateRight(node);
        }

        // Right Left Case
        if (balance < -1 && value < node.right.value) {
            node.right = this._rotateRight(node.right);
            return this._rotateLeft(node);
        }

        return node;
    }

    /**
     * Delete a value from the AVL tree
     * @param {number} value
     * @returns {boolean}
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
     * Helper: Delete and rebalance
     * @private
     */
    _deleteNode(node, value) {
        if (node === null) {
            return null;
        }

        this._addAnimationStep('compare', { node, value });

        // Standard BST delete
        if (value < node.value) {
            node.left = this._deleteNode(node.left, value);
        } else if (value > node.value) {
            node.right = this._deleteNode(node.right, value);
        } else {
            // Node to delete found
            this._addAnimationStep('delete', { node });

            // Node with one or no child
            if (!node.left || !node.right) {
                this.nodeCount--;
                const temp = node.left || node.right;
                
                if (!temp) {
                    return null;
                } else {
                    return temp;
                }
            }

            // Node with two children
            const successor = this._findMin(node.right);
            this._addAnimationStep('highlight', { node: successor, reason: 'successor' });
            
            node.value = successor.value;
            this._addAnimationStep('replace', { node, successor });
            
            node.right = this._deleteNode(node.right, successor.value);
        }

        if (node === null) return null;

        // Update height
        this._updateHeight(node);

        // Get balance factor
        const balance = this._getBalance(node);
        this._addAnimationStep('checkBalance', { node, balance });

        // Left Left Case
        if (balance > 1 && this._getBalance(node.left) >= 0) {
            return this._rotateRight(node);
        }

        // Left Right Case
        if (balance > 1 && this._getBalance(node.left) < 0) {
            node.left = this._rotateLeft(node.left);
            return this._rotateRight(node);
        }

        // Right Right Case
        if (balance < -1 && this._getBalance(node.right) <= 0) {
            return this._rotateLeft(node);
        }

        // Right Left Case
        if (balance < -1 && this._getBalance(node.right) > 0) {
            node.right = this._rotateRight(node.right);
            return this._rotateLeft(node);
        }

        return node;
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
     * Find minimum value node
     * @private
     */
    _findMin(node) {
        while (node.left !== null) {
            node = node.left;
        }
        return node;
    }

    /**
     * Check if tree is balanced
     * @returns {boolean}
     */
    isBalanced() {
        return this._checkBalance(this.root);
    }

    /**
     * Helper: Check if subtree is balanced
     * @private
     */
    _checkBalance(node) {
        if (node === null) return true;
        
        const balance = Math.abs(this._getBalance(node));
        if (balance > 1) return false;
        
        return this._checkBalance(node.left) && this._checkBalance(node.right);
    }
}

// Export
if (typeof window !== 'undefined') {
    window.AVLTree = AVLTree;
}
