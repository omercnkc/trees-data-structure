/**
 * TreeLab - Event Bus (Observer Pattern Implementation)
 * 
 * Purpose: Provides a centralized event system for decoupled communication
 * between components following the Observer pattern.
 * 
 * SOLID Principles:
 * - Single Responsibility: Manages event subscription and emission only
 * - Open/Closed: Can add new event types without modifying existing code
 * - Dependency Inversion: Components depend on EventBus abstraction, not concrete implementations
 */

class EventBus {
    constructor() {
        this.events = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event to subscribe to
     * @param {Function} callback - Function to call when event is emitted
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        
        this.events.get(eventName).push(callback);
        
        // Return unsubscribe function
        return () => this.off(eventName, callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback to remove
     */
    off(eventName, callback) {
        if (!this.events.has(eventName)) return;
        
        const callbacks = this.events.get(eventName);
        const index = callbacks.indexOf(callback);
        
        if (index > -1) {
            callbacks.splice(index, 1);
        }
        
        // Clean up if no more callbacks
        if (callbacks.length === 0) {
            this.events.delete(eventName);
        }
    }

    /**
     * Emit an event
     * @param {string} eventName - Name of the event to emit
     * @param {*} data - Data to pass to callbacks
     */
    emit(eventName, data) {
        if (!this.events.has(eventName)) return;
        
        const callbacks = this.events.get(eventName);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event handler for ${eventName}:`, error);
            }
        });
    }

    /**
     * Subscribe to an event once (auto-unsubscribe after first emission)
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback function
     */
    once(eventName, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(eventName, onceCallback);
        };
        
        this.on(eventName, onceCallback);
    }

    /**
     * Clear all event listeners
     */
    clear() {
        this.events.clear();
    }

    /**
     * Get all registered event names
     * @returns {string[]} Array of event names
     */
    getEventNames() {
        return Array.from(this.events.keys());
    }
}

// Export a singleton instance
const eventBus = new EventBus();

// Event name constants to prevent typos (following best practices)
const EVENTS = {
    // Tree operation events
    NODE_INSERTED: 'tree:node:inserted',
    NODE_DELETED: 'tree:node:deleted',
    NODE_SEARCHED: 'tree:node:searched',
    TREE_RESET: 'tree:reset',
    
    // Animation events
    ANIMATION_START: 'animation:start',
    ANIMATION_PAUSE: 'animation:pause',
    ANIMATION_RESUME: 'animation:resume',
    ANIMATION_STEP: 'animation:step',
    ANIMATION_COMPLETE: 'animation:complete',
    ANIMATION_SPEED_CHANGED: 'animation:speed:changed',
    
    // Traversal events
    TRAVERSAL_START: 'traversal:start',
    TRAVERSAL_STEP: 'traversal:step',
    TRAVERSAL_COMPLETE: 'traversal:complete',
    
    // UI events
    TREE_TYPE_CHANGED: 'ui:tree:type:changed',
    SIDEBAR_TOGGLE: 'ui:sidebar:toggle',
    TAB_CHANGED: 'ui:tab:changed',
    
    // Error events
    ERROR_OCCURRED: 'error:occurred'
};

// Make both available globally (or use ES6 modules if preferred)
if (typeof window !== 'undefined') {
    window.EventBus = EventBus;
    window.eventBus = eventBus;
    window.EVENTS = EVENTS;
}
