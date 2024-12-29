const { parentPort, workerData } = require('worker_threads');
const Logger = require('./Logger');

parentPort.on('message', async ({ action }) => {
    if (action === 'evaluate') {
        const result = await fragmentEvaluate(workerData.fragmentId);
        const responseData = {
            fragmentId: workerData.fragmentId,
            value: result
        };
        Logger.fragmentEvaluation(workerData.fragmentId, result);
        parentPort.postMessage(responseData);
    }
});

function fragmentEvaluate(fragmentId) {
    const fragmentResponses = {
        1: 'Hello ',
        2: 'from ',
        3: 'Node.js ',
        4: 'Threading!'
    };
    
    return fragmentResponses[fragmentId];
}