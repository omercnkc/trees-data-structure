/**
 * TreeLab - TreeBase Abstract Class
 * 
 * Purpose: Defines the interface and common functionality for all tree types
 * 
 * SOLID Principles:
 * - Single Responsibility: Defines tree contract and common operations
 * - Open/Closed: Open for extension (subclassing), closed for modification
 * - Liskov Substitution: All tree types can be used interchangeably
 * - Interface Segregation: Defines minimal required interface
 * - Dependency Inversion: Depends on abstractions (this base class)
 * 
 * Design Pattern: Template Method Pattern
 */

class TreeBase {
    constructor(name = 'Generic Tree') {
        if (new.target === TreeBase) {
            throw new TypeError('Cannot instantiate abstract class TreeBase directly');
        }
        
        this.root = null;
        this.name = name;
        this.nodeCount = 0;
        this.animationSteps = [];
    }

    // ============================================
    // Abstract Methods (Must be implemented by subclasses)
    // ============================================

    /**
     * Insert a value into the tree
     * @param {*} value - Value to insert
     * @abstract
     */
    insert(value) {
        throw new Error('insert() must be implemented by subclass');
    }

    /**
     * Delete a value from the tree
     * @param {*} value - Value to delete
     * @returns {boolean} True if deleted, false if not found
     * @abstract
     */
    delete(value) {
        throw new Error('delete() must be implemented by subclass');
    }

    /**
     * Search for a value in the tree
     * @param {*} value - Value to search for
     * @returns {TreeNode|null} Found node or null
     * @abstract
     */
    search(value) {
        throw new Error('search() must be implemented by subclass');
    }

    // ============================================
    // Common Template Methods
    // ============================================

    /**
     * Clear the entire tree
     */
    clear() {
        this.root = null;
        this.nodeCount = 0;
        this.animationSteps = [];
        eventBus.emit(EVENTS.TREE_RESET, { tree: this });
    }

    /**
     * Check if tree is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.root === null;
    }

    /**
     * Get tree height
     * @returns {number}
     */
    getHeight() {
        return this._getHeight(this.root);
    }

    /**
     * Helper: Calculate height of subtree
     * @param {TreeNode|null} node
     * @returns {number}
     * @private
     */
    _getHeight(node) {
        if (node === null) return 0;
        return 1 + Math.max(this._getHeight(node.left), this._getHeight(node.right));
    }

    /**
     * Get node count
     * @returns {number}
     */
    getSize() {
        return this.nodeCount;
    }

    // ============================================
    // Traversal Methods
    // ============================================

    /**
     * Inorder traversal (Left -> Root -> Right)
     * @param {Function} callback - Function to call for each node
     */
    inorderTraversal(callback) {
        this._inorder(this.root, callback);
    }

    /**
     * Helper for inorder traversal
     * @private
     */
    _inorder(node, callback) {
        if (node === null) return;
        this._inorder(node.left, callback);
        callback(node);
        this._inorder(node.right, callback);
    }

    /**
     * Preorder traversal (Root -> Left -> Right)
     * @param {Function} callback - Function to call for each node
     */
    preorderTraversal(callback) {
        this._preorder(this.root, callback);
    }

    /**
     * Helper for preorder traversal
     * @private
     */
    _preorder(node, callback) {
        if (node === null) return;
        callback(node);
        this._preorder(node.left, callback);
        this._preorder(node.right, callback);
    }

    /**
     * Postorder traversal (Left -> Right -> Root)
     * @param {Function} callback - Function to call for each node
     */
    postorderTraversal(callback) {
        this._postorder(this.root, callback);
    }

    /**
     * Helper for postorder traversal
     * @private
     */
    _postorder(node, callback) {
        if (node === null) return;
        this._postorder(node.left, callback);
        this._postorder(node.right, callback);
        callback(node);
    }

    /**
     * Level order traversal (Breadth-first)
     * @param {Function} callback - Function to call for each node
     */
    levelOrderTraversal(callback) {
        if (this.root === null) return;

        const queue = [this.root];
        while (queue.length > 0) {
            const node = queue.shift();
            callback(node);

            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }

    /**
     * Get all nodes as array (inorder)
     * @returns {TreeNode[]}
     */
    toArray() {
        const nodes = [];
        this.inorderTraversal(node => nodes.push(node));
        return nodes;
    }

    /**
     * Get all values as array (inorder)
     * @returns {Array}
     */
    getValues() {
        const values = [];
        this.inorderTraversal(node => values.push(node.value));
        return values;
    }

    // ============================================
    // Animation Support
    // ============================================

    /**
     * Add an animation step
     * @param {string} action - Action type ('highlight', 'visit', 'compare', etc.)
     * @param {Object} data - Animation data
     * @protected
     */
    _addAnimationStep(action, data) {
        this.animationSteps.push({
            action,
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Get all animation steps and clear
     * @returns {Array}
     */
    getAnimationSteps() {
        const steps = [...this.animationSteps];
        this.animationSteps = [];
        return steps;
    }

    /**
     * Clear animation steps
     */
    clearAnimationSteps() {
        this.animationSteps = [];
    }

    // ============================================
    // Utility Methods
    // ============================================

    /**
     * Reset visual state of all nodes
     */
    resetVisualState() {
        this.levelOrderTraversal(node => node.resetVisualState());
    }

    /**
     * Get tree info as object
     * @returns {Object}
     */
    getInfo() {
        return {
            name: this.name,
            nodeCount: this.nodeCount,
            height: this.getHeight(),
            isEmpty: this.isEmpty()
        };
    }

    /**
     * String representation for debugging
     * @returns {string}
     */
    toString() {
        return `${this.name} (nodes: ${this.nodeCount}, height: ${this.getHeight()})`;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.TreeBase = TreeBase;
}
