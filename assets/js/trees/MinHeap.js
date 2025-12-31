/**
 * TreeLab - Min Heap Implementation
 * 
 * Purpose: Complete binary tree with heap property (parent ≤ children)
 * Used for: Priority queues, heap sort
 */

class MinHeap extends TreeBase {
    constructor() {
        super('Min Heap');
        this.array = []; // Array representation
    }

    /**
     * Insert a value into the heap
     * @param {number} value
     */
    insert(value) {
        this.clearAnimationSteps();
        this.array.push(value);
        this.nodeCount++;
        
        // Heapify up
        this._heapifyUp(this.array.length - 1);
        
        // Rebuild tree structure for visualization
        this._rebuildTree();
        
        eventBus.emit(EVENTS.NODE_INSERTED, { value, tree: this });
    }

    /**
     * Heapify up (bubble up)
     * @private
     */
    _heapifyUp(index) {
        if (index === 0) return;

        const parentIndex = Math.floor((index - 1) / 2);
        
        this._addAnimationStep('compare', { 
            index, 
            parentIndex,
            description: `${this.array[index]} ile ${this.array[parentIndex]} karşılaştırılıyor`
        });

        if (this.array[index] < this.array[parentIndex]) {
            // Swap
            [this.array[index], this.array[parentIndex]] = 
            [this.array[parentIndex], this.array[index]];
            
            this._addAnimationStep('swap', { index, parentIndex });
            this._heapifyUp(parentIndex);
        }
    }

    /**
     * Delete (extract minimum)
     * @returns {boolean}
     */
    delete() {
        if (this.array.length === 0) return false;

        this.clearAnimationSteps();
        
        // Remove root
        const min = this.array[0];
        const last = this.array.pop();
        this.nodeCount--;

        if (this.array.length > 0) {
            this.array[0] = last;
            this._heapifyDown(0);
        }

        this._rebuildTree();
        eventBus.emit(EVENTS.NODE_DELETED, { value: min, tree: this });
        return true;
    }

    /**
     * Heapify down (bubble down)
     * @private
     */
    _heapifyDown(index) {
        const leftChild = 2 * index + 1;
        const rightChild = 2 * index + 2;
        let smallest = index;

        if (leftChild < this.array.length && 
            this.array[leftChild] < this.array[smallest]) {
            smallest = leftChild;
        }

        if (rightChild < this.array.length && 
            this.array[rightChild] < this.array[smallest]) {
            smallest = rightChild;
        }

        if (smallest !== index) {
            this._addAnimationStep('swap', { index, smallest });
            
            [this.array[index], this.array[smallest]] = 
            [this.array[smallest], this.array[index]];
            
            this._heapifyDown(smallest);
        }
    }

    /**
     * Search for a value (linear search in heap)
     * @param {number} value
     * @returns {TreeNode|null}
     */
    search(value) {
        this.clearAnimationSteps();
        const index = this.array.indexOf(value);
        
        if (index !== -1) {
            // Find corresponding node in tree
            const node = this._findNodeAtIndex(this.root, index, 0);
            this._addAnimationStep('found', { node });
            eventBus.emit(EVENTS.NODE_SEARCHED, { value, found: true, tree: this });
            return node;
        }
        
        eventBus.emit(EVENTS.NODE_SEARCHED, { value, found: false, tree: this });
        return null;
    }

    /**
     * Find node at specific array index in tree
     * @private
     */
    _findNodeAtIndex(node, targetIndex, currentIndex) {
        if (!node || currentIndex > targetIndex) return null;
        if (currentIndex === targetIndex) return node;

        const leftResult = this._findNodeAtIndex(
            node.left, 
            targetIndex, 
            2 * currentIndex + 1
        );
        if (leftResult) return leftResult;

        return this._findNodeAtIndex(
            node.right, 
            targetIndex, 
            2 * currentIndex + 2
        );
    }

    /**
     * Rebuild tree structure from array
     * @private
     */
    _rebuildTree() {
        this.root = this._buildTreeFromArray(0);
    }

    /**
     * Build tree from array representation
     * @private
     */
    _buildTreeFromArray(index) {
        if (index >= this.array.length) return null;

        const node = new TreeNode(this.array[index]);
        node.left = this._buildTreeFromArray(2 * index + 1);
        node.right = this._buildTreeFromArray(2 * index + 2);

        if (node.left) node.left.parent = node;
        if (node.right) node.right.parent = node;

        return node;
    }

    /**
     * Clear the heap
     */
    clear() {
        this.array = [];
        super.clear();
    }

    /**
     * Get minimum value (peek)
     * @returns {number|null}
     */
    getMin() {
        return this.array.length > 0 ? this.array[0] : null;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.MinHeap = MinHeap;
}
