const Logger = require('./Logger');
const MemoryMonitor = require('./MemoryMonitor');

class MemoryController {
    constructor() {
        this.memoryStacks = new Array(8).fill(null).map((_, i) => ({
            id: i + 1,
            type: i % 2 === 0 ? 'F' : 'S',
            data: [],
            lastAccess: Date.now(),
            isLocked: false,
            lockTimeout: null,
            accessCount: 0,
            errorCount: 0
        }));
        this.maxErrorThreshold = 5;
        this.lockTimeoutDuration = 5000;
        this.maxStackSize = 1000;
        this.criticalMemoryThreshold = 0.9;
        
        Logger.memoryStackOperation('ALL', 'INIT', 'Memory stacks initialized with safety features');
        
        this.memoryStacks.forEach(stack => {
            MemoryMonitor.initializeStackMonitoring(stack.id);
        });
        
        this.startHealthCheck();
        MemoryMonitor.startMonitoring();
    }

    async writeCacheableData(data) {
        const startTime = Date.now();

        if (!this.validateData(data)) {
            Logger.memoryStackOperation('ALL', 'ERROR', 'Invalid data format detected');
            throw new Error('Invalid data format');
        }

        const targetStack = this.findOptimalStack(data);
        if (!targetStack) {
            Logger.memoryStackOperation('ALL', 'ERROR', 'No available memory stack found');
            throw new Error('No available memory stack');
        }

        try {
            await this.lockStack(targetStack.id);
            targetStack.accessCount++;

            if (this.isStackNearCapacity(targetStack)) {
                await this.handleCriticalMemory(targetStack);
            }

            targetStack.data.push(data);
            targetStack.lastAccess = Date.now();
            Logger.memoryStackOperation(targetStack.id, 'WRITE', 
                `Data written to stack, current size: ${targetStack.data.length}, access count: ${targetStack.accessCount}`);

            await this.balanceMemoryStacks();

            const duration = Date.now() - startTime;
            MemoryMonitor.recordOperation(targetStack.id, 'writes', duration);
            MemoryMonitor.updateMemoryStats(targetStack.id, targetStack.data.length);
        } catch (error) {
            targetStack.errorCount++;
            Logger.memoryStackOperation(targetStack.id, 'ERROR', `Write operation failed: ${error.message}`);
            
            if (targetStack.errorCount >= this.maxErrorThreshold) {
                await this.handleStackFailure(targetStack);
            }
            throw error;
        } finally {
            await this.unlockStack(targetStack.id);
        }
    }

    findOptimalStack(data) {
        const dataType = typeof data === 'function' ? 'F' : 'S';
        const optimalStack = this.memoryStacks
            .filter(stack => 
                stack.type === dataType && 
                !stack.isLocked && 
                !this.isStackNearCapacity(stack) &&
                stack.errorCount < this.maxErrorThreshold)
            .sort((a, b) => a.data.length - b.data.length)[0];
        
        if (optimalStack) {
            Logger.memoryStackOperation(optimalStack.id, 'SELECT', 
                `Selected as optimal stack for type: ${dataType}, current load: ${optimalStack.data.length}`);
        }
        return optimalStack;
    }

    validateData(data) {
        if (data === null || data === undefined) return false;
        if (typeof data === 'function') return true;
        try {
            JSON.stringify(data);
            return true;
        } catch {
            return false;
        }
    }

    isStackNearCapacity(stack) {
        return stack.data.length > (this.maxStackSize * this.criticalMemoryThreshold);
    }

    async handleCriticalMemory(stack) {
        Logger.memoryStackOperation(stack.id, 'CRITICAL', 
            `Memory usage critical (${stack.data.length}/${this.maxStackSize})`);
        const startTime = Date.now();
        
        await this.optimizeStack(stack);
        
        if (this.isStackNearCapacity(stack)) {
            await this.redistributeData(stack);
        }

        MemoryMonitor.recordOperation(stack.id, 'optimizations', Date.now() - startTime);
    }

    async redistributeData(sourceStack) {
        const targetStacks = this.memoryStacks.filter(s => 
            s.id !== sourceStack.id && 
            s.type === sourceStack.type && 
            !this.isStackNearCapacity(s)
        );

        if (targetStacks.length === 0) {
            throw new Error('No available stacks for redistribution');
        }

        const itemsToRedistribute = Math.floor(sourceStack.data.length * 0.3);
        const itemsPerStack = Math.floor(itemsToRedistribute / targetStacks.length);

        for (const targetStack of targetStacks) {
            const items = sourceStack.data.splice(0, itemsPerStack);
            targetStack.data.push(...items);
            Logger.memoryStackOperation(targetStack.id, 'REDISTRIBUTE', 
                `Received ${items.length} items from stack ${sourceStack.id}`);
            MemoryMonitor.updateMemoryStats(targetStack.id, targetStack.data.length);
        }
        
        MemoryMonitor.updateMemoryStats(sourceStack.id, sourceStack.data.length);
    }

