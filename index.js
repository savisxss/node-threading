const { Worker } = require('worker_threads');
const NodeQueueBuffer = require('./NodeQueueBuffer');
const VirtualCache = require('./VirtualCache');
const MemoryController = require('./MemoryController');

class MainApplication {
    constructor() {
        this.fragments = [];
        this.queueBuffer = new NodeQueueBuffer();
        this.virtualCache = new VirtualCache();
        this.memoryController = new MemoryController();
        
        this.virtualCache.connectToMemoryController(this.memoryController);
        
        this.initializeFragments();
    }

    initializeFragments() {
        for (let i = 1; i <= 4; i++) {
            try {
                const fragment = new Worker('./NodeFragment.js', {
                    workerData: { fragmentId: i }
                });
    
                fragment.on('message', async (data) => {
                    try {
                        const nqsCopy = JSON.parse(JSON.stringify(data));
                        this.queueBuffer.push(nqsCopy);
                        await this.processQueueData();
                    } catch (error) {
                        console.error(`Error processing message from fragment #${i}:`, error);
                    }
                });
    
                fragment.on('error', (error) => {
                    console.error(`Error in worker thread #${i}:`, error);
                });
    
                fragment.on('exit', (code) => {
                    if (code !== 0) {
                        console.error(`Worker thread #${i} exited with code ${code}`);
                    }
                });
    
                this.fragments.push(fragment);
            } catch (error) {
                console.error(`Error initializing fragment #${i}:`, error);
            }
        }
    }

    async processQueueData() {
        try {
            while (!this.queueBuffer.isEmpty()) {
                const data = this.queueBuffer.pop();
                if (data) {
                    try {
                        await this.virtualCache.write(data);
                    } catch (error) {
                        console.error('Error writing data to virtual cache:', error);
                    }
                }
            }
        } catch (error) {
            console.error('Error processing queue data:', error);
        }
    }

    async sayHello() {
        const results = await Promise.all(this.fragments.map(async (fragment, index) => {
            return new Promise((resolve) => {
                fragment.postMessage({ action: 'evaluate', fragmentId: index + 1 });
                fragment.once('message', (data) => resolve(data.value));
            });
        }));
        
        return results.reduce((acc, curr) => acc + curr, '');
    }

    async shutdown() {
        try {
            console.log('Shutting down application...');
            
            // Terminate all worker threads
            for (const fragment of this.fragments) {
                fragment.terminate();
            }
            
            // Disconnect the virtual cache from memory controller
            if (this.virtualCache.socketController) {
                this.virtualCache.socketController.disconnect();
            }
            
            // Stop memory monitoring
            const MemoryMonitor = require('./MemoryMonitor');
            MemoryMonitor.stopMonitoring();
            
            console.log('Application shutdown complete');
        } catch (error) {
            console.error('Error during shutdown:', error);
        }
    }
}

module.exports = MainApplication;