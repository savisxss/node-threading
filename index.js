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
            const fragment = new Worker('./NodeFragment.js', {
                workerData: { fragmentId: i }
            });

            fragment.on('message', async (data) => {
                const nqsCopy = JSON.parse(JSON.stringify(data));
                this.queueBuffer.push(nqsCopy);
                await this.processQueueData();
            });

            this.fragments.push(fragment);
        }
    }

    async processQueueData() {
        while (!this.queueBuffer.isEmpty()) {
            const data = this.queueBuffer.pop();
            if (data) {
                await this.virtualCache.write(data);
            }
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
}

module.exports = MainApplication;