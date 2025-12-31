/**
 * TreeLab - Trees Page Controller
 * 
 * Purpose: Main controller for the trees.html page
 * Coordinates tree selection, visualization, and user interactions
 */

// Global state
let currentTree = null;
let currentVisualizer = null;
let currentTreeType = 'bst';
let animationSpeed = 1;

// Tree type information
const treeInfo = {
    bst: {
        title: 'Binary Search Tree',
        description: 'Binary Search Tree (BST), her düğümün en fazla iki child\'a sahip olduğu ve sol alt ağaçtaki tüm değerlerin kökten küçük, sağ alt ağaçtakilerinse büyük olduğu bir ağaç yapısıdır. Hızlı arama, ekleme ve silme işlemleri için kullanılır.',
        complexity: [
            { operation: 'Search (Arama)', average: 'O(log n)', worst: 'O(n)' },
            { operation: 'Insert (Ekleme)', average: 'O(log n)', worst: 'O(n)' },
            { operation: 'Delete (Silme)', average: 'O(log n)', worst: 'O(n)' },
            { operation: 'Space (Alan)', average: 'O(n)', worst: 'O(n)' }
        ],
        sampleValues: [50, 30, 70, 20, 40, 60, 80]
    },
    avl: {
        title: 'AVL Tree',
        description: 'AVL Tree, otomatik olarak dengeli kalan bir BST\'dir. Her düğümün sol ve sağ alt ağaçlarının yükseklik farkı en fazla 1\'dir. Ekleme ve silme işlemlerinden sonra rotasyonlarla dengelenir. Garantili O(log n) performans sağlar.',
        complexity: [
            { operation: 'Search (Arama)', average: 'O(log n)', worst: 'O(log n)' },
            { operation: 'Insert (Ekleme)', average: 'O(log n)', worst: 'O(log n)' },
            { operation: 'Delete (Silme)', average: 'O(log n)', worst: 'O(log n)' },
            { operation: 'Space (Alan)', average: 'O(n)', worst: 'O(n)' }
        ],
        sampleValues: [30, 20, 40, 10, 25, 35, 50]
    },
    redblack: {
        title: 'Red-Black Tree',
        description: 'Red-Black Tree, her düğümün RED veya BLACK renge sahip olduğu self-balancing BST\'dir. Renk kuralları sayesinde ağaç dengeli kalır ve garantili O(log n) performans sağlar. Genellikle hash table ve set implementasyonlarında kullanılır.',
        complexity: [
            { operation: 'Search (Arama)', average: 'O(log n)', worst: 'O(log n)' },
            { operation: 'Insert (Ekleme)', average: 'O(log n)', worst: 'O(log n)' },
            { operation: 'Delete (Silme)', average: 'O(log n)', worst: 'O(log n)' },
            { operation: 'Space (Alan)', average: 'O(n)', worst: 'O(n)' }
        ],
        sampleValues: [20, 15, 25, 10, 5, 1, 30]
    },
    heap: {
        title: 'Min Heap',
        description: 'Min Heap, complete binary tree özelliğine sahip ve her parent node\'un child node\'larından küçük veya eşit olduğu bir ağaç yapısıdır. Priority queue implementasyonlarında, heap sort algoritmasında ve Dijkstra gibi graph algoritmalarında kullanılır.',
        complexity: [
            { operation: 'Find Min (En Küçük)', average: 'O(1)', worst: 'O(1)' },
            { operation: 'Insert (Ekleme)', average: 'O(log n)', worst: 'O(log n)' },
            { operation: 'Delete Min (Silme)', average: 'O(log n)', worst: 'O(log n)' },
            { operation: 'Space (Alan)', average: 'O(n)', worst: 'O(n)' }
        ],
        sampleValues: [10, 20, 15, 30, 40, 25, 50]
    },
    trie: {
        title: 'Trie (Prefix Tree)',
        description: 'Trie, string saklama ve arama için özelleşmiş bir ağaç yapısıdır. Her kenar bir karakteri temsil eder. Autocomplete, spell checking, IP routing gibi uygulamalarda kullanılır. Prefix aramada çok verimlidir.',
        complexity: [
            { operation: 'Search (Kelime Arama)', average: 'O(m)', worst: 'O(m)' },
            { operation: 'Insert (Kelime Ekleme)', average: 'O(m)', worst: 'O(m)' },
            { operation: 'Delete (Kelime Silme)', average: 'O(m)', worst: 'O(m)' },
            { operation: 'Space (Alan)', average: 'O(ALPHABET_SIZE * m * n)', worst: 'O(ALPHABET_SIZE * m * n)' }
        ],
        sampleValues: ['merhaba', 'mercan', 'masa', 'araba', 'armut', 'test', 'trie']
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupEventListeners();
    loadTreeFromURL();
});

