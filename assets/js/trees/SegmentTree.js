
/**
 * Segment Tree Implementation
 * Stores Sum of range.
 */
class SegmentTree extends TreeBase {
    constructor() {
        super('Segment Tree');
        this.data = []; // User input data
        this.root = null;
    }

    /**
     * Insert a value (Appends to array)
     * @param {*} value 
     */
    insert(value) {
        // Parse value as number for sum operations
        const numVal = parseInt(value);
        if (isNaN(numVal)) {
            console.warn("Segment Tree requires numeric values");
            return;
        }

        this.data.push(numVal);
        this.nodeCount = this.data.length;
        
        // Rebuild tree
        this.buildTree();
        this._addAnimationStep('insert', { value: numVal, index: this.data.length - 1 });
    }

    buildTree() {
        if (this.data.length === 0) {
            this.root = null;
            return;
        }
        this.root = this._buildRecursive(0, this.data.length - 1);
    }

    _buildRecursive(start, end) {
        // Create node
        let node = new TreeNode(0); // Value placeholder
        // Check if TreeNode supports extra props? Yes, generic JS object.
        node.start = start;
        node.end = end;
        node.rangeText = `[${start}-${end}]`; // For visualization if needed

        if (start === end) {
            node.value = this.data[start];
            return node;
        }

        let mid = Math.floor((start + end) / 2);
        node.left = this._buildRecursive(start, mid);
        node.right = this._buildRecursive(mid + 1, end);
        
        if (node.left) node.left.parent = node;
        if (node.right) node.right.parent = node;

        node.value = node.left.value + node.right.value;
        return node;
    }

    /**
     * Search (interpreted as Range Query or Point Query?)
     * TreeBase defines search(value). 
     * For Segment Tree, maybe we search for a specific value in the array?
     * Or we can repurpose it for "Update" if value is object?
     * 
     * Let's implement standard search for value existence for now.
     */
    search(value) {
        // Linear search in data?
        // Or search in tree nodes?
        // Segment tree values are sums, so searching for "5" in sums is weird.
        // But leaves are original values.
        return this._searchLeaves(this.root, parseInt(value));
    }

    _searchLeaves(node, value) {
        if (!node) return null;
        if (node.start === node.end) {
            if (node.value === value) {
                this._addAnimationStep('found', { node, value });
                return node;
            }
            return null;
        }
        
        let found = this._searchLeaves(node.left, value);
        if (found) return found;
        return this._searchLeaves(node.right, value);
    }

    /**
     * Delete (Remove last element? Or value?)
     * For uniformity, let's say "delete" removes by value or index?
     * B-Tree/BST remove by value.
     * Let's warn and skip for now as it's less standard for SegTree visualization 
     * unless we do "remove at index".
     */
    delete(value) {
        console.warn("Delete not implemented for Segment Tree (Array usually fixed or append-only)");
        return false;
    }
    
    // Custom method for Point Update (if UI supports it later)
    update(index, newValue) {
        if (index < 0 || index >= this.data.length) return;
        this.data[index] = newValue;
        this._updateRecursive(this.root, index, newValue);
    }

    _updateRecursive(node, index, newValue) {
        if (!node) return;
        
        if (node.start === node.end) {
            node.value = newValue;
            this._addAnimationStep('update', { node, value: newValue });
            return; // Return diff?
        }
        
        let mid = Math.floor((node.start + node.end) / 2);
        if (index <= mid) {
            this._updateRecursive(node.left, index, newValue);
        } else {
            this._updateRecursive(node.right, index, newValue);
        }
        
        node.value = node.left.value + node.right.value;
        this._addAnimationStep('update_internal', { node, value: node.value });
    }
}

if (typeof window !== 'undefined') {
    window.SegmentTree = SegmentTree;
}
