const SocketController = require('./SocketController');
const Logger = require('./Logger');

class VirtualCache {
    constructor() {
        this.cache = new Map();
        this.socketController = new SocketController();
    }

    connectToMemoryController(memoryController) {
        this.socketController.connect(this, memoryController);
    }

    async write(data, fromSocket = false) {
        try {
            if (this.socketController.isConnected && !fromSocket) {
                const cacheKey = await this.socketController.writeSocket.write(data);
                Logger.writeCacheableData('VirtualCache', `Writing through socket, key: ${cacheKey}`);
                return cacheKey;
            } else {
                const cacheKey = `fragment_${Date.now()}`;
                this.cache.set(cacheKey, data);
                Logger.writeCacheableData('VirtualCache', `Direct write, key: ${cacheKey}, value: ${JSON.stringify(data)}`);
                return cacheKey;
            }
        } catch (error) {
            Logger.writeCacheableData('VirtualCache', `Error writing data: ${error.message}`);
            throw error;
        }
    }

    async read(key, fromSocket = false) {
        try {
            if (!key) {
                throw new Error('Invalid cache key');
            }
            
            const data = this.cache.get(key);
            
            if (!data && !fromSocket) {
                Logger.writeCacheableData('VirtualCache', `Cache miss for key: ${key}`);
                return null;
            }
            
            if (this.socketController.isConnected && !fromSocket) {
                Logger.writeCacheableData('VirtualCache', `Reading through socket, key: ${key}`);
                return await this.socketController.readSocket.read(key);
            }
            
            Logger.writeCacheableData('VirtualCache', `Direct read, key: ${key}`);
            return data;
        } catch (error) {
            Logger.writeCacheableData('VirtualCache', `Error reading data: ${error.message}`);
            throw error;
        }
    }
}

module.exports = VirtualCache;