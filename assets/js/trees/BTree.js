
/**
 * B-Tree Node Class
 */
class BTreeNode {
    /**
     * @param {boolean} isLeaf
     */
    constructor(isLeaf = true) {
        this.keys = [];
        this.children = [];
        this.isLeaf = isLeaf;
        this.parent = null;
        
        // Visual properties
        this.x = 0;
        this.y = 0;
        this.width = 40; // Base width
        this.height = 40;
        this.highlighted = false;
        this.highlightColor = null;
    }

    resetVisualState() {
        this.highlighted = false;
        this.highlightColor = null;
    }
}

/**
 * TreeLab - B-Tree Implementation
 */
class BTree extends TreeBase {
    /**
     * @param {number} t - Minimum degree (defines the range for number of keys)
     * t=2 -> 2-3-4 tree (max 3 keys, 4 children)
     * Max keys = 2*t - 1
     * Min keys = t - 1
     */
    constructor(t = 2) {
        super('B-Tree');
        this.t = t; // Minimum degree
        this.root = null;
    }

    /**
     * Search for a value
     * @param {*} value 
     */
    search(value) {
        if (!this.root) return null;
        return this._searchNode(this.root, value);
    }

    _searchNode(node, value) {
        let i = 0;
        while (i < node.keys.length && value > node.keys[i]) {
            this._addAnimationStep('compare', { node: node, index: i, value: value });
            i++;
        }

        if (i < node.keys.length && value === node.keys[i]) {
            this._addAnimationStep('found', { node: node, index: i, value: value });
            return { node, index: i };
        }

        if (node.isLeaf) {
            return null;
        }

        return this._searchNode(node.children[i], value);
    }

    /**
     * Insert a value
     * @param {*} value 
     */
    insert(value) {
        // If tree is empty
        if (!this.root) {
            this.root = new BTreeNode(true);
            this.root.keys[0] = value;
            this.nodeCount++;
            this._addAnimationStep('insert_root', { value });
            return;
        }

        // If root is full
        if (this.root.keys.length === 2 * this.t - 1) {
            let s = new BTreeNode(false);
            s.children[0] = this.root;
            this.root.parent = s;
            let oldRoot = this.root;
            this.root = s;
            
            this._splitChild(s, 0);
            this._insertNonFull(s, value);
        } else {
            this._insertNonFull(this.root, value);
        }
        this.nodeCount++;
    }

    /**
     * Split child node
     * @param {BTreeNode} x - Parent node
     * @param {number} i - Index of child to split
     */
    _splitChild(x, i) {
        let y = x.children[i];
        let z = new BTreeNode(y.isLeaf);
        z.parent = x;

        // Move last (t-1) keys of y to z
        for (let j = 0; j < this.t - 1; j++) {
            z.keys[j] = y.keys[j + this.t];
        }

        // Move last t children of y to z (if not leaf)
        if (!y.isLeaf) {
            for (let j = 0; j < this.t; j++) {
                z.children[j] = y.children[j + this.t];
                if (z.children[j]) z.children[j].parent = z;
            }
        }

        // Reduce keys of y
        y.keys.length = this.t - 1;
        y.children.length = y.isLeaf ? 0 : this.t;

        // Shift children of x to make room for z
        for (let j = x.children.length; j > i + 1; j--) {
            x.children[j] = x.children[j - 1];
        }
        x.children[i + 1] = z;

        // Shift keys of x to make room for median key from y
        for (let j = x.keys.length; j > i; j--) {
            x.keys[j] = x.keys[j - 1];
        }
        x.keys[i] = y.keys[this.t - 1];
        
        this._addAnimationStep('split', { parent: x, child: y, newChild: z });
    }

    /**
     * Insert into non-full node
     * @param {BTreeNode} x 
     * @param {*} value 
     */
    _insertNonFull(x, value) {
        let i = x.keys.length - 1;

        if (x.isLeaf) {
            while (i >= 0 && value < x.keys[i]) {
                x.keys[i + 1] = x.keys[i];
                i--;
            }
            x.keys[i + 1] = value;
            this._addAnimationStep('insert_leaf', { node: x, value });
        } else {
            while (i >= 0 && value < x.keys[i]) {
                i--;
            }
            i++;
            if (x.children[i].keys.length === 2 * this.t - 1) {
                this._splitChild(x, i);
                if (value > x.keys[i]) {
                    i++;
                }
            }
            this._insertNonFull(x.children[i], value);
        }
    }

    /**
     * Delete a value - To be implemented
     */
    delete(value) {
        console.warn('Delete not fully implemented for B-Tree yet');
        // Placeholder implementation
        return false;
    }
    
    // Override traversal for B-Tree structure
    inorderTraversal(callback) {
        if (this.root) {
            this._inorder(this.root, callback);
        }
    }

    _inorder(node, callback) {
        let i;
        for (i = 0; i < node.keys.length; i++) {
            if (!node.isLeaf) {
                this._inorder(node.children[i], callback);
            }
            // We can treat keys as "nodes" for the callback if we want standard behavior,
            // or pass the whole node. For standard visualization list, we might just pass values?
            // TreeBase expects callback(node). Since BTreeNode holds multiple values, 
            // this adaptation depends on how the visualizer uses it.
            // For now, we'll skipping detailed inorder adaptation or adapt it to visit 'keys'.
        }
        if (!node.isLeaf) {
            this._inorder(node.children[i], callback);
        }
    }
    
    /**
     * Override level order for B-Tree
     */
    levelOrderTraversal(callback) {
        if (!this.root) return;
        let queue = [this.root];
        while (queue.length > 0) {
            let node = queue.shift();
            callback(node);
            if (!node.isLeaf) {
                for (let child of node.children) {
                    queue.push(child);
                }
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.BTree = BTree;
    window.BTreeNode = BTreeNode;
}