/**
 * Initialize page components
 */
function initializePage() {
    // Create visualizer
    currentVisualizer = new TreeVisualizer('treeCanvas');
    
    // Create initial tree
    switchTree('bst');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Sidebar tree type selection
    const treeLinks = document.querySelectorAll('[data-tree-type]');
    treeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (!link.classList.contains('disabled')) {
                const treeType = link.getAttribute('data-tree-type');
                switchTree(treeType);
                
                // Update active state
                treeLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    // Control buttons
    document.getElementById('btnInsert').addEventListener('click', handleInsert);
    document.getElementById('btnDelete').addEventListener('click', handleDelete);
    document.getElementById('btnSearch').addEventListener('click', handleSearch);
    document.getElementById('btnReset').addEventListener('click', handleReset);
    document.getElementById('btnRandom').addEventListener('click', handleRandomInsert);
    document.getElementById('btnSample').addEventListener('click', handleSampleInsert);
    
    // Input - Enter key
    document.getElementById('inputValue').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleInsert();
        }
    });
    
    // Speed slider
    const speedSlider = document.getElementById('speedSlider');
    speedSlider.addEventListener('input', (e) => {
        animationSpeed = parseFloat(e.target.value);
        document.getElementById('speedLabel').textContent = animationSpeed + 'x';
    });
    
    // Traversal buttons
    document.getElementById('btnInorder').addEventListener('click', () => handleTraversal('inorder'));
    document.getElementById('btnPreorder').addEventListener('click', () => handleTraversal('preorder'));
    document.getElementById('btnPostorder').addEventListener('click', () => handleTraversal('postorder'));
    document.getElementById('btnLevelOrder').addEventListener('click', () => handleTraversal('levelorder'));
    
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
            
            // Update active state
            tabButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Copy code button
    document.getElementById('btnCopyCode').addEventListener('click', handleCopyCode);
}

/**
 * Switch to a different tree type
 */
function switchTree(treeType) {
    currentTreeType = treeType;
    currentTree = TreeFactory.createTree(treeType);
    currentVisualizer.setTree(currentTree);
    
    // Update UI
    updateTreeInfo();
    
    // Update URL without reload
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('type', treeType);
    window.history.pushState({}, '', url);

    // Show/Hide Balance button (only for BST)
    const btnBalance = document.getElementById('btnBalance');
    if (btnBalance) {
        btnBalance.style.display = treeType === 'bst' ? 'inline-block' : 'none';
        
        // Ensure event listener is attached (idempotent)
        if (treeType === 'bst' && !btnBalance.hasAttribute('data-initialized')) {
            btnBalance.addEventListener('click', handleBalance);
            btnBalance.setAttribute('data-initialized', 'true');
        }
    }
}

/**
 * Handle balance operation
 */
function handleBalance() {
    if (!currentTree || typeof currentTree.balance !== 'function') return;
    
    // Balance the tree
    currentTree.balance();
    
    // Redraw
    currentVisualizer.draw();
    
    // Update info
    updateTreeStats();
}

/**
 * Load tree type from URL parameter
 */
function loadTreeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const treeType = urlParams.get('type');
    
    if (treeType && treeInfo[treeType]) {
        // Find and click the corresponding sidebar link
        const link = document.querySelector(`[data-tree-type="${treeType}"]`);
        if (link && !link.classList.contains('disabled')) {
            link.click();
        }
    }
}

/**
 * Update tree information display
 */
function updateTreeInfo() {
    const info = treeInfo[currentTreeType];
    
    document.getElementById('treeTitle').textContent = info.title;
    document.getElementById('treeDescription').textContent = info.description;
    updateTreeStats();
    updateComplexityTable();
}

/**
 * Update tree statistics
 */
function updateTreeStats() {
    document.getElementById('nodeCount').textContent = currentTree.getSize();
    document.getElementById('treeHeight').textContent = currentTree.getHeight();
}

/**
 * Update complexity table
 */
function updateComplexityTable() {
    const info = treeInfo[currentTreeType];
    const tbody = document.getElementById('complexityTableBody');
    
    tbody.innerHTML = info.complexity.map(row => `
        <tr>
            <td>${row.operation}</td>
            <td>${row.average}</td>
            <td>${row.worst}</td>
        </tr>
    `).join('');
}

/**
 * Get input value
 */
function getInputValue() {
    const input = document.getElementById('inputValue');
    
    // For Trie, accept string values
    if (currentTreeType === 'trie') {
        const value = input.value.trim();
        if (value.length === 0) {
            alert('Lütfen geçerli bir kelime girin');
            return null;
        }
        return value;
    }
    
    // For numeric trees
    const value = parseInt(input.value);
    
    if (isNaN(value)) {
        alert('Lütfen geçerli bir sayı girin');
        return null;
    }
    
    return value;
}

