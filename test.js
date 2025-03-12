const MainApplication = require('./index.js');
const MemoryMonitor = require('./MemoryMonitor');

async function test() {
    let app;
    
    try {
        console.log('Starting test...');
        app = new MainApplication();
        
        const result = await app.sayHello();
        console.log('Message:', result);
        
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
    } catch (error) {
        console.error('Test failed with error:', error);
    } finally {
        if (app && typeof app.shutdown === 'function') {
            await app.shutdown();
        }
    }
}

// Process interrupt handling
process.on('SIGINT', async () => {
    console.log('Received SIGINT signal. Gracefully shutting down...');
    // Wait for test() to be called and closed
    setTimeout(() => {
        console.log('Forced exit after timeout');
        process.exit(0);
    }, 5000);
});

test().catch(error => {
    console.error('Unhandled error in test:', error);
    process.exit(1);
});