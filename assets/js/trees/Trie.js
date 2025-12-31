/**
 * TreeLab - Trie (Prefix Tree) Implementation
 * 
 * Purpose: Specialized tree for string storage and retrieval
 * Used for: Autocomplete, spell checking, IP routing
 */

class TrieNode {
    constructor(char = '') {
        this.char = char;
        this.children = new Map(); // char -> TrieNode
        this.isEndOfWord = false;
        this.value = char; // For visualization compatibility
        
        // Visual properties
        this.x = 0;
        this.y = 0;
        this.isHighlighted = false;
        this.isVisited = false;
        this.isCurrent = false;
    }

    resetVisualState() {
        this.isHighlighted = false;
        this.isVisited = false;
        this.isCurrent = false;
    }
}

class Trie extends TreeBase {
    constructor() {
        super('Trie (Prefix Tree)');
        this.root = new TrieNode('ROOT');
        this.wordCount = 0;
    }

    /**
     * Insert a word into the trie
     * @param {string} word
     */
    insert(word) {
        if (typeof word !== 'string' || word.length === 0) {
            alert('Lütfen geçerli bir kelime girin');
            return;
        }

        word = word.toLowerCase();
        this.clearAnimationSteps();
        
        let currentNode = this.root;
        
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            
            this._addAnimationStep('visit', { 
                node: currentNode, 
                char,
                description: `'${char}' karakteri aranıyor`
            });
            
            if (!currentNode.children.has(char)) {
                const newNode = new TrieNode(char);
                currentNode.children.set(char, newNode);
                this.nodeCount++;
                
                this._addAnimationStep('insert', { 
                    node: newNode, 
                    isNew: true,
                    description: `'${char}' eklendi`
                });
            }
            
            currentNode = currentNode.children.get(char);
        }
        
        if (!currentNode.isEndOfWord) {
            currentNode.isEndOfWord = true;
            this.wordCount++;
            this._addAnimationStep('markEnd', { 
                node: currentNode,
                description: `"${word}" kelimesi tamamlandı`
            });
        }
        
        eventBus.emit(EVENTS.NODE_INSERTED, { value: word, tree: this });
    }

    /**
     * Search for a word
     * @param {string} word
     * @returns {boolean}
     */
    search(word) {
        if (typeof word !== 'string' || word.length === 0) {
            return null;
        }

        word = word.toLowerCase();
        this.clearAnimationSteps();
        
        let currentNode = this.root;
        
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            
            this._addAnimationStep('visit', { node: currentNode, char });
            
            if (!currentNode.children.has(char)) {
                eventBus.emit(EVENTS.NODE_SEARCHED, { value: word, found: false, tree: this });
                return null;
            }
            
            currentNode = currentNode.children.get(char);
        }
        
        const found = currentNode.isEndOfWord;
        
        if (found) {
            this._addAnimationStep('found', { node: currentNode });
        }
        
        eventBus.emit(EVENTS.NODE_SEARCHED, { value: word, found, tree: this });
        return found ? currentNode : null;
    }

    /**
     * Check if any word starts with given prefix
     * @param {string} prefix
     * @returns {boolean}
     */
    startsWith(prefix) {
        prefix = prefix.toLowerCase();
        let currentNode = this.root;
        
        for (const char of prefix) {
            if (!currentNode.children.has(char)) {
                return false;
            }
            currentNode = currentNode.children.get(char);
        }
        
        return true;
    }

    /**
     * Delete a word
     * @param {string} word
     * @returns {boolean}
     */
    delete(word) {
        if (typeof word !== 'string' || word.length === 0) {
            return false;
        }

        word = word.toLowerCase();
        this.clearAnimationSteps();
        
        const deleted = this._deleteWord(this.root, word, 0);
        
        if (deleted) {
            this.wordCount--;
            eventBus.emit(EVENTS.NODE_DELETED, { value: word, tree: this });
        }
        
        return deleted;
    }

    /**
     * Helper method to delete a word recursively
     * @private
     */
    _deleteWord(node, word, index) {
        if (index === word.length) {
            if (!node.isEndOfWord) return false;
            node.isEndOfWord = false;
            return node.children.size === 0;
        }

        const char = word[index];
        const child = node.children.get(char);
        
        if (!child) return false;

        const shouldDeleteChild = this._deleteWord(child, word, index + 1);

        if (shouldDeleteChild) {
            node.children.delete(char);
            this.nodeCount--; // Decrement nodeCount when a node is actually removed
            return node.children.size === 0 && !node.isEndOfWord;
        }

        return false;
    }

    /**
     * Override getHeight to handle Trie's Map-based structure
     * @returns {number} Height of the trie
     */
    getHeight() {
        return this._getHeight(this.root);
    }

    /**
     * Override _getHeight to handle Trie's Map-based children
     * @private
     * @param {TrieNode} node - Current node
     * @returns {number} Height from this node
     */
    _getHeight(node) {
        if (!node || node.children.size === 0) return 0;
        
        let maxHeight = 0;
        for (const child of node.children.values()) {
            maxHeight = Math.max(maxHeight, this._getHeight(child));
        }
        
        return 1 + maxHeight;
    }

    /**
     * Get all words in trie
     * @returns {string[]}
     */
    getAllWords() {
        const words = [];
        this._collectWords(this.root, '', words);
        return words;
    }

    /**
     * Collect all words recursively
     * @private
     */
    _collectWords(node, prefix, words) {
        if (node.isEndOfWord) {
            words.push(prefix);
        }

        for (const [char, childNode] of node.children) {
            this._collectWords(childNode, prefix + char, words);
        }
    }

    /**
     * Get size (word count)
     */
    getSize() {
        return this.wordCount;
    }

    /**
     * Clear the trie
     */
    clear() {
        this.root = new TrieNode('ROOT');
        this.nodeCount = 0;
        this.wordCount = 0;
        super.clear();
    }

    /**
     * Convert to tree structure for visualization
     * This is a simplified representation
     */
    toArray() {
        const nodes = [];
        this._collectNodes(this.root, nodes);
        return nodes;
    }

    /**
     * Collect nodes for visualization
     * @private
     */
    _collectNodes(node, nodes) {
        nodes.push(node);
        for (const childNode of node.children.values()) {
            this._collectNodes(childNode, nodes);
        }
    }
}

// Export
if (typeof window !== 'undefined') {
    window.Trie = Trie;
    window.TrieNode = TrieNode;
}
