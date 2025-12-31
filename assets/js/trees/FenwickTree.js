
/**
 * Fenwick Tree (Binary Indexed Tree) Implementation
 */
class FenwickTree extends TreeBase {
    constructor() {
        super('Fenwick Tree');
        this.tree = [0]; // 1-based indexing usually, 0 is dummy
        this.data = [];  // Original data
        this.root = null;
    }

    /**
     * Insert (Append value)
     * @param {*} value 
     */
    insert(value) {
        const numVal = parseInt(value);
        if (isNaN(numVal)) {
            console.warn("Fenwick Tree requires numeric values");
            return;
        }

        // Add to data
        this.data.push(numVal);
        let index = this.data.length; // 1-based index for BIT
        
        // Init tree array if needed
        if (this.tree.length <= index) {
            this.tree.push(0);
        }
        
        // Update BIT
        this._updateBIT(index, numVal);
        this.nodeCount++;
        
        // Rebuild visual tree
        this.buildVisualTree();
        this._addAnimationStep('insert', { value: numVal, index: index });
    }

    /**
     * Update BIT logic
     */
    _updateBIT(index, delta) {
        while (index < this.tree.length) {
            this.tree[index] += delta;
            index += index & (-index);
        }
    }

    /**
     * Prefix Sum query
     */
    query(index) {
        let sum = 0;
        let i = index;
        while (i > 0) {
            sum += this.tree[i];
            i -= i & (-i);
        }
        return sum;
    }

    /**
     * Build a visual tree based on the update structure (i -> i + lowbit(i))
     */
    buildVisualTree() {
        if (this.data.length === 0) {
            this.root = null;
            return;
        }

        // Create nodes for 1..n
        let nodes = new Map();
        let n = this.data.length;
        
        // Create a virtual root to hold the forest
        this.root = new TreeNode("Root");
        this.root.isVirtual = true; // Use a flag to hide it or style it differently if needed
        
        for (let i = 1; i <= n; i++) {
            let node = new TreeNode(this.tree[i]); // Show BIT value
            node.originalValue = this.data[i-1];
            node.index = i;
            node.label = `idx:${i}`;
            nodes.set(i, node);
        }

        // Connect nodes
        // Parent of i is i + lowbit(i)
        // If parent > n, attach to virtual root
        for (let i = 1; i <= n; i++) {
            let parentIdx = i + (i & (-i));
            let node = nodes.get(i);
            
            if (parentIdx <= n) {
                let parent = nodes.get(parentIdx);
                // TreeBase TreeNode only has left/right. 
                // We need general children support for Fenwick visualization?
                // Or we can try to fit into binary?
                // Multiple nodes might have same parent.
                // TreeNode expects left/right.
                // We might need to extend TreeNode or use 'children' array if visualizer supports it.
                // Checking TreeNode.js: it has getChildCount() using left/right.
                // But it's JS, we can add 'children' property.
                // Does Visualizer support 'children' array?
                // Let's assume NO for now, and try to chain them?
                // Or maybe just show them as a list (all children of root) for simplicity?
                
                // Better: Create the dependency tree using 'left' as 'next sibling' and 'right' as 'first child'? (LCRS)
                // Or just add a 'children' array and hope visualizer handles it or update visualizer?
                // I will add 'children' array to node and see. If visualizer only uses left/right, it won't show.
                // But BTree uses 'children'. Visualizer likely updated or handles BTree special.
                // BTree uses BTreeNode which has children.
                // FenwickTree will use FenwickTreeNode?
                
                if (!parent.children) parent.children = [];
                parent.children.push(node);
                node.parent = parent;
            } else {
                // Attach to virtual root
                if (!this.root.children) this.root.children = [];
                this.root.children.push(node);
                node.parent = this.root;
            }
        }
    }
    
    // Override traversals to support 'children' array if using that structure
    inorderTraversal(callback) {
        this._genericTraversal(this.root, callback);
    }
    
    levelOrderTraversal(callback) {
        if (!this.root) return;
        let queue = [this.root];
        while (queue.length > 0) {
            let node = queue.shift();
            callback(node); // Visit
            
            if (node.children) {
                for (let child of node.children) {
                    queue.push(child);
                }
            } else {
                // Fallback for standard nodes
                if (node.left) queue.push(node.left);
                if (node.right) queue.push(node.right);
            }
        }
    }
    
    _genericTraversal(node, callback) {
        if (!node) return;
        // Pre-order like visit
        callback(node);
        if (node.children) {
            for (let child of node.children) {
                this._genericTraversal(child, callback);
            }
        }
    }
    
    search(value) {
        // Search by value in data?
        // Or search value in tree sums?
        // Let's search in original data.
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i] == value) { // Loose equality for string/num
                 // Find the node corresponding to index i+1
                 // We need to find node in the tree structure.
                 // We can map index to node.
                 // But for now, let's just traversal search
                 let found = null;
                 this.levelOrderTraversal(n => {
                     if (n.index === i + 1) found = n;
                 });
                 if (found) {
                     this._addAnimationStep('found', { node: found, value });
                     return found;
                 }
            }
        }
        return null;
    }
    
    delete(value) {
         console.warn("Delete not implemented for Fenwick Tree");
         return false;
    }
}

if (typeof window !== 'undefined') {
    window.FenwickTree = FenwickTree;
}
