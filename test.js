const MainApplication = require('./index.js');
const MemoryMonitor = require('./MemoryMonitor');

async function test() {
    const app = new MainApplication();
    
    await app.sayHello();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n=== Memory Stacks Monitoring Report ===\n');
    
    for (let i = 1; i <= 8; i++) {
        const report = MemoryMonitor.generateReport(i);
        if (report) {
            console.log(`\nStack #${i} Report:`);
            console.log('Health Status:', report.health.status);
            console.log('Summary:', report.summary);
            console.log('Operations:', report.details.operations);
            console.log('Current Memory Usage:', 
                `${report.details.memory.currentSize} / ${report.details.memory.peakSize}`);
            console.log('----------------------');
        }
    }
}

test();