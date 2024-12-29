const Logger = require('./Logger');

class NodeQueueBuffer {
    constructor() {
        this.queue = [];
    }

    push(data) {
        if (data && data.fragmentId) {
            Logger.copyNQS(data.fragmentId, data.value);
        }
        this.queue.push(data);
    }

    pop() {
        const data = this.queue.shift();
        return data;
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}

module.exports = NodeQueueBuffer;