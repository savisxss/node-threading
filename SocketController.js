const Logger = require('./Logger');

class SocketController {
    constructor() {
        this.readSocket = null;
        this.writeSocket = null;
        this.isConnected = false;
    }

    connect(virtualCache, memoryController) {
        if (!virtualCache || !memoryController) {
            throw new Error('Invalid connection parameters: virtualCache and memoryController are required');
        }
    
        this.readSocket = {
            read: async (key) => {
                if (!this.isConnected) {
                    throw new Error('Socket is not connected');
                }
                try {
                    const data = await virtualCache.read(key, true);
                    Logger.socketOperation('READ', `Key: ${key}`);
                    return await memoryController.processReadData(data);
                } catch (error) {
                    Logger.socketOperation('READ_ERROR', `Key: ${key}, Error: ${error.message}`);
                    throw error;
                }
            }
        };
    
        this.writeSocket = {
            write: async (data) => {
                if (!this.isConnected) {
                    throw new Error('Socket is not connected');
                }
                try {
                    const cacheKey = await virtualCache.write(data, true);
                    Logger.socketOperation('WRITE', 
                        `Key: ${cacheKey}, Data: ${JSON.stringify(data).substring(0, 100)}${JSON.stringify(data).length > 100 ? '...' : ''}`);
                    await memoryController.writeCacheableData(data);
                    return cacheKey;
                } catch (error) {
                    Logger.socketOperation('WRITE_ERROR', `Error: ${error.message}`);
                    throw error;
                }
            }
        };
    
        Logger.socketOperation('CONNECT', 'Socket controller initialized');
        this.isConnected = true;
    }

    disconnect() {
        try {
            if (this.isConnected) {
                Logger.socketOperation('DISCONNECT', 'Socket controller disconnected');
                this.readSocket = null;
                this.writeSocket = null;
                this.isConnected = false;
            } else {
                Logger.socketOperation('DISCONNECT_WARNING', 'Attempted to disconnect an already disconnected socket');
            }
        } catch (error) {
            console.error('Error during socket disconnect:', error);
            // Make sure isConnected is set to false regardless of the error
            this.isConnected = false;
        }
    }
}

module.exports = SocketController;