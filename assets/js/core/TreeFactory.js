/**
 * TreeLab - TreeFactory (Factory Pattern)
 * 
 * Purpose: Creates tree instances based on type
 * Simplifies tree instantiation and follows Factory design pattern
 */

class TreeFactory {
    /**
     * Create a tree instance of the specified type
     * @param {string} type - Tree type identifier
     * @returns {TreeBase} Tree instance
     */
    static createTree(type) {
        const treeType = type.toLowerCase();
        
        switch (treeType) {
            case 'bst':
            case 'binary-search-tree':
                return new BSTTree();
                
            case 'avl':
            case 'avl-tree':
                return new AVLTree();
                
            case 'redblack':
            case 'red-black-tree':
                return new RedBlackTree();
                
            case 'heap':
            case 'min-heap':
                return new MinHeap();
                
            case 'trie':
            case 'prefix-tree':
                return new Trie();
                
            // Not yet implemented
            /*
            case 'max-heap':
                return new MaxHeap();
            */
                
            case 'btree':
                return new BTree();
                
            case 'bplus':
                return new BPlusTree();
                
            case 'segment':
                return new SegmentTree();
                
            case 'fenwick':
                return new FenwickTree();

                
            default:
                console.warn(`Unknown tree type: ${type}, defaulting to BST`);
                return new BSTTree();
        }
    }

    /**
     * Get list of all available tree types
     * @returns {Array} Array of tree type objects
     */
    static getAvailableTypes() {
        return [
            { id: 'bst', name: 'Binary Search Tree', implemented: true },
            { id: 'avl', name: 'AVL Tree', implemented: true },
            { id: 'redblack', name: 'Red-Black Tree', implemented: true },
            { id: 'heap', name: 'Min Heap', implemented: true },
            { id: 'trie', name: 'Trie', implemented: true },
            { id: 'btree', name: 'B-Tree', implemented: true },
            { id: 'bplus', name: 'B+ Tree', implemented: true },
            { id: 'segment', name: 'Segment Tree', implemented: true },
            { id: 'fenwick', name: 'Fenwick Tree', implemented: true }
        ];
    }
}

// Export
if (typeof window !== 'undefined') {
    window.TreeFactory = TreeFactory;
}