    async handleStackFailure(stack) {
        Logger.memoryStackOperation(stack.id, 'FAILURE', 
            `Stack exceeded error threshold (${stack.errorCount}/${this.maxErrorThreshold})`);
        
        const backupData = [...stack.data];
        try {
            stack.data = [];
            stack.errorCount = 0;
            stack.accessCount = 0;
            
            for (const item of backupData) {
                if (this.validateData(item)) {
                    stack.data.push(item);
                }
            }
            
            Logger.memoryStackOperation(stack.id, 'RECOVERY', 
                `Stack recovered with ${stack.data.length}/${backupData.length} items`);
            MemoryMonitor.updateMemoryStats(stack.id, stack.data.length);
        } catch (error) {
            Logger.memoryStackOperation(stack.id, 'CRITICAL', 
                `Stack recovery failed: ${error.message}`);
            throw new Error('Stack recovery failed');
        }
    }

    async lockStack(stackId) {
        const stack = this.memoryStacks.find(s => s.id === stackId);
        if (!stack) throw new Error('Invalid stack ID');

        if (stack.isLocked) {
            throw new Error('Stack is already locked');
        }

        stack.isLocked = true;
        
        stack.lockTimeout = setTimeout(() => {
            if (stack.isLocked) {
                Logger.memoryStackOperation(stackId, 'TIMEOUT', 'Force unlocking stack after timeout');
                stack.isLocked = false;
                stack.errorCount++;
                MemoryMonitor.recordOperation(stackId, 'errors', this.lockTimeoutDuration);
            }
        }, this.lockTimeoutDuration);

        Logger.memoryStackOperation(stackId, 'LOCK', 'Stack locked with timeout protection');
    }

    async unlockStack(stackId) {
        const stack = this.memoryStacks.find(s => s.id === stackId);
        if (!stack) throw new Error('Invalid stack ID');

        if (stack.lockTimeout) {
            clearTimeout(stack.lockTimeout);
            stack.lockTimeout = null;
        }

        stack.isLocked = false;
        Logger.memoryStackOperation(stackId, 'UNLOCK', 'Stack unlocked');
    }

    async balanceMemoryStacks() {
        for (const stack of this.memoryStacks) {
            if (stack.data.length > this.maxStackSize) {
                Logger.memoryStackOperation(stack.id, 'BALANCE', 
                    `Stack exceeded max size (${this.maxStackSize}), optimizing...`);
                await this.optimizeStack(stack);
            }
        }
    }

    async optimizeStack(stack) {
        const startTime = Date.now();
        const originalSize = stack.data.length;
        const itemsToKeep = Math.floor(stack.data.length * 0.8);
        
        if (stack.data[0] && stack.data[0].lastAccess) {
            stack.data.sort((a, b) => b.lastAccess - a.lastAccess);
        }
        
        stack.data = stack.data.slice(-itemsToKeep);
        Logger.memoryStackOperation(stack.id, 'OPTIMIZE', 
            `Stack optimized: ${originalSize} -> ${stack.data.length} items`);
            
        MemoryMonitor.recordOperation(stack.id, 'optimizations', Date.now() - startTime);
        MemoryMonitor.updateMemoryStats(stack.id, stack.data.length);
    }

    async processReadData(data) {
        const startTime = Date.now();

        if (!this.validateData(data)) {
            Logger.memoryStackOperation('ALL', 'ERROR', 'Invalid data format detected during read');
            throw new Error('Invalid data format');
        }

        const result = typeof data === 'function' ? 
            await this.processFunctionData(data) : 
            await this.processStaticData(data);
            
        const duration = Date.now() - startTime;
        const targetStack = this.memoryStacks.find(s => s.type === (typeof data === 'function' ? 'F' : 'S'));
        if (targetStack) {
            MemoryMonitor.recordOperation(targetStack.id, 'reads', duration);
        }
        
        return result;
    }

    async processFunctionData(func) {
        const targetStack = this.memoryStacks.find(s => s.type === 'F' && !s.isLocked);
        if (targetStack) {
            targetStack.lastAccess = Date.now();
            targetStack.accessCount++;
            Logger.memoryStackOperation(targetStack.id, 'READ', 
                `Function data processed, access count: ${targetStack.accessCount}`);
        }
        return func;
    }

    async processStaticData(data) {
        const targetStack = this.memoryStacks.find(s => s.type === 'S' && !s.isLocked);
        if (targetStack) {
            targetStack.lastAccess = Date.now();
            targetStack.accessCount++;
            Logger.memoryStackOperation(targetStack.id, 'READ', 
                `Static data processed, access count: ${targetStack.accessCount}`);
        }
        return data;
    }

    startHealthCheck() {
        setInterval(() => {
            this.memoryStacks.forEach(stack => {
                const healthStatus = {
                    size: stack.data.length,
                    errorRate: stack.errorCount / Math.max(1, stack.accessCount),
                    lastAccess: Date.now() - stack.lastAccess,
                    isLocked: stack.isLocked
                };

                if (healthStatus.errorRate > 0.1 ||
                    healthStatus.lastAccess > 300000 ||
                    (stack.isLocked && !stack.lockTimeout)) {
                    
                    Logger.memoryStackOperation(stack.id, 'HEALTH', 
                        `Unhealthy stack detected: ${JSON.stringify(healthStatus)}`);
                }

                MemoryMonitor.takeSnapshot(stack.id);
            });
        }, 60000);
    }
}

module.exports = MemoryController;