/**
 * TreeLab - TreeNode Class
 * 
 * Purpose: Generic tree node data structure that can be used by all tree types
 * 
 * SOLID Principles:
 * - Single Responsibility: Represents a single node with its data and connections
 * - Open/Closed: Can be extended for specific node types without modification
 */

class TreeNode {
    /**
     * Create a new tree node
     * @param {*} value - The value stored in the node
     * @param {TreeNode|null} left - Left child node
     * @param {TreeNode|null} right - Right child node
     */
    constructor(value, left = null, right = null) {
        this.value = value;
        this.left = left;
        this.right = right;
        
        // Additional properties for different tree types
        this.height = 1; // For AVL trees
        this.color = 'RED'; // For Red-Black trees ('RED' or 'BLACK')
        this.parent = null; // For trees that need parent references
        
        // Visual properties for rendering
        this.x = 0;
        this.y = 0;
        this.isHighlighted = false;
        this.isVisited = false;
        this.isCurrent = false;
    }

    /**
     * Check if node is a leaf (has no children)
     * @returns {boolean}
     */
    isLeaf() {
        return this.left === null && this.right === null;
    }

    /**
     * Check if node has only one child
     * @returns {boolean}
     */
    hasOneChild() {
        return (this.left === null && this.right !== null) || 
               (this.left !== null && this.right === null);
    }

    /**
     * Check if node has both children
     * @returns {boolean}
     */
    hasBothChildren() {
        return this.left !== null && this.right !== null;
    }

    /**
     * Get the number of children
     * @returns {number}
     */
    getChildCount() {
        let count = 0;
        if (this.left) count++;
        if (this.right) count++;
        return count;
    }

    /**
     * Clone the node (shallow copy)
     * @returns {TreeNode}
     */
    clone() {
        const node = new TreeNode(this.value);
        node.height = this.height;
        node.color = this.color;
        node.x = this.x;
        node.y = this.y;
        return node;
    }

    /**
     * Reset visual properties
     */
    resetVisualState() {
        this.isHighlighted = false;
        this.isVisited = false;
        this.isCurrent = false;
    }

    /**
     * String representation for debugging
     * @returns {string}
     */
    toString() {
        return `TreeNode(${this.value})`;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.TreeNode = TreeNode;
}
