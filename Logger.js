class Logger {
    constructor() {
        this.enabled = true;
        this.colors = {
            fragment: '\x1b[33m',
            copy: '\x1b[32m',
            socket: '\x1b[35m',
            write: '\x1b[30m',
            stack: '\x1b[36m',
            reset: '\x1b[0m'
        };
    }

    fragmentEvaluation(fragmentId, data) {
        if (this.enabled) {
            console.log(`${this.colors.fragment}[Fragment #${fragmentId}] Evaluating: ${data}${this.colors.reset}`);
        }
    }

    copyNQS(fragmentId, data) {
        if (this.enabled) {
            console.log(`${this.colors.copy}[Copy NQS] Fragment #${fragmentId} -> NodeQueueBuffer: ${data}${this.colors.reset}`);
        }
    }

    socketOperation(type, data) {
        if (this.enabled) {
            console.log(`${this.colors.socket}[Socket ${type}] ${data}${this.colors.reset}`);
        }
    }

    writeCacheableData(source, data) {
        if (this.enabled) {
            console.log(`${this.colors.write}[Write] ${source} -> Memory Controller: ${data}${this.colors.reset}`);
        }
    }

    memoryStackOperation(stackId, type, data) {
        if (this.enabled) {
            console.log(`${this.colors.stack}[Stack #${stackId}][${type}] ${data}${this.colors.reset}`);
        }
    }
}

module.exports = new Logger();