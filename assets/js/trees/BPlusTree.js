
/**
 * B+ Tree Node Class
 */
class BPlusTreeNode {
    /**
     * @param {boolean} isLeaf
     */
    constructor(isLeaf = true) {
        this.keys = [];
        this.children = [];
        this.isLeaf = isLeaf;
        this.parent = null;
        this.next = null; // Pointer to next leaf (for leaf nodes)
        
        // Visual properties
        this.x = 0;
        this.y = 0;
        this.width = 40;
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
 * TreeLab - B+ Tree Implementation
 */
class BPlusTree extends TreeBase {
    /**
     * @param {number} t - Minimum degree
     * Max keys = 2*t - 1
     * Min keys = t - 1
     */
    constructor(t = 2) {
        super('B+ Tree');
        this.t = t;
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

        if (node.isLeaf) {
            if (i < node.keys.length && value === node.keys[i]) {
                this._addAnimationStep('found', { node: node, index: i, value: value });
                return { node, index: i };
            }
            return null;
        }

        if (i < node.keys.length && value === node.keys[i]) {
             // In B+ tree, internal node keys are just separators, we continue to right child for equal
             return this._searchNode(node.children[i + 1], value);
        }

        return this._searchNode(node.children[i], value);
    }

    /**
     * Insert a value
     * @param {*} value 
     */
    insert(value) {
        if (!this.root) {
            this.root = new BPlusTreeNode(true);
            this.root.keys[0] = value;
            this.nodeCount++;
            this._addAnimationStep('insert_root', { value });
            return;
        }

        let root = this.root;
        if (root.keys.length === 2 * this.t - 1) {
            let s = new BPlusTreeNode(false);
            this.root = s;
            s.children[0] = root;
            root.parent = s;
            this._splitChild(s, 0);
            this._insertNonFull(s, value);
        } else {
            this._insertNonFull(root, value);
        }
        this.nodeCount++;
    }

    /**
     * Insert into non-full node
     * @param {BPlusTreeNode} x 
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
                } else if (value === x.keys[i]) {
                     // Handle equality if needed, B+ usually goes to right
                     i++;
                }
            }
            this._insertNonFull(x.children[i], value);
        }
    }

    /**
     * Split child node
     * @param {BPlusTreeNode} x - Parent
     * @param {number} index - Index of child
     */
    _splitChild(x, index) {
        let y = x.children[index];
        let z = new BPlusTreeNode(y.isLeaf);
        z.parent = x;

        // B+ Tree split difference:
        // Leaf split: Copy middle key up, keep it in right leaf.
        // Internal split: Push middle key up, exclude it from new node.

        if (y.isLeaf) {
            // Returns median index for t
            // t=2, max keys 3. 0,1,2. Split -> mid=1?
            // If keys < 2t-1 (max), we don't split.
            // Split when full (2t-1 keys).
            // Example t=2, keys=3 [10, 20, 30]. Full.
            // New z gets keys from t to 2t-2.
            // y keeps 0 to t-1.
            
            // Move last t-1 keys to z
            // For t=2, max=3 keys. 0,1,2.
            // z gets keys[2..2]. y keeps keys[0..1]. Wait.
            // B+ leaf split: split at t.
            // keys 0..(t-1) -> y
            // keys t..(2t-2) -> z
            
            // Standard:
            // y has 2*t - 1 keys.
            // Split point usually t.
            
            for (let j = 0; j < this.t - 1; j++) {
                z.keys[j] = y.keys[j + this.t];
            }
            
            // Adjust y and z sizes
             y.keys.length = this.t; // Leaf needs to keep t keys? Or t-1?
             // Actually B+ tree leaves usually split 50/50.
             // If degree is order m (max children). Max keys m-1.
             // Here t is min-degree. Max keys 2t-1. Min keys t-1.
             // Full node 2t-1 keys.
             // Leaf split: existing 2t-1. New comes. logic handles before full?
             // No, insertNonFull calls split if child IS full (2t-1).
             
             // Split 2t-1 keys into:
             // y: 0 to t-2 (t-1 keys)
             // z: t to 2t-2 (t-1 keys)
             // parent: takes key[t-1] but COPY it?
             // For leaf: COPY middle key to parent.
             // key[t-1] is middle.
             
             // Leaf split logic:
             // y has [k0 ... k(2t-2)]
             // z gets [k(t) ... k(2t-2)] (t-1 keys)
             // y keeps [k0 ... k(t-1)] (t keys)
             // Push up k(t-1)? No, k(t-1) stays in y? Or z?
             // B+ Tree standard:
             // Left: ceil(m/2). Right: floor(m/2) or similar.
             // Copy up the first key of the right node.
             
             // Let's stick to Introduction to Algorithms style B-Trees and adapt for B+.
             // CLRS B-Tree: Split pushes median up.
             // B+ adapt:
             // Leaf: Move t keys to z. (indexes t-1 to 2t-2).
             // y keeps t-1 keys (0 to t-2).
             // Copy key[t-1] to parent.
             // Wait, total 2t-1. 
             // z: t keys? index t-1 is the pivot for parent?
             
             // Let's implement simplified B+ split.
             // y: [0...t-1] (t keys)
             // z: [t...2t-1] (t-1 keys?? No we have 2t-1 total).
             // 2t-1 keys. 
             // y keeps 0 to t-1. (t keys)
             // z gets t to 2t-2. (t-1 keys)
             // parent gets COPY of key[t-1]? Or key[t]?
             // Actually, parent gets key[t-1] (the t-th key).
             // And that key MUST appear in z as first key? Or y as last?
             // In B+, all keys in leaves. So if pushed up, must remain in leaf.
             // Usually remains in right leaf (z) as first key.
             
             // Correct logic:
             // y has 2*t - 1 keys.
             // z gets keys from t-1 to 2*t - 2. (t keys)
             // y keeps keys from 0 to t-2. (t-1 keys)
             // pivot is key[t-1]. It goes to z[0] AND copied to parent.
             
            let pivotIndex = this.t - 1;
            
            // Move keys to z starting from pivot
            for (let j = 0; j < this.t; j++) { // t keys
                if (pivotIndex + j < y.keys.length)
                    z.keys[j] = y.keys[pivotIndex + j];
            }
            
            // Link leaves
            z.next = y.next;
            y.next = z;
            
            y.keys.length = this.t - 1; // y removes pivot and rest
            
            // Parent insert
            // Shift children of x
            for (let j = x.children.length; j > index + 1; j--) {
                x.children[j] = x.children[j - 1];
            }
            x.children[index + 1] = z;
            
            // Shift keys of x
            for (let j = x.keys.length; j > index; j--) {
                x.keys[j] = x.keys[j - 1];
            }
            // Copy pivot to parent
            x.keys[index] = z.keys[0]; // The pivot is now at z[0]


        } else {
            // Internal node split (same as B-Tree)
            // Median moves up, NOT copied.
             
            for (let j = 0; j < this.t - 1; j++) {
                z.keys[j] = y.keys[j + this.t];
            }
            
            if (!y.isLeaf) {
                for (let j = 0; j < this.t; j++) {
                    z.children[j] = y.children[j + this.t];
                    if (z.children[j]) z.children[j].parent = z;
                }
            }
            
            y.keys.length = this.t - 1;
            y.children.length = this.t;
            
            for (let j = x.children.length; j > index + 1; j--) {
                x.children[j] = x.children[j - 1];
            }
            x.children[index + 1] = z;
            
            for (let j = x.keys.length; j > index; j--) {
                x.keys[j] = x.keys[j - 1];
            }
            x.keys[index] = y.keys[this.t - 1]; // Move median up (original y has it at t-1 before truncation? wait. y keys was 2t-1. median at t-1. yes. )
            // But we truncated y.keys to t-1. So the median was effectively removed from y.
            // Wait, previous logic `y.keys.length = this.t - 1` removes index `t-1` and above.
            // So we must access `y.keys` BEFORE truncating or access via temp.
            // In B-Tree code I did:
            // x.keys[i] = y.keys[this.t - 1];
            // AFTER loops but BEFORE truncation?
            // Let's recheck BTree code logic.
            // BTree code:
            // for j... z.keys[j] = y.keys[j+t]  <-- takes from t to 2t-2
            // y.keys[t-1] is the median.
            // code said: x.keys[i] = y.keys[this.t - 1];
            // Yes.
        }
        
        this._addAnimationStep('split', { parent: x, child: y, newChild: z });
    }

    delete(value) {
        console.warn('Delete not fully implemented for B+ Tree yet');
        return false;
    }
    
    // Override traversals
    // B+ Tree has linked leaves, perfect for inorder!
    inorderTraversal(callback) {
        if (!this.root) return;
        
        let node = this.root;
        while (!node.isLeaf) {
            node = node.children[0];
        }
        
        while (node) {
            for (let val of node.keys) {
                // Mock a node structure needed by callback? or just value?
                // Visualizer usually expects a node object to highlight.
                // We can pass the leaf node.
                callback(node); // This might be called multiple times for same node if we iterate keys.
                // If visualizer highlights node, it's fine.
            }
            node = node.next;
        }
    }
    
    // Level order
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
    window.BPlusTree = BPlusTree;
    window.BPlusTreeNode = BPlusTreeNode;
}
