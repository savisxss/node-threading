const Logger = require('./Logger');

class MemoryMonitor {
    constructor() {
        this.statistics = new Map();
        this.snapshots = new Map();
        this.monitoringInterval = null;
    }

    initializeStackMonitoring(stackId) {
        this.statistics.set(stackId, {
            operations: {
                reads: 0,
                writes: 0,
                optimizations: 0,
                errors: 0
            },
            performance: {
                averageOperationTime: 0,
                totalOperationTime: 0,
                operationCount: 0
            },
            memory: {
                currentSize: 0,
                peakSize: 0,
                lastOptimizationTime: null
            },
            health: {
                status: 'healthy',
                lastCheck: Date.now(),
                errorRate: 0,
                lockCount: 0
            }
        });
    }

    recordOperation(stackId, operationType, duration) {
        const stats = this.statistics.get(stackId);
        if (!stats) return;
    
        if (!(operationType in stats.operations)) {
            stats.operations[operationType] = 0;
        }
    
        stats.operations[operationType]++;
        stats.performance.totalOperationTime += duration;
        stats.performance.operationCount++;
        
        if (stats.performance.operationCount > 0) {
            stats.performance.averageOperationTime = 
                stats.performance.totalOperationTime / stats.performance.operationCount;
        } else {
            stats.performance.averageOperationTime = 0;
        }
    }

    updateMemoryStats(stackId, currentSize) {
        const stats = this.statistics.get(stackId);
        if (!stats) return;

        stats.memory.currentSize = currentSize;
        stats.memory.peakSize = Math.max(stats.memory.peakSize, currentSize);
    }

    takeSnapshot(stackId) {
        const currentStats = this.statistics.get(stackId);
        if (!currentStats) return;

        const snapshot = {
            timestamp: Date.now(),
            ...JSON.parse(JSON.stringify(currentStats))
        };

        if (!this.snapshots.has(stackId)) {
            this.snapshots.set(stackId, []);
        }
        
        const stackSnapshots = this.snapshots.get(stackId);
        stackSnapshots.push(snapshot);

        if (stackSnapshots.length > 100) {
            stackSnapshots.shift();
        }
    }

    getStackHealth(stackId) {
        const stats = this.statistics.get(stackId);
        if (!stats) return null;
    
        const errorThreshold = 0.1;
        const lockThreshold = 5;
        
        const operationCount = Math.max(1, stats.performance.operationCount);
        const errorRate = stats.operations.errors / operationCount;
        
        if (errorRate > errorThreshold) {
            stats.health.status = 'critical';
        } else if (stats.memory.currentSize > 0 && 
                   stats.memory.currentSize / stats.memory.peakSize > 0.9) {
            stats.health.status = 'warning';
        } else if (stats.health.lockCount > lockThreshold) {
            stats.health.status = 'warning';
        } else {
            stats.health.status = 'healthy';
        }
    
        stats.health.lastCheck = Date.now();
        stats.health.errorRate = errorRate;
    
        return stats.health;
    }

    getStackStatistics(stackId) {
        return this.statistics.get(stackId);
    }

    getStackHistory(stackId, timeRange) {
        const stackSnapshots = this.snapshots.get(stackId) || [];
        const now = Date.now();
        return stackSnapshots.filter(snapshot => 
            now - snapshot.timestamp <= timeRange
        );
    }

    generateReport(stackId) {
        const stats = this.statistics.get(stackId);
        if (!stats) return null;

        const health = this.getStackHealth(stackId);
        
        return {
            stackId,
            timestamp: Date.now(),
            health,
            summary: {
                operationCount: stats.performance.operationCount,
                averageOperationTime: stats.performance.averageOperationTime.toFixed(2) + 'ms',
                currentMemoryUsage: `${stats.memory.currentSize} / ${stats.memory.peakSize}`,
                errorRate: (stats.health.errorRate * 100).toFixed(2) + '%'
            },
            details: stats
        };
    }

    startMonitoring(interval = 60000) {
        this.monitoringInterval = setInterval(() => {
            for (const [stackId] of this.statistics) {
                const health = this.getStackHealth(stackId);
                this.takeSnapshot(stackId);

                const statusColors = {
                    healthy: '\x1b[32m',
                    warning: '\x1b[33m',
                    critical: '\x1b[31m'
                };

                Logger.memoryStackOperation(stackId, 'MONITOR', 
                    `${statusColors[health.status]}Status: ${health.status}\x1b[0m, ` +
                    `Error Rate: ${(health.errorRate * 100).toFixed(2)}%, ` +
                    `Lock Count: ${health.lockCount}`
                );
            }
        }, interval);
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
}

module.exports = new MemoryMonitor();