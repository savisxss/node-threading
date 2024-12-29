const Logger = require('./Logger');

class SocketController {
    constructor() {
        this.readSocket = null;
        this.writeSocket = null;
        this.isConnected = false;
    }

    connect(virtualCache, memoryController) {
        this.readSocket = {
            read: async (key) => {
                const data = await virtualCache.read(key, true);
                Logger.socketOperation('READ', `Key: ${key}`);
                return memoryController.processReadData(data);
            }
        };

        this.writeSocket = {
            write: async (data) => {
                const cacheKey = await virtualCache.write(data, true);
                Logger.socketOperation('WRITE', `Key: ${cacheKey}, Data: ${JSON.stringify(data)}`);
                await memoryController.writeCacheableData(data);
                return cacheKey;
            }
        };

        Logger.socketOperation('CONNECT', 'Socket controller initialized');
        this.isConnected = true;
    }

    disconnect() {
        Logger.socketOperation('DISCONNECT', 'Socket controller disconnected');
        this.readSocket = null;
        this.writeSocket = null;
        this.isConnected = false;
    }
}

module.exports = SocketController;