/**
 * Handle insert operation
 */
function handleInsert() {
    const value = getInputValue();
    if (value === null) return;
    
    currentTree.insert(value);
    currentVisualizer.draw();
    updateTreeStats();
    
    // Clear input
    document.getElementById('inputValue').value = '';
}

/**
 * Handle delete operation
 */
function handleDelete() {
    // Special case for Heap - deletes minimum element
    if (currentTreeType === 'heap') {
        if (currentTree.isEmpty()) {
            alert('Heap boş!');
            return;
        }
        
        const deleted = currentTree.delete();
        if (!deleted) {
            alert('Silme işlemi başarısız');
        } else {
            alert('Minimum eleman silindi');
        }
        
        currentVisualizer.draw();
        updateTreeStats();
        return;
    }
    
    // For other trees, get value from input
    const value = getInputValue();
    if (value === null) return;
    
    const deleted = currentTree.delete(value);
    if (!deleted) {
        alert(`Değer ${value} ağaçta bulunamadı`);
    }
    
    currentVisualizer.draw();
    updateTreeStats();
    
    // Clear input
    document.getElementById('inputValue').value = '';
}

/**
 * Handle search operation
 */
function handleSearch() {
    const value = getInputValue();
    if (value === null) return;
    
    const node = currentTree.search(value);
    
    if (node) {
        currentVisualizer.highlightNode(node, 'highlight');
        alert(`Değer ${value} bulundu!`);
    } else {
        alert(`Değer ${value} ağaçta bulunamadı`);
        currentVisualizer.clearHighlights();
    }
}

/**
 * Handle reset operation
 */
function handleReset() {
    if (confirm('Ağacı sıfırlamak istediğinizden emin misiniz?')) {
        currentTree.clear();
        currentVisualizer.draw();
        updateTreeStats();
    }
}

/**
 * Handle random insert
 */
function handleRandomInsert() {
    for (let i = 0; i < 5; i++) {
        const randomValue = Math.floor(Math.random() * 100) + 1;
        currentTree.insert(randomValue);
    }
    
    currentVisualizer.draw();
    updateTreeStats();
}

/**
 * Handle sample insert
 */
function handleSampleInsert() {
    const info = treeInfo[currentTreeType];
    
    if (confirm('Örnek değerler eklenecek. Devam edilsin mi?')) {
        currentTree.clear();
        
        // Special handling for Trie (strings)
        if (currentTreeType === 'trie') {
            info.sampleValues.forEach(word => {
                currentTree.insert(word);
            });
        } else {
            // Numeric values
            info.sampleValues.forEach(value => {
                currentTree.insert(value);
            });
        }
        
        currentVisualizer.draw();
        updateTreeStats();
    }
}

/**
 * Handle traversal
 */
function handleTraversal(type) {
    if (currentTree.isEmpty()) {
        document.getElementById('traversalResult').textContent = 'Ağaç boş!';
        return;
    }
    
    const values = [];
    
    switch (type) {
        case 'inorder':
            currentTree.inorderTraversal(node => values.push(node.value));
            break;
        case 'preorder':
            currentTree.preorderTraversal(node => values.push(node.value));
            break;
        case 'postorder':
            currentTree.postorderTraversal(node => values.push(node.value));
            break;
        case 'levelorder':
            currentTree.levelOrderTraversal(node => values.push(node.value));
            break;
    }
    
    const methodNames = {
        inorder: 'Inorder (Sol-Kök-Sağ)',
        preorder: 'Preorder (Kök-Sol-Sağ)',
        postorder: 'Postorder (Sol-Sağ-Kök)',
        levelorder: 'Level Order (Seviye Seviye)'
    };
    
    document.getElementById('traversalResult').innerHTML = `
        <strong>${methodNames[type]}:</strong><br>
        ${values.join(' → ')}
    `;
}

/**
 * Switch tab
 */
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const tabMap = {
        traversal: 'tabTraversal',
        code: 'tabCode',
        complexity: 'tabComplexity'
    };
    
    document.getElementById(tabMap[tabName]).classList.add('active');
}

/**
 * Handle copy code
 */
function handleCopyCode() {
    const codeContent = document.getElementById('codeContent').textContent;
    
    navigator.clipboard.writeText(codeContent).then(() => {
        const btn = document.getElementById('btnCopyCode');
        const originalText = btn.textContent;
        btn.textContent = 'Kopyalandı! ✓';
        
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Kopyalama hatası:', err);
        alert('Kod kopyalanamadı');
    });
}
