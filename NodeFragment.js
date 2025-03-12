const { parentPort, workerData } = require('worker_threads');
const Logger = require('./Logger');

parentPort.on('message', async (message) => {
    try {
        if (!message || !message.action) {
            throw new Error('Invalid message format');
        }
        
        const { action } = message;
        
        if (action === 'evaluate') {
            try {
                const result = await fragmentEvaluate(workerData.fragmentId);
                const responseData = {
                    fragmentId: workerData.fragmentId,
                    value: result
                };
                Logger.fragmentEvaluation(workerData.fragmentId, result);
                parentPort.postMessage(responseData);
            } catch (evalError) {
                Logger.fragmentEvaluation(workerData.fragmentId, `ERROR: ${evalError.message}`);
                parentPort.postMessage({
                    fragmentId: workerData.fragmentId,
                    error: evalError.message,
                    value: null
                });
            }
        } else {
            Logger.fragmentEvaluation(workerData.fragmentId, `Unknown action: ${action}`);
            parentPort.postMessage({
                fragmentId: workerData.fragmentId,
                error: `Unknown action: ${action}`,
                value: null
            });
        }
    } catch (error) {
        console.error(`Worker thread error (Fragment #${workerData.fragmentId}):`, error);
        parentPort.postMessage({
            fragmentId: workerData.fragmentId || 'unknown',
            error: error.message,
            value: null
        });
    }
});

function fragmentEvaluate(fragmentId) {
    const fragmentResponses = {
        1: 'Hello ',
        2: 'from ',
        3: 'Node.js ',
        4: 'Threading!'
    };
    
    const response = fragmentResponses[fragmentId];
    if (response === undefined) {
        throw new Error(`Invalid fragment ID: ${fragmentId}`);
    }
    
    return response;
}